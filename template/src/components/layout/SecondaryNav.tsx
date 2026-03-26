import type { LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type NavItem = {
  icon?: LucideIcon;
  label: string;
  route?: string;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

type SecondaryNavProps = {
  sections: NavSection[];
  className?: string;
};

export default function SecondaryNav({ sections, className }: SecondaryNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={cn('w-[170px] shrink-0', className)}>
      <div className="h-full overflow-hidden rounded-lg">
        {sections.map((section) => (
          <div key={section.title ?? section.items[0].label}>
            {section.title && (
              <div className="px-[10px] pb-0.5 pt-2">
                <h2 className="text-[9px] font-normal leading-[1.25] tracking-[0.0225px] text-[#717171]">
                  {section.title}
                </h2>
              </div>
            )}

            <div>
              {section.items.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === section.items.length - 1;
                const Icon = item.icon;
                const isSelected = item.route ? location.pathname.startsWith(item.route) : false;
                return (
                  <div key={item.label} className="flex h-8 items-center px-[10px] py-[0.5px]">
                    <button
                      type="button"
                      onClick={() => item.route && navigate(item.route)}
                      className={cn(
                        'flex h-full w-full items-center gap-2 bg-[#eff8ff] px-2 py-[6px] text-left',
                        isFirst && 'rounded-t-lg',
                        isLast && 'rounded-b-lg',
                        isSelected && 'border border-[#5287e8] bg-white shadow-[inset_0_0_0_1px_rgba(82,135,232,0.15)]',
                        item.route ? 'cursor-pointer' : 'cursor-default',
                      )}
                    >
                      {Icon ? <Icon className="h-4 w-4 shrink-0 text-[#6f7788]" /> : <span className="h-4 w-4 shrink-0" />}
                      <span className={cn('truncate text-[10px] leading-[1.5] text-[#484848]', isSelected ? 'font-semibold' : 'font-medium')}>
                        {item.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
