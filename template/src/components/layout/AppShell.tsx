import type { ReactNode } from 'react';
import TopHeader from './TopHeader';
import SideRibbon from './SideRibbon';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb';
import SecondaryNav, { type NavSection } from './SecondaryNav';

type AppShellProps = {
  children: ReactNode;
  /** Page title shown when no breadcrumb is displayed */
  title?: string;
  /** Breadcrumb items - when provided, shows breadcrumb instead of title */
  breadcrumbs?: BreadcrumbItem[];
  /** Route for the back button in breadcrumb */
  backRoute?: string;
  /** Secondary navigation sections - when provided, shows 170px sidebar */
  secondaryNav?: NavSection[];
  /** Active index for the primary navigation (default: 1) */
  ribbonActiveIndex?: number;
};

/**
 * AppShell - Main layout wrapper for Zluri prototypes
 *
 * Layout structure:
 * ┌─────────────────────────────────────────────────────────┐
 * │  TOP HEADER (40px) - Dark gradient, logo, search, icons │
 * └─────────────────────────────────────────────────────────┘
 * ┌──────┬──────────────────────────────────────────────────┐
 * │ SIDE │  Breadcrumb or Title (32px)                      │
 * │RIBBON├──────────────────────────────────────────────────┤
 * │ 48px │  ┌─────────┬────────────────────────────────┐    │
 * │      │  │Secondary│  Main Content (white, rounded) │    │
 * │      │  │Nav 170px│                                │    │
 * │      │  └─────────┴────────────────────────────────┘    │
 * └──────┴──────────────────────────────────────────────────┘
 */
export default function AppShell({
  children,
  title,
  breadcrumbs,
  backRoute,
  secondaryNav,
  ribbonActiveIndex = 1,
}: AppShellProps) {
  const showBreadcrumb = breadcrumbs && breadcrumbs.length > 0;

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <TopHeader />

      <div className="h-[calc(100vh-40px)] overflow-hidden bg-[#e8f0fc]">
        <div className="flex h-full">
          <SideRibbon activeIndex={ribbonActiveIndex} />

          <div className="min-w-0 flex-1 p-[10px]">
            {/* Header row: breadcrumb or title */}
            {showBreadcrumb ? (
              <Breadcrumb items={breadcrumbs} backRoute={backRoute} />
            ) : (
              <div className="flex h-8 items-center px-[10px]">
                <h1 className="text-[18px] font-semibold leading-none text-[#484848]">
                  {title ?? 'Page'}
                </h1>
              </div>
            )}

            {/* Content area */}
            <div className="mt-[10px] flex h-[calc(100%-42px)] gap-[10px]">
              {secondaryNav && <SecondaryNav sections={secondaryNav} />}
              <main className="min-w-0 flex-1 overflow-auto rounded-lg bg-white">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
