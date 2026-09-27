// The site is a static export with no image server: scripts/optimize-images.mjs writes every
// width next/image requests as <name>-<width>.webp next to the master image.
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith('/images/')) return src;
  return src.replace(/\.(jpg|webp)$/, `-${width}.webp`);
}
