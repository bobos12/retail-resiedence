'use client';

import { m } from 'motion/react';
import type { ReactNode } from 'react';
import { DUR, EASE_OUT, VIEWPORT } from '@/lib/motion';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical travel in px. */
  y?: number;
  as?: 'div' | 'li' | 'p' | 'section' | 'figure';
};

export function Reveal({ children, className, delay = 0, y = 28, as = 'div' }: Props) {
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DUR.reveal, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  );
}
