import type { ReactNode } from 'react';
import { RevealLines } from '@/components/motion/RevealLines';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Right-hand slot on desktop (a link or control). */
  aside?: ReactNode;
  as?: 'h1' | 'h2';
  className?: string;
  titleClassName?: string;
};

// Eyebrow, large left-aligned headline, then a short intro in the right-hand columns.
export function SectionIntro({ eyebrow, title, intro, aside, as = 'h2', className, titleClassName }: Props) {
  return (
    <div className={cn('grid-page gap-y-8', className)}>
      <p className="eyebrow col-span-4 flex items-center gap-3 md:col-span-6 lg:col-span-12">
        <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
        {eyebrow}
      </p>
      <RevealLines
        text={title}
        as={as}
        className={cn('col-span-4 font-medium md:col-span-6 lg:col-span-7', as === 'h1' ? 'text-h1' : 'text-h2', titleClassName)}
      />
      {(intro || aside) && (
        <Reveal className="col-span-4 flex flex-col gap-6 self-end md:col-span-4 lg:col-span-4 lg:col-start-9" delay={0.15}>
          {intro && <p className="max-w-prose text-lead opacity-80">{intro}</p>}
          {aside}
        </Reveal>
      )}
    </div>
  );
}
