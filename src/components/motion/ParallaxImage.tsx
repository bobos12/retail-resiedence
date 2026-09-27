'use client';

import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import type { Photo } from '@/content/images';
import { cn } from '@/lib/cn';
import { DUR, EASE_OUT, PARALLAX, VIEWPORT } from '@/lib/motion';
import { blurBackground, useNearViewport } from '@/lib/use-near-viewport';

type Props = {
  photo: Photo;
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Clip-and-scale reveal when the frame enters the viewport. */
  reveal?: boolean;
  strength?: number;
  priority?: boolean;
  quality?: 75 | 80 | 90;
};

// A framed image that drifts a few percent against the scroll and opens from a clipped band.
export function ParallaxImage({
  photo,
  sizes,
  className,
  imgClassName,
  reveal = true,
  strength = PARALLAX,
  priority,
  quality = 80,
}: Props) {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const show = priority || near;
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-strength * 100}%`, `${strength * 100}%`]);
  const overscan = (strength + 0.01) * 100;

  return (
    <m.div
      ref={ref}
      className={cn('relative overflow-hidden bg-canvas-deep', className)}
      initial={reveal ? { clipPath: 'inset(10% 6% 10% 6%)' } : false}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={VIEWPORT}
      transition={{ duration: DUR.slow, ease: EASE_OUT }}
    >
      {/* Overscan by the travel distance so the edges never show. */}
      <m.div className="absolute inset-x-0" style={{ top: `${-overscan}%`, bottom: `${-overscan}%`, ...(reduce ? {} : { y }) }}>
        <m.div
          className="relative size-full"
          style={show ? undefined : blurBackground(photo.blurDataURL)}
          initial={reveal ? { scale: 1.12 } : false}
          whileInView={{ scale: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: DUR.slow, ease: EASE_OUT }}
        >
          {show && (
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={sizes}
              quality={quality}
              priority={priority}
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              className={cn('object-cover', imgClassName)}
            />
          )}
        </m.div>
      </m.div>
    </m.div>
  );
}
