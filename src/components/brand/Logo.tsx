import { MARK, WORD } from './logo-paths';

type Props = {
  className?: string;
  /** Show only the calligraphic mark. */
  markOnly?: boolean;
  title?: string;
};

// Horizontal lockup: copper mark, then the RETAL wordmark and a small RESIDENCE line
// in currentColor so the logo follows light and dark sections.
export function Logo({ className, markOnly, title = 'Retal Residence' }: Props) {
  if (markOnly) {
    return (
      <svg viewBox="0 0 51 119" className={className} role="img" aria-label={title}>
        <path d={MARK} fill="var(--color-copper)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 300 119" className={className} role="img" aria-label={title} direction="ltr">
      <path d={MARK} fill="var(--color-copper)" />
      <g transform="translate(83 30) scale(1.4)">
        <path d={WORD} fill="currentColor" />
      </g>
      <text
        x="84"
        y="100"
        fill="currentColor"
        fontSize="15"
        letterSpacing="11.6"
        fontFamily="var(--font-general), Arial, sans-serif"
        fontWeight="500"
        opacity="0.72"
      >
        RESIDENCE
      </text>
    </svg>
  );
}
