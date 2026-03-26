import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  label: string;
  route?: string;
};

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 7.51507 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.80886e-07 5.98581C-0.000201525 5.82228 0.0344793 5.66058 0.101729 5.51151C0.168978 5.36244 0.26725 5.22942 0.389985 5.12135L5.96575 0.216053C6.15052 0.0610142 6.38861 -0.0155824 6.62912 0.00264165C6.86962 0.0208657 7.09346 0.132464 7.25275 0.313574C7.41205 0.494683 7.49416 0.730929 7.48154 0.971795C7.46892 1.21266 7.36256 1.43903 7.1852 1.6025L2.3094 5.89182C2.29602 5.90355 2.2853 5.918 2.27795 5.93421C2.2706 5.95042 2.2668 5.96801 2.2668 5.98581C2.2668 6.00361 2.2706 6.0212 2.27795 6.03741C2.2853 6.05362 2.29602 6.06808 2.3094 6.07981L7.1852 10.3691C7.27948 10.4482 7.357 10.5454 7.4132 10.6549C7.46939 10.7644 7.50313 10.884 7.51243 11.0068C7.52173 11.1295 7.5064 11.2528 7.46735 11.3696C7.4283 11.4863 7.3663 11.594 7.28502 11.6864C7.20373 11.7788 7.10479 11.8541 6.99401 11.9077C6.88323 11.9613 6.76285 11.9923 6.63994 11.9987C6.51703 12.0052 6.39407 11.987 6.27829 11.9452C6.16252 11.9035 6.05625 11.839 5.96575 11.7556L0.391984 6.85178C0.268946 6.74351 0.170359 6.6103 0.102775 6.46099C0.0351906 6.31168 0.000156508 6.1497 8.80886e-07 5.98581V5.98581Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 5.02693 7.98142"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.02693 3.99071C5.02707 4.09974 5.00395 4.20754 4.95911 4.30693C4.91428 4.40631 4.84876 4.49499 4.76693 4.56704L1.0496 7.83738C0.926416 7.94074 0.767681 7.99181 0.607336 7.97966C0.446992 7.96751 0.297764 7.8931 0.191562 7.77236C0.085361 7.65161 0.0306151 7.49411 0.0390313 7.33353C0.0193117 5.14059 -0.0379497 2.83342 0.0390313 0.647891C0.0306151 0.487307 0.085361 0.329803 0.191562 0.209058C0.297764 0.0883131 0.446992 0.0139111 0.607336 0.00176118C0.767681 -0.0103887 0.926416 0.0406778 1.0496 0.144041L4.7656 3.41337C4.84763 3.48556 4.91335 3.57437 4.95841 3.67391C5.00347 3.77345 5.02683 3.88144 5.02693 3.99071Z"
        fill="currentColor"
      />
    </svg>
  );
}

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  backRoute?: string;
  className?: string;
};

export default function Breadcrumb({ items, backRoute, className }: BreadcrumbProps) {
  const navigate = useNavigate();
  const defaultBackRoute = (items.length > 1 && items[items.length - 2].route)
    ? items[items.length - 2].route!
    : '/';

  return (
    <div className={cn('flex h-8 items-center gap-2 pr-2', className)}>
      <button
        type="button"
        onClick={() => navigate(backRoute ?? defaultBackRoute)}
        aria-label="Go back"
        className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8f0fc] text-[#484848] transition-colors hover:bg-[#dfe8f9]"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      <nav className="flex min-w-0 items-center gap-2" aria-label="Breadcrumb">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
            {index > 0 && <ChevronRightIcon className="h-2 w-2 shrink-0 text-[#484848]" />}
            <span
              className={cn(
                'truncate whitespace-nowrap text-[14px] leading-[1.2] text-[#484848]',
                index === items.length - 1 ? 'font-bold' : 'font-normal',
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
