import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NavSubItem = {
  id: string;
  icon: string;
  label: string;
  hasChevron?: boolean;
};

export type NavItem = {
  id: string;
  icon: string;
  label: string;
  subItems?: NavSubItem[];
};

export type NavState = {
  topItems: NavItem[];
  bottomItems: NavItem[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  setTopItems: (items: NavItem[]) => void;
  setBottomItems: (items: NavItem[]) => void;
  updateTopItem: (id: string, updates: Partial<Omit<NavItem, 'id'>>) => void;
  updateBottomItem: (id: string, updates: Partial<Omit<NavItem, 'id'>>) => void;
  addTopItem: (item: NavItem) => void;
  addBottomItem: (item: NavItem) => void;
  removeTopItem: (id: string) => void;
  removeBottomItem: (id: string) => void;
  resetToDefaults: () => void;
};

let _nextId = 1;
export function genId() {
  return `nav-${Date.now()}-${_nextId++}`;
}

const defaultTopItems: NavItem[] = [
  { id: 'top-1', icon: 'LayoutDashboard', label: 'Overview' },
  { id: 'top-2', icon: 'Grid2x2', label: 'Applications' },
  {
    id: 'top-3',
    icon: 'BookUser',
    label: 'Directory',
    subItems: [
      { id: 'sub-1', icon: 'LayoutDashboard', label: 'Overview' },
      { id: 'sub-2', icon: 'Users', label: 'Users', hasChevron: true },
      { id: 'sub-3', icon: 'FolderTree', label: 'Groups' },
      { id: 'sub-4', icon: 'Building2', label: 'Departments' },
      { id: 'sub-5', icon: 'CircleDollarSign', label: 'Cost Centres' },
      { id: 'sub-6', icon: 'Briefcase', label: 'Business Units' },
      { id: 'sub-7', icon: 'MapPin', label: 'Locations' },
    ],
  },
  { id: 'top-4', icon: 'Wallet', label: 'Spends' },
  { id: 'top-5', icon: 'FileText', label: 'Contracts & Licenses' },
  { id: 'top-6', icon: 'TrendingDown', label: 'Optimization' },
  { id: 'top-7', icon: 'Shield', label: 'Security' },
  { id: 'top-8', icon: 'Zap', label: 'Automation' },
];

const defaultBottomItems: NavItem[] = [
  { id: 'bot-1', icon: 'ClipboardList', label: 'Tasks' },
  { id: 'bot-2', icon: 'Scale', label: 'Policies' },
  { id: 'bot-3', icon: 'BarChart3', label: 'Reports' },
  { id: 'bot-4', icon: 'ScrollText', label: 'Audit Logs' },
  { id: 'bot-5', icon: 'Settings', label: 'Settings' },
];

export const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      topItems: defaultTopItems,
      bottomItems: defaultBottomItems,
      activeIndex: 1,
      setActiveIndex: (i) => set({ activeIndex: i }),
      setTopItems: (items) => set({ topItems: items }),
      setBottomItems: (items) => set({ bottomItems: items }),
      updateTopItem: (id, updates) =>
        set((s) => ({
          topItems: s.topItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),
      updateBottomItem: (id, updates) =>
        set((s) => ({
          bottomItems: s.bottomItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),
      addTopItem: (item) =>
        set((s) => ({ topItems: [...s.topItems, item] })),
      addBottomItem: (item) =>
        set((s) => ({ bottomItems: [...s.bottomItems, item] })),
      removeTopItem: (id) =>
        set((s) => ({ topItems: s.topItems.filter((i) => i.id !== id) })),
      removeBottomItem: (id) =>
        set((s) => ({ bottomItems: s.bottomItems.filter((i) => i.id !== id) })),
      resetToDefaults: () =>
        set({ topItems: defaultTopItems, bottomItems: defaultBottomItems, activeIndex: 1 }),
    }),
    {
      name: 'proto-nav-store',
      partialize: (s) => ({
        topItems: s.topItems,
        bottomItems: s.bottomItems,
        activeIndex: s.activeIndex,
      }),
    },
  ),
);
