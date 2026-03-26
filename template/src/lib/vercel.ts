async function request(path: string, options?: RequestInit) {
  const res = await fetch(`/api/vercel${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export type VercelDeployment = {
  id: string;
  url: string;
  state: string; // READY | BUILDING | QUEUED | ERROR | CANCELED
  created: number;
  meta: Record<string, string>;
};

export const vercel = {
  deploy(token: string, projectName: string) {
    return request('/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, projectName }),
    });
  },

  status(id: string, token: string) {
    return request(`/status?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`);
  },

  project(name: string, token: string) {
    return request(`/project?name=${encodeURIComponent(name)}&token=${encodeURIComponent(token)}`);
  },

  deployments(project: string, token: string): Promise<{ deployments: VercelDeployment[] }> {
    return request(`/deployments?project=${encodeURIComponent(project)}&token=${encodeURIComponent(token)}`);
  },
};
