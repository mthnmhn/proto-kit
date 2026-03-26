import { useState } from 'react';
import {
  Info,
  Settings,
  History,
  Navigation,
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppShell, type NavSection } from '@/components/layout';
import { useNavStore, genId, type NavItem, type NavSubItem } from '@/state/nav-store';
import { iconNames, resolveIcon } from '@/lib/icon-registry';
import { cn } from '@/lib/utils';

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

/* ── Icon picker popover ── */
function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const Icon = resolveIcon(value);

  const filtered = search
    ? iconNames.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    : iconNames;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-grey-200 bg-white hover:bg-grey-50"
        title={value}
      >
        <Icon className="h-4 w-4 text-grey-600" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-[280px] rounded-lg border border-grey-200 bg-white shadow-lg">
          <div className="border-b border-grey-200 p-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="h-7 text-4xs"
              autoFocus
            />
          </div>
          <div className="grid max-h-[200px] grid-cols-8 gap-0.5 overflow-auto p-2">
            {filtered.slice(0, 80).map((name) => {
              const I = resolveIcon(name);
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'grid h-8 w-8 place-items-center rounded-md hover:bg-blue-50',
                    name === value && 'bg-blue-100 ring-1 ring-blue-400',
                  )}
                >
                  <I className="h-4 w-4 text-grey-600" />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-8 py-4 text-center text-4xs text-grey-400">
                No icons found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Editable sub-item row ── */
function SubItemRow({
  item,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  item: NavSubItem;
  onUpdate: (updates: Partial<NavSubItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-grey-50 px-2 py-1.5">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="text-grey-400 hover:text-grey-600 disabled:opacity-30"
        >
          <ChevronRight className="h-3 w-3 -rotate-90" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="text-grey-400 hover:text-grey-600 disabled:opacity-30"
        >
          <ChevronRight className="h-3 w-3 rotate-90" />
        </button>
      </div>
      <IconPicker value={item.icon} onChange={(icon) => onUpdate({ icon })} />
      <Input
        value={item.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="h-7 flex-1 text-4xs"
      />
      <label className="flex items-center gap-1 text-4xs text-grey-500 whitespace-nowrap">
        <input
          type="checkbox"
          checked={item.hasChevron ?? false}
          onChange={(e) => onUpdate({ hasChevron: e.target.checked })}
          className="h-3 w-3 rounded"
        />
        Arrow
      </label>
      <button
        type="button"
        onClick={onRemove}
        className="rounded p-1 text-grey-400 hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ── Editable nav item row ── */
function NavItemRow({
  item,
  section,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  item: NavItem;
  section: 'top' | 'bottom';
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const updateFn = section === 'top' ? useNavStore.getState().updateTopItem : useNavStore.getState().updateBottomItem;
  const removeFn = section === 'top' ? useNavStore.getState().removeTopItem : useNavStore.getState().removeBottomItem;
  const hasSubmenu = item.subItems && item.subItems.length > 0;

  const updateSubItem = (subId: string, updates: Partial<NavSubItem>) => {
    const newSubs = (item.subItems ?? []).map((s) =>
      s.id === subId ? { ...s, ...updates } : s,
    );
    updateFn(item.id, { subItems: newSubs });
  };

  const removeSubItem = (subId: string) => {
    const newSubs = (item.subItems ?? []).filter((s) => s.id !== subId);
    updateFn(item.id, { subItems: newSubs.length > 0 ? newSubs : undefined });
  };

  const addSubItem = () => {
    const newSub: NavSubItem = { id: genId(), icon: 'LayoutDashboard', label: 'New item' };
    updateFn(item.id, { subItems: [...(item.subItems ?? []), newSub] });
  };

  const moveSubItem = (index: number, direction: -1 | 1) => {
    const subs = [...(item.subItems ?? [])];
    const target = index + direction;
    if (target < 0 || target >= subs.length) return;
    [subs[index], subs[target]] = [subs[target], subs[index]];
    updateFn(item.id, { subItems: subs });
  };

  const toggleSubmenu = () => {
    if (hasSubmenu) {
      updateFn(item.id, { subItems: undefined });
    } else {
      updateFn(item.id, {
        subItems: [{ id: genId(), icon: 'LayoutDashboard', label: 'Overview' }],
      });
      setExpanded(true);
    }
  };

  return (
    <div className="rounded-lg border border-grey-200 bg-white">
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="text-grey-400 hover:text-grey-600 disabled:opacity-30"
          >
            <ChevronRight className="h-3 w-3 -rotate-90" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="text-grey-400 hover:text-grey-600 disabled:opacity-30"
          >
            <ChevronRight className="h-3 w-3 rotate-90" />
          </button>
        </div>

        <GripVertical className="h-4 w-4 shrink-0 text-grey-300" />

        <IconPicker
          value={item.icon}
          onChange={(icon) => updateFn(item.id, { icon })}
        />

        <Input
          value={item.label}
          onChange={(e) => updateFn(item.id, { label: e.target.value })}
          className="h-8 flex-1 text-3xs"
        />

        <label className="flex items-center gap-1.5 text-4xs text-grey-500 whitespace-nowrap">
          <input
            type="checkbox"
            checked={hasSubmenu ?? false}
            onChange={toggleSubmenu}
            className="h-3 w-3 rounded"
          />
          Submenu
        </label>

        {hasSubmenu && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 text-grey-400 hover:bg-grey-100"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => removeFn(item.id)}
          className="rounded p-1 text-grey-400 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Submenu editor */}
      {hasSubmenu && expanded && (
        <div className="space-y-1.5 border-t border-grey-200 bg-grey-50/50 px-4 py-3">
          <p className="mb-2 text-4xs font-medium text-grey-500">
            Submenu items ({item.subItems!.length})
          </p>
          {item.subItems!.map((sub, i) => (
            <SubItemRow
              key={sub.id}
              item={sub}
              onUpdate={(u) => updateSubItem(sub.id, u)}
              onRemove={() => removeSubItem(sub.id)}
              onMoveUp={() => moveSubItem(i, -1)}
              onMoveDown={() => moveSubItem(i, 1)}
              isFirst={i === 0}
              isLast={i === item.subItems!.length - 1}
            />
          ))}
          <button
            type="button"
            onClick={addSubItem}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-4xs text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-3 w-3" /> Add sub-item
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Section editor ── */
function SectionEditor({
  title,
  description,
  items,
  section,
  onAdd,
}: {
  title: string;
  description: string;
  items: NavItem[];
  section: 'top' | 'bottom';
  onAdd: () => void;
}) {
  const setItems = section === 'top' ? useNavStore.getState().setTopItems : useNavStore.getState().setBottomItems;

  const moveItem = (index: number, direction: -1 | 1) => {
    const arr = [...items];
    const target = index + direction;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setItems(arr);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-grey-800">{title}</h2>
          <p className="mt-0.5 text-3xs text-grey-400">{description}</p>
        </div>
        <Button size="sm" variant="outline" onClick={onAdd} className="text-3xs">
          <Plus className="mr-1 h-3 w-3" /> Add item
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <NavItemRow
            key={item.id}
            item={item}
            section={section}
            onMoveUp={() => moveItem(i, -1)}
            onMoveDown={() => moveItem(i, 1)}
            isFirst={i === 0}
            isLast={i === items.length - 1}
          />
        ))}
        {items.length === 0 && (
          <p className="py-6 text-center text-3xs text-grey-400">
            No items yet. Click "Add item" to get started.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function ProtoSettingsNavigation() {
  const { topItems, bottomItems, addTopItem, addBottomItem, resetToDefaults } =
    useNavStore();

  return (
    <AppShell
      title="Prototype Settings"
      secondaryNav={navSections}
      ribbonActiveIndex={-1}
    >
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs font-semibold text-grey-800">Navigation</h1>
            <p className="mt-0.5 text-3xs text-grey-400">
              Configure the primary sidebar navigation items and submenus.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetToDefaults}
            className="text-3xs text-grey-500"
          >
            <RotateCcw className="mr-1 h-3 w-3" /> Reset to defaults
          </Button>
        </div>

        <SectionEditor
          title="Main navigation"
          description="Primary items shown in the top section of the sidebar."
          items={topItems}
          section="top"
          onAdd={() =>
            addTopItem({ id: genId(), icon: 'LayoutDashboard', label: 'New item' })
          }
        />

        <div className="border-t border-grey-200" />

        <SectionEditor
          title="Bottom navigation"
          description="Utility items shown below the divider."
          items={bottomItems}
          section="bottom"
          onAdd={() =>
            addBottomItem({ id: genId(), icon: 'Settings', label: 'New item' })
          }
        />
      </div>
    </AppShell>
  );
}
