import Image from 'next/image';
import type { Photo } from '@/content/images';
import { cn } from '@/lib/cn';

type Props = {
  photo: Photo;
  /** `sizes` attribute; keep it honest so the right width is fetched. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Fill the (positioned) parent instead of using intrinsic size. */
  fill?: boolean;
  quality?: 75 | 80 | 90;
};

export function Picture({ photo, sizes, className, imgClassName, priority, fill = true, quality = 80 }: Props) {
  const image = (
    <Image
      src={photo.src}
      alt={photo.alt}
      sizes={sizes}
      quality={quality}
      placeholder="blur"
      blurDataURL={photo.blurDataURL}
      priority={priority}
      {...(fill ? { fill: true } : { width: photo.width, height: photo.height })}
      className={cn('object-cover', imgClassName)}
    />
  );
  if (!fill) return image;
  return <div className={cn('relative overflow-hidden bg-canvas-deep', className)}>{image}</div>;
}
