import { cn } from '@/lib/cn';

type Props = {
  className?: string;
  /** Diagonal arrow for links that leave the site. */
  external?: boolean;
};

// Monoline arrow. Points to the inline end, so it mirrors in RTL.
export function Arrow({ className, external }: Props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      aria-hidden
      className={cn('icon-em', !external && 'flip-rtl', className)}
    >
      {external ? <path d="M6 14 14 6M7.5 6H14v6.5" /> : <path d="M3 10h13.5M11.5 5l5 5-5 5" />}
    </svg>
  );
}
