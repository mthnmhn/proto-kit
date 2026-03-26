import type { Plugin } from 'vite';
import { exec, execSync } from 'child_process';

// Shared env that disables interactive prompts so git never blocks the server
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: '' };

function run(cmd: string, cwd: string): string {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', timeout: 15000, env: GIT_ENV }).trim();
  } catch (e: any) {
    throw new Error(e.stderr?.trim() || e.message);
  }
}

function runAsync(cmd: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, encoding: 'utf-8', timeout: 120000, env: GIT_ENV }, (err, stdout, stderr) => {
      if (err) {
        const msg = stderr?.trim() || err.message;
        // Detect auth failures and give a clear message
        if (msg.includes('Authentication failed') || msg.includes('could not read Username') || msg.includes('terminal prompts disabled')) {
          reject(new Error('Authentication failed. Add a GitHub Personal Access Token in Prototype Settings → Git to authenticate.'));
        } else {
          reject(new Error(msg));
        }
      } else {
        resolve((stdout || '').trim());
      }
    });
  });
}

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

// Injects a token into an HTTPS remote URL: https://github.com/... → https://<token>@github.com/...
function injectToken(remoteUrl: string, token: string): string {
  if (!token) return remoteUrl;
  try {
    const url = new URL(remoteUrl);
    url.username = token;
    url.password = '';
    return url.toString();
  } catch {
    // Not a valid URL (could be SSH), return as-is
    return remoteUrl;
  }
}

export default function gitApi(): Plugin {
  return {
    name: 'git-api',
    configureServer(server) {
      const cwd = server.config.root;

      server.middlewares.use('/api/git', async (req, res) => {
        const url = req.url || '';

        try {
          // GET /api/git/status
          if (url === '/status' && req.method === 'GET') {
            const porcelain = run('git status --porcelain', cwd);
            const files = porcelain
              ? porcelain.split('\n').map((line) => ({
                  status: line.substring(0, 2).trim(),
                  path: line.substring(3),
                }))
              : [];
            const branch = run('git branch --show-current', cwd);
            return json(res, { branch, files });
          }

          // GET /api/git/log
          if (url === '/log' && req.method === 'GET') {
            const raw = run(
              'git log --pretty=format:"%H||%an||%ae||%ar||%s" -50',
              cwd
            );
            const commits = raw
              ? raw.split('\n').map((line) => {
                  const [hash, author, email, date, ...msgParts] =
                    line.split('||');
                  return {
                    hash,
                    author,
                    email,
                    date,
                    message: msgParts.join('||'),
                  };
                })
              : [];
            return json(res, { commits });
          }

          // GET /api/git/config
          if (url === '/config' && req.method === 'GET') {
            let name = '';
            let email = '';
            let remote = '';
            try {
              name = run('git config user.name', cwd);
            } catch {}
            try {
              email = run('git config user.email', cwd);
            } catch {}
            try {
              remote = run('git remote get-url origin', cwd);
            } catch {}
            return json(res, { name, email, remote });
          }

          // POST /api/git/config
          if (url === '/config' && req.method === 'POST') {
            const body = await parseBody(req);
            if (body.name !== undefined)
              run(`git config user.name "${body.name}"`, cwd);
            if (body.email !== undefined)
              run(`git config user.email "${body.email}"`, cwd);
            if (body.remote !== undefined) {
              try {
                run('git remote get-url origin', cwd);
                run(`git remote set-url origin "${body.remote}"`, cwd);
              } catch {
                run(`git remote add origin "${body.remote}"`, cwd);
              }
            }
            return json(res, { ok: true });
          }

          // POST /api/git/commit
          if (url === '/commit' && req.method === 'POST') {
            const body = await parseBody(req);
            const message = body.message || 'Update prototype';
            run('git add -A', cwd);
            const result = run(`git commit -m "${message.replace(/"/g, '\\"')}"`, cwd);
            return json(res, { ok: true, result });
          }

          // POST /api/git/push
          if (url === '/push' && req.method === 'POST') {
            const body = await parseBody(req);
            let remote = '';
            try {
              remote = run('git remote get-url origin', cwd);
            } catch {
              return json(res, { ok: false, error: 'No remote configured. Add a remote URL in Prototype Settings first.' }, 400);
            }
            const branch = run('git branch --show-current', cwd);
            // If a token is provided, use it for this push by temporarily setting the authenticated URL
            const token = body?.token || '';
            if (token && remote.startsWith('http')) {
              const authUrl = injectToken(remote, token);
              const result = await runAsync(`git push "${authUrl}" ${branch}`, cwd);
              return json(res, { ok: true, result, remote, branch });
            }
            const result = await runAsync(`git push -u origin ${branch}`, cwd);
            return json(res, { ok: true, result, remote, branch });
          }

          json(res, { error: 'Not found' }, 404);
        } catch (e: any) {
          json(res, { error: e.message }, 500);
        }
      });
    },
  };
}
