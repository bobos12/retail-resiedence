import { RevealLines } from '@/components/motion/RevealLines';
import { Reveal } from '@/components/motion/Reveal';

type Props = { eyebrow: string; title: string; intro?: string };

// Opening block for pages without a photographic hero: the header sits solid above it.
export function PageHeader({ eyebrow, title, intro }: Props) {
  return (
    <header className="page-x pb-section-sm pt-hero-top">
      <div className="grid-page items-end gap-y-8">
        <p className="eyebrow col-span-4 flex items-center gap-3 md:col-span-6 lg:col-span-12">
          <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
          {eyebrow}
        </p>
        <RevealLines text={title} as="h1" className="col-span-4 text-h1 font-medium md:col-span-6 lg:col-span-8" />
        {intro && (
          <Reveal className="col-span-4 md:col-span-5 lg:col-span-4" delay={0.15}>
            <p className="max-w-prose text-lead text-ink-soft">{intro}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
