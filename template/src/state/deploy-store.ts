import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DeployRecord = {
  id: string;
  url: string;
  productionUrl: string;
  commitHash: string;
  createdAt: number;
  projectName: string;
};

export type PushRecord = {
  id: string;
  branch: string;
  remote: string;
  commitHash: string;
  createdAt: number;
};

type DeployState = {
  deployments: DeployRecord[];
  pushes: PushRecord[];
  addDeployment: (d: DeployRecord) => void;
  addPush: (p: PushRecord) => void;
};

export const useDeployStore = create<DeployState>()(
  persist(
    (set) => ({
      deployments: [],
      pushes: [],
      addDeployment: (d) =>
        set((s) => ({ deployments: [d, ...s.deployments].slice(0, 50) })),
      addPush: (p) =>
        set((s) => ({ pushes: [p, ...s.pushes].slice(0, 50) })),
    }),
    {
      name: 'proto-deploy-__STORE_ID__',
      partialize: (s) => ({ deployments: s.deployments, pushes: s.pushes }),
    },
  ),
);
