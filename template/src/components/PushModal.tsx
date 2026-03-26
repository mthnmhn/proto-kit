import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { git } from '@/lib/git';
import { useAppStore } from '@/state/app-store';
import { useDeployStore } from '@/state/deploy-store';

export default function PushModal({ onClose }: { onClose: () => void }) {
  const gitToken = useAppStore((s) => s.gitToken);
  const addPush = useDeployStore((s) => s.addPush);
  const navigate = useNavigate();
  const [remote, setRemote] = useState('');
  const [branch, setBranch] = useState('');
  const [gitName, setGitName] = useState('');
  const [gitEmail, setGitEmail] = useState('');
  const [uncommittedFiles, setUncommittedFiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    Promise.all([git.config(), git.status()]).then(([cfg, status]) => {
      setRemote(cfg.remote);
      setBranch(status.branch);
      setGitName(cfg.name);
      setGitEmail(cfg.email);
      setUncommittedFiles(status.files.length);
      setLoading(false);
    });
  }, []);

  const handlePush = async () => {
    setPushing(true);
    try {
      const res = await git.push(gitToken);
      setResult({ ok: true, text: `Pushed ${res.branch} to ${res.remote}` });
      // Record the push
      let commitHash = '';
      try {
        const status = await git.log();
        commitHash = status.commits[0]?.hash || '';
      } catch {}
      addPush({
        id: `push-${Date.now()}`,
        branch: res.branch,
        remote: res.remote,
        commitHash,
        createdAt: Date.now(),
      });
    } catch (e: any) {
      setResult({ ok: false, text: e.message });
    }
    setPushing(false);
  };

  const handleGoToSettings = () => {
    onClose();
    navigate('/proto-settings/settings');
  };

  const noIdentity = !loading && (!gitName || !gitEmail);
  const noRemote = !loading && !noIdentity && !remote;
  const noToken = !loading && !noIdentity && remote && !gitToken && remote.startsWith('http');
  const notConfigured = noIdentity || noRemote || noToken;

  // Collect all missing config items
  const missingItems: string[] = [];
  if (noIdentity) missingItems.push('git name and email');
  if (noRemote) missingItems.push('a remote repository URL');
  if (noToken) missingItems.push('a GitHub token');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[480px] rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-grey-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-grey-500" />
            <h2 className="text-2xs font-semibold text-grey-800">Push to remote</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-grey-100">
            <X className="h-4 w-4 text-grey-400" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 px-5 py-4">
          {loading ? (
            <div className="flex items-center gap-2 text-3xs text-grey-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking configuration...
            </div>
          ) : result ? (
            <div
              className={`rounded-md px-3 py-2 text-3xs ${
                result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {result.text}
            </div>
          ) : notConfigured ? (
            <div className="space-y-3">
              <p className="text-3xs text-grey-500">
                Push requires {missingItems.join(' and ')}. Configure{' '}
                {missingItems.length > 1 ? 'these' : 'this'} in the Git
                section of Prototype Settings.
              </p>
              <Button size="sm" onClick={handleGoToSettings} className="text-3xs">
                Open Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {uncommittedFiles > 0 && (
                <div className="flex items-start gap-2 rounded-md bg-orange-50 px-3 py-2 text-3xs text-orange-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>
                    You have {uncommittedFiles} uncommitted {uncommittedFiles === 1 ? 'change' : 'changes'} that
                    won't be included in this push. Commit first to include them.
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 text-3xs">
                <span className="w-14 text-grey-500">Branch</span>
                <code className="rounded bg-grey-100 px-1.5 py-0.5 font-mono text-grey-700">
                  {branch}
                </code>
              </div>
              <div className="flex items-center gap-4 text-3xs">
                <span className="w-14 text-grey-500">Remote</span>
                <code className="max-w-[340px] truncate rounded bg-grey-100 px-1.5 py-0.5 font-mono text-grey-700">
                  {remote}
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-grey-200 px-5 py-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-3xs">
            {result || notConfigured ? 'Close' : 'Cancel'}
          </Button>
          {!result && !notConfigured && !loading && (
            <Button size="sm" onClick={handlePush} disabled={pushing} className="text-3xs">
              {pushing ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              ) : null}
              Push
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
