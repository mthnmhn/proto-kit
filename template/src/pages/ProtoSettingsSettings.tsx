import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Info,
  Settings,
  History,
  Navigation,
  Loader2,
  Check,
  Rocket,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppShell, type NavSection } from '@/components/layout';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/state/app-store';
import { git } from '@/lib/git';
import { vercel } from '@/lib/vercel';
import { useDeployStore } from '@/state/deploy-store';

const navSections: NavSection[] = [
  {
    items: [
      { icon: Info, label: 'About', route: '/proto-settings/about' },
      { icon: Settings, label: 'Settings', route: '/proto-settings/settings' },
      { icon: Navigation, label: 'Navigation', route: '/proto-settings/navigation' },
      { icon: History, label: 'Versions', route: '/proto-settings/versions' },
    ],
  },
];

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr] items-start gap-6">
      <div>
        <p className="text-2xs font-medium text-grey-800">{label}</p>
        {description && (
          <p className="mt-0.5 text-3xs text-grey-400">{description}</p>
        )}
      </div>
      <div className="max-w-[360px]">{children}</div>
    </div>
  );
}

function HelpBox({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/60 text-3xs leading-relaxed text-grey-600">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium text-blue-700 hover:bg-blue-50"
      >
        <HelpCircle className="h-3.5 w-3.5 shrink-0 text-blue-500" />
        <span className="flex-1">{title}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-blue-400 transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && <div className="border-t border-blue-200 px-4 py-3">{children}</div>}
    </div>
  );
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type DeployResult = {
  ok: boolean;
  url?: string;
  deploymentId?: string;
  error?: string;
};

export default function ProtoSettingsSettings() {
  const {
    protoSettings,
    updateProtoSettings,
    gitToken,
    setGitToken,
    vercelToken,
    setVercelToken,
    vercelProjectName,
    setVercelProjectName,
  } = useAppStore();
  const addDeployment = useDeployStore((s) => s.addDeployment);

  const [draft, setDraft] = useState(protoSettings);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(protoSettings);

  // Git config state
  const [gitTokenDraft, setGitTokenDraft] = useState('');
  const [gitName, setGitName] = useState('');
  const [gitEmail, setGitEmail] = useState('');
  const [gitRemote, setGitRemote] = useState('');
  const [gitLoading, setGitLoading] = useState(true);
  const [gitSaving, setGitSaving] = useState(false);
  const [gitSaved, setGitSaved] = useState(false);
  const [gitOriginal, setGitOriginal] = useState({ name: '', email: '', remote: '' });

  // Vercel state
  const [vercelTokenDraft, setVercelTokenDraft] = useState(vercelToken);
  const [vercelProjectDraft, setVercelProjectDraft] = useState(
    vercelProjectName || slugify(protoSettings.name),
  );
  const [vercelSaved, setVercelSaved] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);

  const location = useLocation();
  const deployRef = useRef<HTMLDivElement>(null);
  const isDeployHash = location.hash === '#deployment';

  useEffect(() => {
    if (isDeployHash && deployRef.current) {
      setTimeout(() => {
        deployRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isDeployHash]);

  useEffect(() => {
    setGitTokenDraft(gitToken);
    git
      .config()
      .then((cfg: any) => {
        setGitName(cfg.name);
        setGitEmail(cfg.email);
        setGitRemote(cfg.remote);
        setGitOriginal({ name: cfg.name, email: cfg.email, remote: cfg.remote });
        setGitLoading(false);
      })
      .catch(() => setGitLoading(false));
  }, []);

  const gitHasChanges =
    gitName !== gitOriginal.name ||
    gitEmail !== gitOriginal.email ||
    gitRemote !== gitOriginal.remote ||
    gitTokenDraft !== gitToken;

  const vercelHasChanges =
    vercelTokenDraft !== vercelToken ||
    vercelProjectDraft !== (vercelProjectName || slugify(protoSettings.name));

  const handleSave = () => {
    updateProtoSettings(draft);
  };

  const handleGitSave = async () => {
    setGitSaving(true);
    try {
      await git.setConfig({ name: gitName, email: gitEmail, remote: gitRemote });
      setGitToken(gitTokenDraft);
      setGitOriginal({ name: gitName, email: gitEmail, remote: gitRemote });
      setGitSaved(true);
      setTimeout(() => setGitSaved(false), 2000);
    } catch {}
    setGitSaving(false);
  };

  const handleVercelSave = () => {
    setVercelToken(vercelTokenDraft);
    setVercelProjectName(vercelProjectDraft);
    setVercelSaved(true);
    setTimeout(() => setVercelSaved(false), 2000);
  };

  const handleDeploy = async () => {
    const token = vercelToken || vercelTokenDraft;
    const project = vercelProjectName || vercelProjectDraft;
    if (!token) {
      setDeployResult({ ok: false, error: 'Save a Vercel token first.' });
      return;
    }
    setDeploying(true);
    setDeployResult(null);
    try {
      const data = await vercel.deploy(token, project);
      const prodUrl = data.productionUrl || data.url;
      setDeployResult({ ok: true, url: prodUrl, deploymentId: data.deploymentId });
      addDeployment({
        id: data.deploymentId,
        url: data.url,
        productionUrl: prodUrl,
        commitHash: data.commitHash || '',
        createdAt: data.createdAt || Date.now(),
        projectName: data.projectName || project,
      });
      if (data.deploymentId) pollDeployment(data.deploymentId, token);
    } catch (e: any) {
      setDeployResult({ ok: false, error: e.message });
    }
    setDeploying(false);
  };

  const pollDeployment = async (id: string, token: string) => {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const status = await vercel.status(id, token);
        if (status.readyState === 'READY') {
          setDeployResult((prev) =>
            prev ? { ...prev, ok: true, url: status.url || prev.url } : prev,
          );
          return;
        }
        if (status.readyState === 'ERROR') {
          setDeployResult((prev) =>
            prev ? { ...prev, ok: false, error: 'Deployment failed on Vercel.' } : prev,
          );
          return;
        }
      } catch {}
    }
  };

  return (
    <AppShell
      title="Prototype Settings"
      secondaryNav={navSections}
      ribbonActiveIndex={-1}
    >
      <div className="space-y-8 p-6">
        {/* ─── General ─── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <section>
              <h1 className="text-xs font-semibold text-grey-800">General</h1>
              <p className="mt-0.5 text-3xs text-grey-400">
                These settings apply to the entire prototype.
              </p>
            </section>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges}
              className="text-3xs"
            >
              Save changes
            </Button>
          </div>

          <Field label="Prototype name" description="Shows as the browser tab title.">
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="My Prototype"
              className="h-8 text-3xs"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="A short description of what this prototype does."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-3xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </Field>

          <Field label="Author">
            <Input
              value={draft.author}
              onChange={(e) => setDraft({ ...draft, author: e.target.value })}
              placeholder="Your name"
              className="h-8 text-3xs"
            />
          </Field>

          <Field label="Header title" description="Appears next to the logo in the top header.">
            <Input
              value={draft.headerTitle}
              onChange={(e) => setDraft({ ...draft, headerTitle: e.target.value })}
              placeholder="SaaS Management"
              className="h-8 text-3xs"
            />
          </Field>
        </div>

        <div className="border-t border-grey-200" />

        {/* ─── Git ─── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <section>
              <h1 className="text-xs font-semibold text-grey-800">Git & GitHub</h1>
              <p className="mt-0.5 text-3xs text-grey-400">
                Version control and backup for your prototype.
              </p>
            </section>
            <Button
              size="sm"
              onClick={handleGitSave}
              disabled={!gitHasChanges || gitLoading}
              className="text-3xs"
            >
              {gitSaved ? (
                <>
                  <Check className="mr-1 h-3 w-3" /> Saved
                </>
              ) : gitSaving ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : null}
              {!gitSaved && !gitSaving && 'Save git config'}
            </Button>
          </div>

          <HelpBox title="What is Git and why do I need it?">
            <p>
              Your prototype lives on your computer. Git saves snapshots of your
              work (called <strong>commits</strong>) so you can undo mistakes and
              track changes over time. Connecting a <strong>GitHub repository</strong>{' '}
              gives you a backup in the cloud — if anything happens to your laptop,
              your work is safe. It also lets you use <strong>Vercel</strong> (below)
              to share your prototype with others via a live URL.
            </p>
            <p className="mt-2 font-medium text-grey-700">Setup in 3 steps:</p>
            <ol className="mt-1 list-inside list-decimal space-y-0.5">
              <li>Fill in your name and email below (this tags your commits)</li>
              <li>
                Create a GitHub repository at{' '}
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  github.com/new
                </a>{' '}
                and paste the HTTPS URL below
              </li>
              <li>
                Create a{' '}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=Prototype+push"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  GitHub Personal Access Token
                </a>{' '}
                with <strong>repo</strong> scope and paste it below
              </li>
            </ol>
            <p className="mt-1.5 text-4xs text-grey-500">
              Once configured, use the <strong>Commit</strong> and <strong>Push</strong> options
              in the zluri menu (top-right) to save and upload your changes.
            </p>
          </HelpBox>

          {gitLoading ? (
            <div className="flex items-center gap-2 text-3xs text-grey-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading git config...
            </div>
          ) : (
            <>
              <Field label="Git user name" description="Used as the author in commits.">
                <Input
                  value={gitName}
                  onChange={(e) => setGitName(e.target.value)}
                  placeholder="Your Name"
                  className="h-8 text-3xs"
                />
              </Field>

              <Field label="Git email" description="Used as the email in commits.">
                <Input
                  value={gitEmail}
                  onChange={(e) => setGitEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-8 text-3xs"
                />
              </Field>

              <Field label="Remote URL" description="The GitHub repository URL.">
                <Input
                  value={gitRemote}
                  onChange={(e) => setGitRemote(e.target.value)}
                  placeholder="https://github.com/your-org/repo.git"
                  className="h-8 text-3xs"
                />
              </Field>

              <Field label="GitHub token" description="Personal access token for pushing.">
                <Input
                  type="password"
                  value={gitTokenDraft}
                  onChange={(e) => setGitTokenDraft(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="h-8 text-3xs"
                />
              </Field>
            </>
          )}
        </div>

        <div className="border-t border-grey-200" />

        {/* ─── Deployment ─── */}
        <div ref={deployRef} className="space-y-5">
          <div className="flex items-center justify-between">
            <section>
              <h1 className="text-xs font-semibold text-grey-800">Deployment</h1>
              <p className="mt-0.5 text-3xs text-grey-400">
                Publish your prototype to a live URL with Vercel.
              </p>
            </section>
            <Button
              size="sm"
              onClick={handleVercelSave}
              disabled={!vercelHasChanges}
              className="text-3xs"
            >
              {vercelSaved ? (
                <>
                  <Check className="mr-1 h-3 w-3" /> Saved
                </>
              ) : (
                'Save config'
              )}
            </Button>
          </div>

          <HelpBox title="What is Vercel and why do I need it?" defaultOpen={isDeployHash}>
            <p>
              Right now your prototype only runs on your computer. To share it with
              your team — for feedback, user testing, or reviews — you need to
              publish it to the internet.{' '}
              <strong>Vercel</strong> does this for free: it takes your prototype,
              hosts it on the web, and gives you a shareable link
              (e.g.&nbsp;<span className="font-mono text-4xs">your-project.vercel.app</span>).
            </p>
            <p className="mt-2 font-medium text-grey-700">
              How it works
            </p>
            <p className="mt-0.5">
              The <strong>Deploy to Vercel</strong> button below builds your prototype
              locally and uploads it directly to Vercel — no GitHub connection required.
              You can deploy as many times as you like and the same URL will always
              point to your latest version.
            </p>
            <p className="mt-2 font-medium text-grey-700">
              Want automatic deploys?
            </p>
            <p className="mt-0.5">
              If you'd rather have Vercel rebuild automatically every time you push
              to GitHub, you can connect your GitHub repo in the{' '}
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Vercel dashboard
              </a>. This is optional — the one-click deploy works without it.
            </p>
            <p className="mt-2 font-medium text-grey-700">Setup:</p>
            <ol className="mt-1 list-inside list-decimal space-y-0.5">
              <li>
                Create a free account at{' '}
                <a
                  href="https://vercel.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  vercel.com
                </a>
              </li>
              <li>
                Generate a token at{' '}
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  vercel.com/account/tokens
                </a>{' '}
                and paste it below
              </li>
              <li>Click <strong>Deploy to Vercel</strong> — that's it!</li>
            </ol>
          </HelpBox>

          <Field label="Vercel token" description="Personal access token for deploying.">
            <Input
              type="password"
              value={vercelTokenDraft}
              onChange={(e) => setVercelTokenDraft(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
              className="h-8 text-3xs"
            />
          </Field>

          <Field label="Project name" description="Used in the deployment URL.">
            <Input
              value={vercelProjectDraft}
              onChange={(e) => setVercelProjectDraft(e.target.value)}
              placeholder="my-prototype"
              className="h-8 text-3xs"
            />
          </Field>

          {/* Deploy action */}
          <div className="pt-1">
            {!vercelToken && (
              <div className="mb-3 flex items-start gap-2 rounded-md bg-orange-50 px-3 py-2.5 text-3xs text-orange-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>Save a Vercel token above before deploying.</p>
              </div>
            )}

            <Button
              size="sm"
              onClick={handleDeploy}
              disabled={deploying || !vercelToken}
              className="text-3xs"
            >
              {deploying ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Building & deploying...
                </>
              ) : (
                <>
                  <Rocket className="mr-1.5 h-3 w-3" />
                  Deploy to Vercel
                </>
              )}
            </Button>

            {deployResult && (
              <div
                className={`mt-3 rounded-md px-3 py-2.5 text-3xs ${
                  deployResult.ok
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {deployResult.ok ? (
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      Deployed successfully!
                    </p>
                    {deployResult.url && (
                      <a
                        href={deployResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-600 underline"
                      >
                        {deployResult.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p>{deployResult.error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
