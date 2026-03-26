const BASE = '/api/git';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export type GitFile = { status: string; path: string };
export type GitStatus = { branch: string; files: GitFile[] };
export type GitCommit = {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
};

export const git = {
  status: () => request<GitStatus>('/status'),
  log: () => request<{ commits: GitCommit[] }>('/log'),
  config: () => request<{ name: string; email: string; remote: string }>('/config'),
  setConfig: (data: { name?: string; email?: string; remote?: string }) =>
    request<{ ok: boolean }>('/config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  commit: (message: string) =>
    request<{ ok: boolean; result: string }>('/commit', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  push: (token?: string) =>
    request<{ ok: boolean; result: string; remote: string; branch: string }>('/push', {
      method: 'POST',
      body: JSON.stringify({ token: token || '' }),
    }),
};
