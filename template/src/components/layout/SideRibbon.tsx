import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveIcon } from '@/lib/icon-registry';
import { labelToSlug } from '@/lib/nav-routes';
import { useNavStore, type NavItem as NavItemData, type NavSubItem } from '@/state/nav-store';

/* ── Flyout submenu (portal-based to escape overflow-hidden) ── */
function SubMenu({
  label,
  items,
  anchorRect,
  onClose,
}: {
  label: string;
  items: NavSubItem[];
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] flex flex-col gap-0.5 rounded-lg bg-[#2266e2] px-2 pb-2 pt-0.5"
      style={{
        top: anchorRect.top,
        left: anchorRect.right + 8,
        minWidth: 152,
      }}
    >
      {/* Triangle pointer */}
      <div className="absolute -left-[6px] top-3 h-3 w-[6px] overflow-hidden">
        <div className="absolute left-[2px] top-[1px] h-[10px] w-[10px] rotate-45 bg-[#2266e2]" />
      </div>

      {/* Section heading */}
      <div className="flex h-6 items-center px-1">
        <span className="text-[9px] font-bold tracking-[0.25px] text-[#b1c8f3]">
          {label}
        </span>
      </div>

      {/* Sub-items */}
      {items.map((item) => {
        const Icon = resolveIcon(item.icon);
        return (
          <button
            key={item.id}
            type="button"
            className="flex h-10 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors hover:bg-[#3a78e6]"
          >
            <Icon className="h-4 w-4 shrink-0 text-white" />
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-4 tracking-[0.25px] text-white">
              {item.label}
            </span>
            {item.hasChevron && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/60" />
            )}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

/* ── Nav item ── */
function NavItem({
  item,
  index,
  active,
  collapsed,
}: {
  item: NavItemData;
  index: number;
  active: boolean;
  collapsed: boolean;
}) {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeSubmenu = useCallback(() => setSubmenuOpen(false), []);
  const navigate = useNavigate();
  const setActiveIndex = useNavStore((s) => s.setActiveIndex);

  const hasSubItems = item.subItems && item.subItems.length > 0;
  const Icon = resolveIcon(item.icon);

  const handleClick = () => {
    if (hasSubItems) {
      if (!submenuOpen && buttonRef.current) {
        setAnchorRect(buttonRef.current.getBoundingClientRect());
      }
      setSubmenuOpen((prev) => !prev);
    } else {
      setActiveIndex(index);
      navigate(`/${labelToSlug(item.label)}`);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-0 h-10 text-left transition-colors',
          active ? 'bg-[#5287e8]' : 'hover:bg-[#3a78e6]',
          collapsed && 'justify-center px-0',
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0 text-white" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-none text-white">
              {item.label}
            </span>
            {hasSubItems && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/60" />}
          </>
        )}
      </button>

      {submenuOpen && hasSubItems && anchorRect && (
        <SubMenu
          label={item.label}
          items={item.subItems!}
          anchorRect={anchorRect}
          onClose={closeSubmenu}
        />
      )}
    </div>
  );
}

type SideRibbonProps = {
  activeIndex?: number;
};

export default function SideRibbon({ activeIndex }: SideRibbonProps) {
  const [collapsed, setCollapsed] = useState(false);
  const topItems = useNavStore((s) => s.topItems);
  const bottomItems = useNavStore((s) => s.bottomItems);
  const storeActiveIndex = useNavStore((s) => s.activeIndex);
  const active = activeIndex ?? storeActiveIndex;

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col bg-[#2266e2] transition-[width] duration-200',
        collapsed ? 'w-12' : 'w-[152px]',
      )}
    >
      {/* Top nav — scrollable */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1 py-[10px]">
        {topItems.map((item, i) => (
          <NavItem key={item.id} item={item} index={i} active={i === active} collapsed={collapsed} />
        ))}
      </div>

      {/* Divider */}
      <div
        className={cn(
          'mx-auto h-px bg-white/30',
          collapsed ? 'w-8' : 'w-[calc(100%-8px)]',
        )}
      />

      {/* Bottom nav — fixed */}
      <div className="flex flex-col gap-0.5 px-1 py-[10px]">
        {bottomItems.map((item, i) => (
          <NavItem key={item.id} item={item} index={topItems.length + i} active={false} collapsed={collapsed} />
        ))}

        {/* Show/Hide toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-2 py-0 h-10 text-left transition-colors hover:bg-[#3a78e6]',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 shrink-0 text-white" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0 text-white" />
              <span className="text-[12px] font-medium leading-none text-white">Hide</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
