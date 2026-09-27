'use client';

import { m } from 'motion/react';
import { DUR, EASE_OUT, STAGGER, VIEWPORT } from '@/lib/motion';

type Props = {
  /** Lines are separated by "\n" in the message files. */
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  delay?: number;
  id?: string;
};

// Headline whose lines rise into place one after another as it enters the viewport.
export function RevealLines({ text, as = 'h2', className, delay = 0, id }: Props) {
  const Tag = m[as];
  const lines = text.split('\n');
  return (
    <Tag id={id} className={className} initial="hidden" whileInView="shown" viewport={VIEWPORT}>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line, i) => (
        <span key={i} className="line-mask" aria-hidden>
          <m.span
            className="block"
            variants={{ hidden: { y: '110%' }, shown: { y: '0%' } }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: delay + i * STAGGER }}
          >
            {line}
          </m.span>
        </span>
      ))}
    </Tag>
  );
}
