import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, GitCommitHorizontal, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { git, type GitFile } from '@/lib/git';

const STATUS_LABELS: Record<string, string> = {
  M: 'Modified',
  A: 'Added',
  D: 'Deleted',
  '?': 'Untracked',
  R: 'Renamed',
};

export default function CommitModal({
  onClose,
  onPush,
}: {
  onClose: () => void;
  onPush?: () => void;
}) {
  const navigate = useNavigate();
  const [files, setFiles] = useState<GitFile[]>([]);
  const [gitName, setGitName] = useState('');
  const [gitEmail, setGitEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    Promise.all([git.status(), git.config()]).then(([s, cfg]) => {
      setFiles(s.files);
      setGitName(cfg.name);
      setGitEmail(cfg.email);
      setLoading(false);
    });
  }, []);

  const noIdentity = !loading && (!gitName || !gitEmail);

  const handleCommit = async () => {
    setCommitting(true);
    try {
      await git.commit(message || 'Update prototype');
      setResult({ ok: true, text: 'Committed successfully.' });
    } catch (e: any) {
      setResult({ ok: false, text: e.message });
    }
    setCommitting(false);
  };

  const handleGoToSettings = () => {
    onClose();
    navigate('/proto-settings/settings');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[480px] rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-grey-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="h-4 w-4 text-grey-500" />
            <h2 className="text-2xs font-semibold text-grey-800">Commit changes</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-grey-100">
            <X className="h-4 w-4 text-grey-400" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          {loading ? (
            <div className="flex items-center gap-2 text-3xs text-grey-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking for changes...
            </div>
          ) : noIdentity ? (
            <div className="space-y-3">
              <p className="text-3xs text-grey-500">
                Git is not configured yet. You need to set your name and email before committing.
              </p>
              <Button size="sm" onClick={handleGoToSettings} className="text-3xs">
                Open Settings
              </Button>
            </div>
          ) : files.length === 0 && !result ? (
            <p className="text-3xs text-grey-400">No changes to commit.</p>
          ) : result ? (
            <div
              className={`rounded-md px-3 py-2 text-3xs ${
                result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {result.text}
            </div>
          ) : (
            <>
              {/* Changed files */}
              <div>
                <p className="mb-1.5 text-3xs font-medium text-grey-500">
                  {files.length} changed file{files.length !== 1 ? 's' : ''}
                </p>
                <div className="max-h-[160px] overflow-auto rounded-md border border-grey-200">
                  {files.map((f) => (
                    <div
                      key={f.path}
                      className="flex items-center gap-2 border-b border-grey-200 px-3 py-1.5 last:border-0"
                    >
                      <span
                        className={`shrink-0 text-4xs font-medium ${
                          f.status === 'D'
                            ? 'text-red-600'
                            : f.status === '?'
                            ? 'text-blue-600'
                            : 'text-orange-500'
                        }`}
                      >
                        {STATUS_LABELS[f.status] || f.status}
                      </span>
                      <span className="truncate font-mono text-4xs text-grey-700">
                        {f.path}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Commit message (optional)"
                  rows={2}
                  className="w-full rounded-md border border-grey-200 bg-white px-3 py-2 text-3xs placeholder:text-grey-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-grey-200 px-5 py-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-3xs">
            {result || noIdentity ? 'Close' : 'Cancel'}
          </Button>
          {result?.ok && onPush && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onPush();
              }}
              className="text-3xs"
            >
              <Upload className="mr-1.5 h-3 w-3" />
              Push
            </Button>
          )}
          {!result && !noIdentity && files.length > 0 && (
            <Button size="sm" onClick={handleCommit} disabled={committing} className="text-3xs">
              {committing ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              ) : null}
              Commit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
