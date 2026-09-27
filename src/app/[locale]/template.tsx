'use client';

import { m } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { DUR, EASE_OUT } from '@/lib/motion';

// The first page load renders as-is (no hidden content before hydration);
// every client-side navigation after that fades and lifts the new page in.
let hasMounted = false;

export default function Template({ children }: { children: ReactNode }) {
  const animate = hasMounted;
  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    <m.div
      initial={animate ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE_OUT }}
    >
      {children}
    </m.div>
  );
}
