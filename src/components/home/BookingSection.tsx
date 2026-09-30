import { getTranslations } from 'next-intl/server';
import { RevealLines } from '@/components/motion/RevealLines';
import { Reveal } from '@/components/motion/Reveal';
import { contact } from '@/content/contact';
import { bookingInterests } from '@/content/booking';
import { BookingForm } from './BookingForm';

const steps = ['pick', 'see', 'send'] as const;

// Straight after the hero: book a visit for any day and time, sent to the reservations team on WhatsApp.
export async function BookingSection() {
  const t = await getTranslations('home.booking');

  return (
    <section id="book" aria-labelledby="book-title" className="scroll-mt-header bg-canvas-deep py-section-sm">
      <div className="page-x grid-page gap-y-12">
        <div className="col-span-4 md:col-span-6 lg:col-span-5">
          <p className="eyebrow flex items-center gap-3">
            <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
            {t('eyebrow')}
          </p>
          <RevealLines as="h2" id="book-title" text={t('title')} className="mt-6 text-h2 font-medium" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-prose text-lead text-ink-soft">{t('body')}</p>
            <ol className="mt-10 border-t border-line">
              {steps.map((s, i) => (
                <li key={s} className="flex items-baseline gap-5 border-b border-line py-4">
                  <span className="tabular text-micro text-copper-deep">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-body">{t(`steps.${s}`)}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-small text-ink-muted">
              {t('call')}{' '}
              <a href={contact.reservations[0]?.href} className="tabular font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-current" dir="ltr">
                {contact.reservations[0]?.display}
              </a>
            </p>
          </Reveal>
        </div>

        <div className="col-span-4 min-w-0 md:col-span-6 lg:col-span-7">
          <BookingForm
            labels={{
              day: t('day'),
              otherDate: t('otherDate'),
              time: t('time'),
              interest: t('interest'),
              interests: Object.fromEntries(bookingInterests.map((i) => [i, t(`interests.${i}`)])) as Record<(typeof bookingInterests)[number], string>,
              details: t('details'),
              name: t('name'),
              phone: t('phone'),
              notes: t('notes'),
              optional: t('optional'),
              today: t('today'),
              summaryEmpty: t('summaryEmpty'),
              submit: t('submit'),
              note: t('note'),
              scrollPrev: t('scrollPrev'),
              scrollNext: t('scrollNext'),
              sentTitle: t('sentTitle'),
              sentBody: t('sentBody'),
              sentAgain: t('sentAgain'),
              sentReset: t('sentReset'),
              errors: { day: t('errors.day'), time: t('errors.time'), timePast: t('errors.timePast'), name: t('errors.name'), phone: t('errors.phone') },
            }}
          />
        </div>
      </div>
    </section>
  );
}
