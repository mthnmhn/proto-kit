import type { Plugin } from 'vite';
import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

function json(res: any, data: any, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: string) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

/** Recursively collect all files in a directory */
function walkDir(dir: string, base: string = dir): { file: string; data: string }[] {
  const results: { file: string; data: string }[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkDir(full, base));
    } else {
      const rel = relative(base, full);
      const content = readFileSync(full);
      results.push({
        file: rel,
        data: content.toString('base64'),
      });
    }
  }
  return results;
}

/** Get current git HEAD hash */
function getHeadHash(cwd: string): string {
  try {
    return execSync('git rev-parse HEAD', { cwd, encoding: 'utf-8', timeout: 5000 }).trim();
  } catch {
    return '';
  }
}

export default function vercelApi(): Plugin {
  return {
    name: 'vercel-api',
    configureServer(server) {
      const cwd = server.config.root;

      server.middlewares.use('/api/vercel', async (req, res) => {
        const url = req.url || '';

        try {
          // POST /api/vercel/deploy
          if (url === '/deploy' && req.method === 'POST') {
            const body = await parseBody(req);
            const token = body.token;
            const projectName = body.projectName || 'prototype';

            if (!token) {
              return json(res, { error: 'Vercel token is required. Add it in Prototype Settings → Deployment.' }, 400);
            }

            // Capture git hash before build
            const commitHash = getHeadHash(cwd);

            // Step 1: Build
            try {
              execSync('npm run build', { cwd, encoding: 'utf-8', timeout: 120000 });
            } catch (e: any) {
              const output = e.stdout?.trim() || e.stderr?.trim() || e.message;
              const lines = output.split('\n');
              const tail = lines.slice(-15).join('\n');
              return json(res, { error: `Build failed:\n${tail}` }, 500);
            }

            // Step 2: Collect dist files
            const distDir = join(cwd, 'dist');
            let files: { file: string; data: string }[];
            try {
              files = walkDir(distDir);
            } catch (e: any) {
              return json(res, { error: `Could not read dist/: ${e.message}` }, 500);
            }

            if (files.length === 0) {
              return json(res, { error: 'Build produced no files in dist/' }, 500);
            }

            // Step 3: Deploy to Vercel via API
            const payload = {
              name: projectName,
              files: files.map((f) => ({
                file: f.file,
                data: f.data,
                encoding: 'base64',
              })),
              projectSettings: {
                framework: null,
                outputDirectory: '.',
              },
              target: 'production',
            };

            const vercelRes = await fetch('https://api.vercel.com/v13/deployments', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            const vercelData: any = await vercelRes.json();

            if (!vercelRes.ok) {
              const errMsg = vercelData.error?.message || vercelData.error?.code || JSON.stringify(vercelData.error) || 'Unknown Vercel API error';
              return json(res, { error: `Vercel API error: ${errMsg}` }, vercelRes.status);
            }

            // Step 4: Fetch the project's production aliases (stable URL)
            let productionUrl = '';
            try {
              const projRes = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (projRes.ok) {
                const projData: any = await projRes.json();
                const aliases: string[] = projData.targets?.production?.alias || projData.alias || [];
                // Prefer the .vercel.app domain
                const vercelAlias = aliases.find((a: string) => a.endsWith('.vercel.app'));
                productionUrl = vercelAlias
                  ? `https://${vercelAlias}`
                  : aliases.length > 0
                    ? `https://${aliases[0]}`
                    : '';
              }
            } catch {
              // Non-critical — we still have the deployment URL
            }

            return json(res, {
              ok: true,
              url: `https://${vercelData.url}`,
              productionUrl,
              deploymentId: vercelData.id,
              readyState: vercelData.readyState,
              projectName: vercelData.name,
              commitHash,
              createdAt: Date.now(),
            });
          }

          // GET /api/vercel/status?id=xxx&token=xxx
          if (url.startsWith('/status') && req.method === 'GET') {
            const params = new URLSearchParams(url.split('?')[1] || '');
            const id = params.get('id');
            const token = params.get('token');

            if (!id || !token) {
              return json(res, { error: 'Missing id or token' }, 400);
            }

            const vercelRes = await fetch(`https://api.vercel.com/v13/deployments/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const data: any = await vercelRes.json();

            if (!vercelRes.ok) {
              return json(res, { error: data.error?.message || 'Failed to fetch status' }, vercelRes.status);
            }

            return json(res, {
              readyState: data.readyState,
              url: data.url ? `https://${data.url}` : null,
              createdAt: data.createdAt,
            });
          }

          // GET /api/vercel/project?name=xxx&token=xxx
          if (url.startsWith('/project') && req.method === 'GET') {
            const params = new URLSearchParams(url.split('?')[1] || '');
            const name = params.get('name');
            const token = params.get('token');

            if (!name || !token) {
              return json(res, { error: 'Missing name or token' }, 400);
            }

            const projRes = await fetch(`https://api.vercel.com/v9/projects/${name}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const projData: any = await projRes.json();

            if (!projRes.ok) {
              return json(res, { error: projData.error?.message || 'Project not found' }, projRes.status);
            }

            const aliases: string[] = projData.targets?.production?.alias || projData.alias || [];
            const vercelAlias = aliases.find((a: string) => a.endsWith('.vercel.app'));
            const productionUrl = vercelAlias
              ? `https://${vercelAlias}`
              : aliases.length > 0
                ? `https://${aliases[0]}`
                : '';

            return json(res, {
              productionUrl,
              aliases,
            });
          }

          // GET /api/vercel/deployments?project=xxx&token=xxx
          if (url.startsWith('/deployments') && req.method === 'GET') {
            const params = new URLSearchParams(url.split('?')[1] || '');
            const project = params.get('project');
            const token = params.get('token');

            if (!project || !token) {
              return json(res, { error: 'Missing project or token' }, 400);
            }

            const vercelRes = await fetch(
              `https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(project)}&limit=20&target=production`,
              { headers: { Authorization: `Bearer ${token}` } },
            );

            const data: any = await vercelRes.json();

            if (!vercelRes.ok) {
              return json(res, { error: data.error?.message || 'Failed to list deployments' }, vercelRes.status);
            }

            const deployments = (data.deployments || []).map((d: any) => ({
              id: d.uid,
              url: d.url ? `https://${d.url}` : '',
              state: d.state || d.readyState,
              created: d.created || d.createdAt,
              meta: d.meta || {},
            }));

            return json(res, { deployments });
          }

          json(res, { error: 'Not found' }, 404);
        } catch (e: any) {
          json(res, { error: e.message }, 500);
        }
      });
    },
  };
}
