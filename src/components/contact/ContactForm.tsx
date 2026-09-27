'use client';

import { AnimatePresence, m } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react';
import { sendEnquiry } from '@/lib/send-enquiry';
import { Arrow } from '@/components/ui/Arrow';
import { buttonClass } from '@/components/ui/ButtonLink';
import {
  enquirySchema,
  formToObject,
  invalidFields,
  RESIDENCE_ANY,
  todayInRiyadh,
  type EnquiryField,
  type EnquiryState,
} from '@/lib/enquiry';
import { cn } from '@/lib/cn';
import { DUR, EASE_OUT } from '@/lib/motion';

type Option = { value: string; label: string };

const field =
  'w-full rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-lead text-ink placeholder:text-ink-muted/60 transition-colors duration-(--dur-fast) hover:border-ink-muted focus:border-ink focus:outline-none focus-visible:outline-none aria-invalid:border-copper-deep';

function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: string;
  children: ReactNode;
}) {
  return (
    <div className="group">
      <label htmlFor={id} className="eyebrow flex items-baseline justify-between gap-4 text-ink-soft">
        <span>{label}</span>
        {optional && <span className="normal-case tracking-normal text-ink-muted">{optional}</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-small text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-small text-copper-deep">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm({ residences }: { residences: Option[] }) {
  const t = useTranslations('contact.form');
  const locale = useLocale();

  const [state, action, pending] = useActionState<EnquiryState, FormData>(sendEnquiry, { status: 'idle' });
  const [clientErrors, setClientErrors] = useState<EnquiryField[] | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const today = todayInRiyadh();

  const errors = clientErrors ?? (state.status === 'invalid' ? state.fields : []);
  const has = (f: EnquiryField) => errors.includes(f);
  const describe = (f: EnquiryField, hint = false) => (has(f) ? `${f}-error` : hint ? `${f}-hint` : undefined);

  // Pre-select the residence named in the link (?residence=<slug>, from a residence page).
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('residence');
    const select = form.current?.elements.namedItem('residence');
    if (requested && select instanceof HTMLSelectElement && residences.some((r) => r.value === requested)) select.value = requested;
  }, [residences]);

  // After any rejection (client or server), move focus to the first field that needs attention.
  useEffect(() => {
    if (clientErrors?.length || state.status === 'invalid') {
      form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state, clientErrors]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fields = invalidFields(enquirySchema.safeParse(formToObject(new FormData(e.currentTarget))));
    if (fields.length) {
      e.preventDefault();
      setClientErrors(fields);
    } else {
      setClientErrors(null);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.status === 'sent' ? (
        <m.div
          key="sent"
          role="status"
          className="border-t border-ink pt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.reveal, ease: EASE_OUT }}
        >
          <span className="inline-flex size-12 items-center justify-center rounded-pill bg-copper text-night">
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="m4 10.5 4 4 8-9" />
            </svg>
          </span>
          <p className="mt-8 max-w-prose text-h3 font-medium">{t('success')}</p>
        </m.div>
      ) : (
        <m.form
          key="form"
          ref={form}
          action={action}
          onSubmit={onSubmit}
          noValidate
          className="grid gap-x-gap gap-y-10 md:grid-cols-2"
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base }}
        >
          <input type="hidden" name="locale" value={locale} />
          <h2 className="sr-only">{t('title')}</h2>

          {(errors.length > 0 || state.status === 'failed') && (
            <p role="alert" className="border-s-2 border-copper-deep ps-4 text-small text-copper-deep md:col-span-2">
              {state.status === 'failed' && !clientErrors ? t('error') : t('fixErrors')}
            </p>
          )}

          <Field id="name" label={t('name')} error={has('name') ? t('errors.name') : undefined}>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              aria-invalid={has('name')}
              aria-describedby={describe('name')}
              className={field}
            />
          </Field>

          <Field id="phone" label={t('phone')} hint={t('phoneHint')} error={has('phone') ? t('errors.phone') : undefined}>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              defaultValue="+966 "
              required
              dir="ltr"
              aria-invalid={has('phone')}
              aria-describedby={describe('phone', true)}
              className={cn(field, 'tabular text-start rtl:text-right')}
            />
          </Field>

          <Field id="email" label={t('email')} error={has('email') ? t('errors.email') : undefined}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              dir="ltr"
              aria-invalid={has('email')}
              aria-describedby={describe('email')}
              className={cn(field, 'rtl:text-right')}
            />
          </Field>

          <Field id="date" label={t('date')} error={has('date') ? t('errors.date') : undefined}>
            <input
              id="date"
              name="date"
              type="date"
              min={today}
              required
              aria-invalid={has('date')}
              aria-describedby={describe('date')}
              className={cn(field, 'tabular')}
            />
          </Field>

          <div className="md:col-span-2">
            <Field id="residence" label={t('residence')}>
              <div className="relative">
                <select id="residence" name="residence" defaultValue={RESIDENCE_ANY} className={cn(field, 'appearance-none pe-10')}>
                  <option value={RESIDENCE_ANY}>{t('residenceAny')}</option>
                  {residences.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <svg
                  viewBox="0 0 20 20"
                  className="pointer-events-none absolute end-0 top-1/2 size-4 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  aria-hidden
                >
                  <path d="m5 8 5 5 5-5" />
                </svg>
              </div>
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field
              id="message"
              label={t('message')}
              optional={t('optional')}
              hint={t('messageHint')}
              error={has('message') ? t('errors.message') : undefined}
            >
              <textarea
                id="message"
                name="message"
                rows={4}
                maxLength={2000}
                aria-invalid={has('message')}
                aria-describedby={describe('message', true)}
                className={cn(field, 'resize-y')}
              />
            </Field>
          </div>

          {/* Honeypot: off-screen, out of the tab order and hidden from assistive tech. */}
          <div className="sr-only" aria-hidden>
            <label htmlFor="company">{t('honeypot')}</label>
            <input id="company" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          <div className="md:col-span-2">
            <button type="submit" disabled={pending} className={buttonClass('solid', 'min-w-48 disabled:opacity-60')}>
              <span>{pending ? t('sending') : t('submit')}</span>
              <Arrow className="transition-transform duration-(--dur-base) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </button>
          </div>
        </m.form>
      )}
    </AnimatePresence>
  );
}
