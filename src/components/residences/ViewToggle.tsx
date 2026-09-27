'use client';

import { m } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { cn } from '@/lib/cn';
import { DUR, EASE_OUT } from '@/lib/motion';

export type View = 'cards' | 'table';

type Props = { value: View; onChange: (view: View) => void; className?: string };

// Two-option segmented control; the pill slides between options (layout animation).
export function ViewToggle({ value, onChange, className }: Props) {
  const t = useTranslations('common');
  const id = useId();
  return (
    <div role="group" aria-label={t('viewAs')} className={cn('inline-flex rounded-pill border border-line p-1', className)}>
      {(['cards', 'table'] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cn(
            'relative isolate inline-flex min-h-tap items-center rounded-pill px-5 text-small font-medium transition-colors duration-(--dur-fast)',
            value === v ? 'text-canvas' : 'text-ink-soft hover:text-ink',
          )}
        >
          {value === v && (
            <m.span
              layoutId={`toggle-${id}`}
              className="absolute inset-0 -z-10 rounded-pill bg-ink"
              transition={{ duration: DUR.base, ease: EASE_OUT }}
            />
          )}
          <span className="relative">{t(v)}</span>
        </button>
      ))}
    </div>
  );
}
