import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProtoSettings = {
  name: string;
  description: string;
  author: string;
  headerTitle: string;
};

type AppState = {
  count: number;
  increment: () => void;
  protoSettings: ProtoSettings;
  updateProtoSettings: (updates: Partial<ProtoSettings>) => void;
  gitToken: string;
  setGitToken: (token: string) => void;
  vercelToken: string;
  setVercelToken: (token: string) => void;
  vercelProjectName: string;
  setVercelProjectName: (name: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      protoSettings: {
        name: '__PROTO_NAME__',
        description: '',
        author: '__GIT_USER__',
        headerTitle: 'SaaS Management',
      },
      updateProtoSettings: (updates) =>
        set((state) => ({
          protoSettings: { ...state.protoSettings, ...updates },
        })),
      gitToken: '',
      setGitToken: (token) => set({ gitToken: token }),
      vercelToken: '',
      setVercelToken: (token) => set({ vercelToken: token }),
      vercelProjectName: '',
      setVercelProjectName: (name) => set({ vercelProjectName: name }),
    }),
    {
      name: 'proto-app-__STORE_ID__',
      partialize: (state) => ({
        protoSettings: state.protoSettings,
        gitToken: state.gitToken,
        vercelToken: state.vercelToken,
        vercelProjectName: state.vercelProjectName,
      }),
    }
  )
);
