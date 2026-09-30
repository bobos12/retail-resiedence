'use client';

import { AnimatePresence, m } from 'motion/react';
import { useLocale } from 'next-intl';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { buttonClass } from '@/components/ui/ButtonLink';
import { bookingDays, bookingInterestNames, bookingInterests, bookingSlots, bookingWhatsApp, type BookingInterest } from '@/content/booking';
import { cn } from '@/lib/cn';
import { DUR, EASE_OUT } from '@/lib/motion';

export type BookingLabels = {
  day: string;
  time: string;
  interest: string;
  interests: Record<BookingInterest, string>;
  details: string;
  name: string;
  phone: string;
  notes: string;
  optional: string;
  today: string;
  summaryEmpty: string;
  submit: string;
  note: string;
  noSlots: string;
  sentTitle: string;
  sentBody: string;
  sentAgain: string;
  sentReset: string;
  errors: { day: string; time: string; name: string; phone: string };
};

type Day = { iso: string; date: Date };
type Field = 'day' | 'time' | 'name' | 'phone';

const TZ = 'Asia/Riyadh';
const noop = () => () => {};

/** Today and the next days, as calendar dates in Al Khobar (never the build machine's clock). */
function upcomingDays(count: number): Day[] {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
  const [y, mo, d] = today.split('-').map(Number) as [number, number, number];
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(y, mo - 1, d + i, 12));
    return { iso: date.toISOString().slice(0, 10), date };
  });
}

/** Minutes past midnight in Al Khobar right now. */
function nowMinutes() {
  const [h, min] = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(new Date())
    .split(':')
    .map(Number) as [number, number];
  return h * 60 + min;
}

const toMinutes = (slot: string) => {
  const [h, min] = slot.split(':').map(Number) as [number, number];
  return h * 60 + min;
};

const chip = (on: boolean) =>
  cn(
    'inline-flex min-h-tap items-center justify-center border text-small font-medium transition-colors duration-(--dur-fast) disabled:cursor-not-allowed disabled:opacity-35',
    on ? 'border-ink bg-ink text-canvas' : 'border-line bg-canvas hover:border-ink',
  );

// Pick a day, a time and what to see, add a name and number: "Book" opens WhatsApp to the
// reservations team with the whole booking written out, ready to send.
export function BookingForm({ labels }: { labels: BookingLabels }) {
  const locale = useLocale();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const days = useMemo(() => (mounted ? upcomingDays(bookingDays) : []), [mounted]);

  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [interests, setInterests] = useState<BookingInterest[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+966 ');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Field[]>([]);
  const [link, setLink] = useState<string | null>(null);

  const isToday = day !== null && day === days[0]?.iso;
  const past = (slot: string) => isToday && toMinutes(slot) <= nowMinutes() + 30;
  const dayFmt = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...opts }).format(d);
  const chosen = days.find((d) => d.iso === day);

  const summary = [
    chosen && dayFmt(chosen.date, { weekday: 'long', day: 'numeric', month: 'long' }),
    time,
    new Intl.ListFormat(locale, { type: 'unit', style: 'short' }).format(interests.map((i) => labels.interests[i])),
  ]
    .filter(Boolean)
    .join(' · ');

  const toggle = (i: BookingInterest) => setInterests((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]));
  const clear = (f: Field) => setErrors((e) => e.filter((x) => x !== f));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const bad: Field[] = [];
    if (!day) bad.push('day');
    if (!time || past(time)) bad.push('time');
    if (name.trim().length < 2) bad.push('name');
    if (phone.replace(/\D/g, '').length < 8) bad.push('phone');
    setErrors(bad);
    if (bad.length || !chosen || !time) return;

    // One message format for the team, whatever language the visitor used.
    const date = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(chosen.date);
    const text = [
      '*Visit booking · Retal Residence*',
      'حجز زيارة جديد',
      '',
      `*Name / الاسم:* ${name.trim()}`,
      `*Phone / الجوال:* ${phone.trim()}`,
      `*Date / التاريخ:* ${date}`,
      `*Time / الوقت:* ${time}`,
      `*Interested in / مهتم بـ:* ${interests.length ? interests.map((i) => bookingInterestNames[i]).join(', ') : 'Not decided yet'}`,
      ...(notes.trim() ? [`*Notes / ملاحظات:* ${notes.trim()}`] : []),
      `*Language / اللغة:* ${locale.toUpperCase()}`,
    ].join('\n');
    const url = `https://wa.me/${bookingWhatsApp}?text=${encodeURIComponent(text)}`;
    setLink(url);
    window.open(url, '_blank', 'noopener');
  };

  const error = (f: Field) =>
    errors.includes(f) ? (
      <p id={`booking-${f}-error`} className="mt-2 text-small text-copper-deep" role="alert">
        {labels.errors[f]}
      </p>
    ) : null;
  const legend = 'mb-3 flex items-baseline justify-between gap-4 text-small font-medium';
  const input = 'min-h-tap w-full border-b border-line bg-transparent py-2 text-body outline-none transition-colors duration-(--dur-fast) focus:border-ink aria-invalid:border-copper-deep';

  return (
    <div className="min-w-0 border border-line bg-canvas p-5 sm:p-8 lg:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {link ? (
          <m.div
            key="sent"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE_OUT }}
          >
            <span className="inline-flex size-12 items-center justify-center rounded-pill bg-copper text-night">
              <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="m4 10.5 4 4 8-9" />
              </svg>
            </span>
            <p className="mt-6 text-h3 font-medium">{labels.sentTitle}</p>
            <p className="mt-3 max-w-prose text-body text-ink-soft">{labels.sentBody}</p>
            <p className="mt-6 border-y border-line py-4 text-small font-medium">{summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={link} target="_blank" rel="noopener noreferrer" className={buttonClass('solid')}>
                <WhatsAppMark />
                {labels.sentAgain}
              </a>
              <button type="button" onClick={() => setLink(null)} className={buttonClass('outline')}>
                {labels.sentReset}
              </button>
            </div>
          </m.div>
        ) : (
          <m.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} transition={{ duration: DUR.fast }} className="grid gap-8">
            <fieldset className="min-w-0" aria-describedby={errors.includes('day') ? 'booking-day-error' : undefined}>
              <legend className={legend}>
                <span>
                  <span className="tabular me-3 text-ink-muted">01</span>
                  {labels.day}
                </span>
              </legend>
              <div className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                {days.length
                  ? days.map((d, i) => {
                      const on = d.iso === day;
                      return (
                        <button
                          key={d.iso}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            setDay(d.iso);
                            clear('day');
                            if (time && i === 0 && toMinutes(time) <= nowMinutes() + 30) setTime(null);
                          }}
                          className={cn(chip(on), 'w-16 shrink-0 snap-start flex-col gap-0.5 py-2.5')}
                        >
                          <span className={cn('text-micro', on ? 'text-canvas/70' : 'text-ink-muted')}>
                            {i === 0 ? labels.today : dayFmt(d.date, { weekday: 'short' })}
                          </span>
                          <span className="tabular text-h4 leading-none">{dayFmt(d.date, { day: 'numeric' })}</span>
                          <span className={cn('text-micro', on ? 'text-canvas/70' : 'text-ink-muted')}>{dayFmt(d.date, { month: 'short' })}</span>
                        </button>
                      );
                    })
                  : Array.from({ length: 7 }, (_, i) => <span key={i} className="h-20 w-16 shrink-0 border border-line bg-canvas-deep" aria-hidden />)}
              </div>
              {error('day')}
            </fieldset>

            <fieldset className="min-w-0" aria-describedby={errors.includes('time') ? 'booking-time-error' : undefined}>
              <legend className={legend}>
                <span>
                  <span className="tabular me-3 text-ink-muted">02</span>
                  {labels.time}
                </span>
              </legend>
              <div className="grid grid-cols-4 gap-2">
                {bookingSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={slot === time}
                    disabled={past(slot)}
                    onClick={() => {
                      setTime(slot);
                      clear('time');
                    }}
                    className={cn(chip(slot === time), 'tabular py-2')}
                    dir="ltr"
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {isToday && bookingSlots.every(past) && <p className="mt-2 text-small text-ink-muted">{labels.noSlots}</p>}
              {error('time')}
            </fieldset>

            <fieldset className="min-w-0">
              <legend className={legend}>
                <span>
                  <span className="tabular me-3 text-ink-muted">03</span>
                  {labels.interest}
                </span>
                <span className="font-normal text-ink-muted">{labels.optional}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {bookingInterests.map((i) => (
                  <button key={i} type="button" aria-pressed={interests.includes(i)} onClick={() => toggle(i)} className={cn(chip(interests.includes(i)), 'px-4')}>
                    {labels.interests[i]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="min-w-0">
              <legend className={legend}>
                <span>
                  <span className="tabular me-3 text-ink-muted">04</span>
                  {labels.details}
                </span>
              </legend>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-small text-ink-muted">{labels.name}</span>
                  <input
                    className={input}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clear('name');
                    }}
                    autoComplete="name"
                    aria-invalid={errors.includes('name') || undefined}
                    aria-describedby={errors.includes('name') ? 'booking-name-error' : undefined}
                  />
                  {error('name')}
                </label>
                <label className="block">
                  <span className="text-small text-ink-muted">{labels.phone}</span>
                  <input
                    className={cn(input, 'tabular')}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clear('phone');
                    }}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    aria-invalid={errors.includes('phone') || undefined}
                    aria-describedby={errors.includes('phone') ? 'booking-phone-error' : undefined}
                  />
                  {error('phone')}
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-small text-ink-muted">
                    {labels.notes} <span className="text-micro">({labels.optional})</span>
                  </span>
                  <input className={input} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} />
                </label>
              </div>
            </fieldset>

            <div className="grid gap-4 border-t border-line pt-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className={cn('text-small', summary ? 'font-medium' : 'text-ink-muted')} aria-live="polite">
                {summary || labels.summaryEmpty}
              </p>
              <button type="submit" className={buttonClass('solid', 'w-full sm:w-auto')}>
                <WhatsAppMark />
                {labels.submit}
              </button>
              <p className="text-micro text-ink-muted sm:col-span-2">{labels.note}</p>
            </div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z" />
      <path d="M9.2 9.1c.2 1.9 1.6 3.6 3.7 4.5l1-1 1.6.7v1.3c-3.5.2-7-3.3-6.8-6.8h1.3l.7 1.6Z" />
    </svg>
  );
}
