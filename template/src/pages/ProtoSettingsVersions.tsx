import { useEffect, useState } from 'react';
import {
  Info,
  Settings,
  History,
  Navigation,
  Loader2,
  GitCommitHorizontal,
  Upload,
  Rocket,
  ExternalLink,
  Circle,
} from 'lucide-react';
import { AppShell, type NavSection } from '@/components/layout';
import { git, type GitCommit } from '@/lib/git';
import { vercel, type VercelDeployment } from '@/lib/vercel';
import { useDeployStore, type PushRecord } from '@/state/deploy-store';
import { useAppStore } from '@/state/app-store';

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

/* ── Timeline types ── */
type TimelineCommit = { type: 'commit'; ts: number; data: GitCommit };
type TimelinePush = { type: 'push'; ts: number; data: PushRecord };
type TimelineDeploy = { type: 'deploy'; ts: number; data: VercelDeployment };
type TimelineItem = TimelineCommit | TimelinePush | TimelineDeploy;

function parseRelativeDate(rel: string): number {
  // git log --pretty=%ar gives "2 hours ago", "3 days ago" etc.
  const now = Date.now();
  const match = rel.match(/(\d+)\s+(second|minute|hour|day|week|month|year)/);
  if (!match) return now;
  const n = parseInt(match[1], 10);
  const unit = match[2];
  const ms: Record<string, number> = {
    second: 1000, minute: 60000, hour: 3600000,
    day: 86400000, week: 604800000, month: 2592000000, year: 31536000000,
  };
  return now - n * (ms[unit] || 0);
}

function buildTimeline(
  commits: GitCommit[],
  pushes: PushRecord[],
  vercelDeploys: VercelDeployment[],
): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const c of commits) {
    items.push({ type: 'commit', ts: parseRelativeDate(c.date), data: c });
  }

  for (const p of pushes) {
    items.push({ type: 'push', ts: p.createdAt, data: p });
  }

  for (const d of vercelDeploys) {
    items.push({ type: 'deploy', ts: d.created, data: d });
  }

  // Sort newest first
  items.sort((a, b) => b.ts - a.ts);

  return items;
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

const stateColors: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  READY: { bg: 'bg-green-50', text: 'text-green-700', dot: 'text-green-500', label: 'Live' },
  BUILDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'text-yellow-500', label: 'Building' },
  QUEUED: { bg: 'bg-grey-50', text: 'text-grey-600', dot: 'text-grey-400', label: 'Queued' },
  ERROR: { bg: 'bg-red-50', text: 'text-red-700', dot: 'text-red-500', label: 'Failed' },
  CANCELED: { bg: 'bg-grey-50', text: 'text-grey-500', dot: 'text-grey-400', label: 'Canceled' },
};

function DeployBadge({ state }: { state: string }) {
  const s = stateColors[state] || stateColors.QUEUED;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-4xs font-medium ${s.bg} ${s.text}`}>
      <Circle className={`h-1.5 w-1.5 fill-current ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function ProtoSettingsVersions() {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [vercelDeploys, setVercelDeploys] = useState<VercelDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pushes = useDeployStore((s) => s.pushes);
  const vercelToken = useAppStore((s) => s.vercelToken);
  const vercelProjectName = useAppStore((s) => s.vercelProjectName);

  useEffect(() => {
    const promises: Promise<void>[] = [];

    promises.push(
      git.log()
        .then((data: any) => setCommits(data.commits))
        .catch((e: any) => setError(e.message)),
    );

    if (vercelToken && vercelProjectName) {
      promises.push(
        vercel.deployments(vercelProjectName, vercelToken)
          .then((data) => setVercelDeploys(data.deployments))
          .catch(() => {}), // Non-critical
      );
    }

    Promise.all(promises).finally(() => setLoading(false));
  }, []);

  const timeline = buildTimeline(commits, pushes, vercelDeploys);

  return (
    <AppShell
      title="Prototype Settings"
      secondaryNav={navSections}
      ribbonActiveIndex={-1}
    >
      <div className="space-y-4 p-6">
        <section>
          <h1 className="text-xs font-semibold text-grey-800">Versions</h1>
          <p className="mt-0.5 text-3xs text-grey-400">
            Commits, pushes, and deployments.
          </p>
        </section>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-3xs text-grey-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading history...
          </div>
        ) : error ? (
          <p className="py-8 text-3xs text-red-500">{error}</p>
        ) : timeline.length === 0 ? (
          <p className="py-8 text-center text-3xs text-grey-400">
            No activity yet.
          </p>
        ) : (
          <div className="space-y-0">
            {timeline.map((item, i) => {
              const isLast = i === timeline.length - 1;

              if (item.type === 'deploy') {
                const d = item.data;
                return (
                  <div key={`deploy-${d.id}`} className="flex gap-3">
                    <div className="flex w-4 flex-col items-center">
                      <div className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-green-100">
                        <Rocket className="h-2.5 w-2.5 text-green-600" />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-grey-200" />}
                    </div>
                    <div className="min-w-0 pb-4">
                      <div className="flex items-center gap-2">
                        <p className="text-2xs font-medium text-grey-800">
                          Deployed to Vercel
                        </p>
                        <DeployBadge state={d.state} />
                      </div>
                      {d.url && (
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 flex items-center gap-1 text-4xs text-blue-600 hover:underline"
                        >
                          {d.url.replace('https://', '')}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                      <p className="mt-0.5 text-4xs text-grey-400">
                        {formatTimeAgo(d.created)}
                        {d.meta?.githubCommitSha && (
                          <>
                            {' · '}
                            <code className="font-mono">
                              {d.meta.githubCommitSha.substring(0, 7)}
                            </code>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              }

              if (item.type === 'push') {
                const p = item.data;
                return (
                  <div key={p.id} className="flex gap-3">
                    <div className="flex w-4 flex-col items-center">
                      <div className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-purple-100">
                        <Upload className="h-2.5 w-2.5 text-purple-600" />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-grey-200" />}
                    </div>
                    <div className="min-w-0 pb-4">
                      <p className="text-2xs font-medium text-grey-800">
                        Pushed to {p.branch}
                      </p>
                      <p className="mt-0.5 text-4xs text-grey-400">
                        {formatTimeAgo(p.createdAt)}
                        {p.commitHash && (
                          <>
                            {' · '}
                            <code className="font-mono">
                              {p.commitHash.substring(0, 7)}
                            </code>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              }

              // commit
              const c = item.data;
              const isFirstCommit = timeline.slice(0, i).every((t) => t.type !== 'commit');
              return (
                <div key={c.hash} className="flex gap-3">
                  <div className="flex w-4 flex-col items-center">
                    <div
                      className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                        isFirstCommit ? 'bg-blue-100' : 'bg-grey-100'
                      }`}
                    >
                      <GitCommitHorizontal
                        className={`h-2.5 w-2.5 ${
                          isFirstCommit ? 'text-blue-600' : 'text-grey-400'
                        }`}
                      />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-grey-200" />}
                  </div>
                  <div className="min-w-0 pb-4">
                    <p className="text-2xs font-medium text-grey-800">
                      {c.message}
                    </p>
                    <p className="mt-0.5 text-4xs text-grey-400">
                      {c.author} · {c.date}
                    </p>
                    <code className="mt-0.5 block font-mono text-4xs text-grey-300">
                      {c.hash.substring(0, 7)}
                    </code>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
