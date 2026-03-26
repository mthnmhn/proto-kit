import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ClipboardCheck,
  Grid2x2,
  HelpCircle,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  GitCommitHorizontal,
  Upload,
  Rocket,
  ExternalLink,
  Circle,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useDeployStore } from '@/state/deploy-store';
import { git } from '@/lib/git';
import { vercel } from '@/lib/vercel';
import CommitModal from '@/components/CommitModal';
import PushModal from '@/components/PushModal';

export default function TopHeader() {
  const headerTitle = useAppStore((s) => s.protoSettings.headerTitle);
  const vercelToken = useAppStore((s) => s.vercelToken);
  const vercelProjectName = useAppStore((s) => s.vercelProjectName);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCommit, setShowCommit] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const latestDeploy = useDeployStore((s) => s.deployments[0] ?? null);
  const addDeployment = useDeployStore((s) => s.addDeployment);
  const [commitsBehind, setCommitsBehind] = useState<number | null>(null);

  // Deploy state
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState('');

  useEffect(() => {
    if (!__DEV__ || !latestDeploy?.commitHash) return;
    git.log().then((data: any) => {
      const commits = data.commits || [];
      const idx = commits.findIndex(
        (c: any) => c.hash === latestDeploy.commitHash || c.hash.startsWith(latestDeploy.commitHash),
      );
      setCommitsBehind(idx === -1 ? null : idx);
    }).catch(() => {});
  }, [latestDeploy?.commitHash]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleDeploy = async () => {
    if (!vercelToken || deploying) return;
    const project = vercelProjectName || 'prototype';
    setDeploying(true);
    setDeployError('');
    try {
      const data = await vercel.deploy(vercelToken, project);
      const prodUrl = data.productionUrl || data.url;
      addDeployment({
        id: data.deploymentId,
        url: data.url,
        productionUrl: prodUrl,
        commitHash: data.commitHash || '',
        createdAt: data.createdAt || Date.now(),
        projectName: data.projectName || project,
      });
      setCommitsBehind(0);
    } catch (e: any) {
      setDeployError(e.message);
    }
    setDeploying(false);
  };

  const hasVercelConfig = !!vercelToken;
  const deployUrl = latestDeploy?.productionUrl || latestDeploy?.url;

  return (
    <>
      <header className="flex h-10 items-center gap-4 bg-[linear-gradient(120.17deg,#001e54_0.86%,#001131_100%)] px-[10px] py-1 text-white">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button type="button" className="grid h-8 w-8 place-items-center rounded-lg">
            <Grid2x2 className="h-4 w-4 text-white/90" />
          </button>

          <div className="flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#35a9ff]">
              <Sparkles className="h-3 w-3 fill-white text-white" />
            </span>
            <span className="whitespace-nowrap text-[14px] font-bold leading-none text-[#f6f7fa]">
              {headerTitle}
            </span>
          </div>
        </div>

        <div className="flex h-7 w-[420px] items-center gap-2 rounded-lg bg-[#1f3d73] px-2 text-[11px] text-[#99a7c3]">
          <Search className="h-4 w-4 text-[#9aa8c4]" />
          <span>Search Zluri (cmd+k)</span>
          <SlidersHorizontal className="ml-auto h-3 w-3 text-[#9aa8c4]" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {[Bell, ClipboardCheck, HelpCircle].map((Icon, index) => (
            <button
              key={`header-icon-${index}`}
              type="button"
              className="grid h-8 w-8 place-items-center rounded-lg"
            >
              <Icon className="h-4 w-4 text-white/90" />
            </button>
          ))}

          {/* Zluri button with dropdown — dev only */}
          {__DEV__ && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-20 items-center justify-center gap-2 rounded-lg border border-[#222] bg-[#001f56] transition-colors hover:bg-[#002a6e]"
            >
              <span className="text-[15px] font-semibold leading-none lowercase text-[#f6f7fa]">
                zluri
              </span>
              <span className="grid h-4 w-4 place-items-center rounded-full border border-white/25 bg-[#42516f] text-[8px] font-medium">
                Z
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[280px] rounded-lg border border-grey-200 bg-white shadow-lg">
                {/* Deployment status */}
                {latestDeploy && deployUrl && (
                  <div className="border-b border-grey-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Circle
                        className={`h-2 w-2 shrink-0 fill-current ${
                          commitsBehind === 0
                            ? 'text-green-500'
                            : 'text-orange-400'
                        }`}
                      />
                      <span className="text-3xs font-medium text-grey-700">
                        {commitsBehind === 0
                          ? 'Deployed — up to date'
                          : commitsBehind !== null
                            ? `${commitsBehind} commit${commitsBehind === 1 ? '' : 's'} ahead of deploy`
                            : 'Deployed'}
                      </span>
                    </div>
                    <a
                      href={deployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-4xs text-blue-600 hover:underline"
                    >
                      {deployUrl.replace('https://', '')}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <p className="mt-0.5 text-4xs text-grey-400">
                      {formatTimeAgo(latestDeploy.createdAt)}
                    </p>
                  </div>
                )}

                {/* Menu items */}
                <div className="py-1.5">
                  <button
                    type="button"
                    onClick={() => { navigate('/proto-settings/settings'); setMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-2xs text-grey-800 hover:bg-grey-100"
                  >
                    <Settings className="h-4 w-4 text-grey-500" />
                    Prototype Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCommit(true); setMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-2xs text-grey-800 hover:bg-grey-100"
                  >
                    <GitCommitHorizontal className="h-4 w-4 text-grey-500" />
                    Commit
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowPush(true); setMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-2xs text-grey-800 hover:bg-grey-100"
                  >
                    <Upload className="h-4 w-4 text-grey-500" />
                    Push
                  </button>

                  {/* Deploy action — inline or link to settings */}
                  {hasVercelConfig ? (
                    <button
                      type="button"
                      onClick={handleDeploy}
                      disabled={deploying}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-2xs text-grey-800 hover:bg-grey-100 disabled:opacity-50"
                    >
                      {deploying ? (
                        <Loader2 className="h-4 w-4 animate-spin text-grey-500" />
                      ) : (
                        <Rocket className="h-4 w-4 text-grey-500" />
                      )}
                      {deploying ? 'Deploying...' : 'Deploy to Vercel'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { navigate('/proto-settings/settings#deployment'); setMenuOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-2xs text-grey-800 hover:bg-grey-100"
                    >
                      <Rocket className="h-4 w-4 text-grey-500" />
                      Setup Deployment
                    </button>
                  )}
                </div>

                {/* Deploy error */}
                {deployError && (
                  <div className="border-t border-grey-200 px-4 py-2.5">
                    <p className="text-3xs text-red-600">{deployError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </header>

      {__DEV__ && showCommit && (
        <CommitModal
          onClose={() => setShowCommit(false)}
          onPush={() => setShowPush(true)}
        />
      )}
      {__DEV__ && showPush && <PushModal onClose={() => setShowPush(false)} />}
    </>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
