import { cn } from '@/lib/cn';

// Monoline marks on a 24px grid, drawn to match the arrow: thin stroke, square-ish joins.
const paths = {
  area: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M8 8h8v8H8z',
  bed: 'M3 18v-7.5h18V18M3 15h18M6 10.5V7h5a1 1 0 0 1 1 1v2.5M12 10.5V8a1 1 0 0 1 1-1h5v3.5',
  bath: 'M3.5 12h17v2.5a4.5 4.5 0 0 1-4.5 4.5H8a4.5 4.5 0 0 1-4.5-4.5V12ZM6 12V5.5A1.5 1.5 0 0 1 7.5 4h.5a1.5 1.5 0 0 1 1.5 1.5M7 19l-1 1.5M17 19l1 1.5',
  floors: 'M4 20h4v-4h4v-4h4V8h4',
  garage: 'M3 10 12 4l9 6v10M5.5 20v-7h13v7M5.5 16h13',
  sofa: 'M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 12.5a1.5 1.5 0 0 1 3 0V14h12v-1.5a1.5 1.5 0 0 1 3 0V18H3v-5.5ZM5 18v1.5M19 18v1.5',
  appliance: 'M6 3h12v18H6zM6 9h12M9 5.5h2M12 14a2.5 2.5 0 1 0 0 .01',
  wifi: 'M3 9a13 13 0 0 1 18 0M6 12.5a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0M12 19.5h.01',
  plus: 'M4 4h16v16H4zM12 8v8M8 12h8',
  gallery: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01',
  play: 'M4 5h16v14H4zM10 9v6l5-3-5-3Z',
  cube: 'M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3ZM4 7.5 12 12l8-4.5M12 12v9',
  plan: 'M4 4h16v16H4zM4 11h7V4M11 15v5M15 11h5M11 11h1.5',
  expand: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
  pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  shield: 'M12 3 19.5 6v6c0 4.5-3.2 7.8-7.5 9-4.3-1.2-7.5-4.5-7.5-9V6L12 3ZM9 12l2 2 4-4',
  calendar: 'M4 6h16v14H4zM4 10h16M8 4v4M16 4v4',
  clock: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 7.5V12l3 2',
  chat: 'M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('size-5 shrink-0', className)}
    >
      <path d={paths[name]} />
    </svg>
  );
}
