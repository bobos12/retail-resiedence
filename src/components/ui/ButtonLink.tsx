import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { Arrow } from './Arrow';

export type ButtonVariant = 'solid' | 'outline' | 'light' | 'outline-light' | 'copper';

const variants: Record<ButtonVariant, string> = {
  solid: 'bg-ink text-canvas hover:bg-copper-deep',
  outline: 'border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-canvas',
  light: 'bg-bone text-ink hover:bg-canvas',
  'outline-light': 'border border-bone/45 text-bone hover:border-bone hover:bg-bone hover:text-ink',
  copper: 'bg-copper text-night hover:bg-bone',
};

export const buttonClass = (variant: ButtonVariant = 'solid', className?: string) =>
  cn(
    'group inline-flex min-h-tap items-center justify-center gap-3 rounded-pill px-6 py-3 text-small font-medium',
    'transition-colors duration-(--dur-fast) ease-out',
    variants[variant],
    className,
  );

type Common = { variant?: ButtonVariant; className?: string; children: ReactNode; arrow?: boolean };

type Props = Common & Omit<ComponentProps<typeof Link>, 'className' | 'children'>;

export function ButtonLink({ variant, className, children, arrow = true, ...rest }: Props) {
  return (
    <Link className={buttonClass(variant, className)} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow className="transition-transform duration-(--dur-base) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />}
    </Link>
  );
}

type ExternalProps = Common & Omit<ComponentProps<'a'>, 'className' | 'children'> & { newTabLabel?: string };

export function ButtonAnchor({ variant, className, children, arrow = true, newTabLabel, ...rest }: ExternalProps) {
  const newTab = rest.target === '_blank';
  return (
    <a className={buttonClass(variant, className)} rel={newTab ? 'noopener noreferrer' : undefined} {...rest}>
      <span>{children}</span>
      {newTab && newTabLabel && <span className="sr-only">({newTabLabel})</span>}
      {arrow && (
        <Arrow
          external={newTab}
          className="transition-transform duration-(--dur-base) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
        />
      )}
    </a>
  );
}
