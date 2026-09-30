import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion/Reveal';
import { contact } from '@/content/contact';
import { bookingInterests } from '@/content/booking';
import { BookingForm } from './BookingForm';

const steps = ['pick', 'see', 'send'] as const;

// The booking page body: how it works on one side, the form on the other. The form sends the
// booking to the reservations team on WhatsApp.
export async function BookingPanel() {
  const t = await getTranslations('home.booking');

  return (
    <section aria-label={t('eyebrow')} className="page-x pb-section">
      <div className="grid-page gap-y-12">
        <div className="col-span-4 md:col-span-6 lg:sticky lg:top-header lg:col-span-4 lg:self-start lg:pt-8">
          <Reveal>
            <ol className="border-t border-line">
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

        <div className="col-span-4 min-w-0 md:col-span-6 lg:col-span-8">
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
