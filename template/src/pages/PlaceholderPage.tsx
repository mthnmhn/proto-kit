import { AppShell } from '@/components/layout';

/**
 * Generic placeholder page for nav items that don't have a dedicated page yet.
 * Renders the AppShell with the page title and an empty content area.
 */
export default function PlaceholderPage({ title, activeIndex }: { title: string; activeIndex: number }) {
  return (
    <AppShell title={title} ribbonActiveIndex={activeIndex}>
      <div />
    </AppShell>
  );
}
