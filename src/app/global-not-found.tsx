import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { generalSans, alexandria } from './fonts';
import './globals.css';

export const metadata: Metadata = { title: 'Page not found · Retal Residence', robots: { index: false } };

// Requests outside the locale routes (e.g. a missing file) land here, with no locale to go on.
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${generalSans.variable} ${alexandria.variable}`}>
      <body suppressHydrationWarning>
        <main className="page-x flex min-h-svh flex-col justify-between py-10">
          <Link href="/en" className="inline-flex w-fit">
            <Logo className="h-10 w-auto" />
          </Link>
          <div>
            <p className="tabular text-display font-medium text-copper">404</p>
            <h1 className="mt-6 text-h2 font-medium">This page isn’t here</h1>
            <p className="mt-4 text-h4 font-medium" lang="ar" dir="rtl">
              هذه الصفحة غير موجودة
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/en" className="inline-flex min-h-tap items-center rounded-pill bg-ink px-6 text-small font-medium text-canvas">
                Back to home
              </Link>
              <Link
                href="/ar"
                lang="ar"
                className="inline-flex min-h-tap items-center rounded-pill border border-ink/30 px-6 text-small font-medium"
              >
                العودة إلى الرئيسية
              </Link>
            </div>
          </div>
          <p className="text-micro text-ink-muted">© Retal Residence</p>
        </main>
      </body>
    </html>
  );
}
