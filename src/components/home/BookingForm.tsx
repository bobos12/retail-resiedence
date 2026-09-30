'use client';

import { AnimatePresence, m } from 'motion/react';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Arrow } from '@/components/ui/Arrow';
import { buttonClass } from '@/components/ui/ButtonLink';
import { bookingDays, bookingInterestNames, bookingInterests, bookingSlots, bookingWhatsApp, type BookingInterest } from '@/content/booking';
import { cn } from '@/lib/cn';
import { DUR, EASE_OUT } from '@/lib/motion';

export type BookingLabels = {
  day: string;
  otherDate: string;
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
  scrollPrev: string;
  scrollNext: string;
  sentTitle: string;
  sentBody: string;
  sentAgain: string;
  sentReset: string;
  errors: { day: string; time: string; timePast: string; name: string; phone: string };
};

type Field = 'day' | 'time' | 'name' | 'phone';

const TZ = 'Asia/Riyadh';
const noop = () => () => {};

/** Today in Al Khobar as YYYY-MM-DD (never the build machine's clock). */
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
/** A calendar date as a Date at noon UTC, so formatting never slips a day. */
const isoDate = (iso: string) => {
  const [y, mo, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, mo - 1, d, 12));
};
/** Minutes past midnight in Al Khobar right now. */
function nowMinutes() {
  const [h, min] = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(new Date())
    .split(':')
    .map(Number) as [number, number];
  return h * 60 + min;
}

const chip = (on: boolean) =>
  cn(
    'inline-flex min-h-tap items-center justify-center border text-small font-medium transition-colors duration-(--dur-fast)',
    on ? 'border-ink bg-ink text-canvas' : 'border-line bg-canvas hover:border-ink',
  );

// Pick any day and time, say what to see, add a name and number: "Book" opens WhatsApp to the
// reservations team with the whole booking written out, ready to send.
export function BookingForm({ labels }: { labels: BookingLabels }) {
  const locale = useLocale();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const today = mounted ? todayIso() : '';
  const days = useMemo(
    () =>
      today
        ? Array.from({ length: bookingDays }, (_, i) => {
            const d = isoDate(today);
            d.setUTCDate(d.getUTCDate() + i);
            return d.toISOString().slice(0, 10);
          })
        : [],
    [today],
  );

  const [day, setDay] = useState<string | null>(null);
  /** Start of the chosen one-hour slot, 24-hour clock. */
  const [hour, setHour] = useState<number | null>(null);
  const [interests, setInterests] = useState<BookingInterest[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+966 ');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Field[]>([]);
  const [pastTime, setPastTime] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  const rail = useRef<HTMLDivElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  // Show the arrows only when there is more of the day row to reach in that direction.
  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const x = Math.abs(el.scrollLeft);
    setEdges({ start: x > 4, end: x + el.clientWidth < el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, [measure, days.length]);
  const scroll = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    el.scrollBy({ left: dir * el.clientWidth * 0.8 * (rtl ? -1 : 1), behavior: 'smooth' });
  };

  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions, lang: string = locale) => new Intl.DateTimeFormat(lang, { timeZone: 'UTC', ...opts }).format(isoDate(iso));
  const clock = (h: number, lang: string, short = false) =>
    new Intl.DateTimeFormat(lang, { timeZone: 'UTC', hour: 'numeric', ...(short ? {} : { minute: '2-digit' }), hour12: true }).format(new Date(Date.UTC(2000, 0, 1, h)));
  /** "10 AM – 11 AM" on the buttons; the full "10:00 AM – 11:00 AM" in the summary and message. */
  const slotText = (h: number, lang: string, short = false) => `${clock(h, lang, short)} – ${clock(h + 1, lang, short)}`;
  const timeText = (lang: string) => (hour === null ? null : slotText(hour, lang));
  const passed = (h: number) => day === today && h * 60 <= nowMinutes();

  const custom = day !== null && !days.includes(day);
  const summary = [
    day && fmt(day, { weekday: 'long', day: 'numeric', month: 'long' }),
    timeText(locale),
    new Intl.ListFormat(locale, { type: 'unit', style: 'short' }).format(interests.map((i) => labels.interests[i])),
  ]
    .filter(Boolean)
    .join(' · ');

  const toggle = (i: BookingInterest) => setInterests((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]));
  const clear = (f: Field) => setErrors((e) => e.filter((x) => x !== f));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const bad: Field[] = [];
    const tooSoon = hour !== null && passed(hour);
    if (!day) bad.push('day');
    if (hour === null || tooSoon) bad.push('time');
    if (name.trim().length < 2) bad.push('name');
    if (phone.replace(/\D/g, '').length < 8) bad.push('phone');
    setPastTime(tooSoon);
    setErrors(bad);
    if (bad.length || !day) return;

    // One message format for the team, whatever language the visitor used.
    const text = [
      '*Visit booking · Retal Residence*',
      'حجز زيارة جديد',
      '',
      `*Name / الاسم:* ${name.trim()}`,
      `*Phone / الجوال:* ${phone.trim()}`,
      `*Date / التاريخ:* ${fmt(day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, 'en-GB')}`,
      `*Time / الوقت:* ${timeText('en-US')}`,
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
        {f === 'time' && pastTime ? labels.errors.timePast : labels.errors[f]}
      </p>
    ) : null;
  const legend = 'mb-3 flex min-h-tap w-full items-center justify-between gap-4 text-small font-medium';
  const step = (n: string, text: string) => (
    <span>
      <span className="tabular me-3 text-ink-muted">{n}</span>
      {text}
    </span>
  );
  const input = 'min-h-tap w-full border-b border-line bg-transparent py-2 text-body outline-none transition-colors duration-(--dur-fast) focus:border-ink aria-invalid:border-copper-deep';
  const arrowBtn = 'inline-flex size-10 items-center justify-center rounded-pill border border-line bg-canvas transition-[opacity,border-color] duration-(--dur-fast) hover:border-ink disabled:pointer-events-none disabled:opacity-30';

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
            {/* 01 Day: the next two weeks at a glance, or any later date from the calendar */}
            <fieldset className="min-w-0" aria-describedby={errors.includes('day') ? 'booking-day-error' : undefined}>
              <legend className={legend}>
                {step('01', labels.day)}
                <span className="flex gap-2">
                  <button type="button" className={arrowBtn} onClick={() => scroll(-1)} disabled={!edges.start}>
                    <Arrow className="rotate-180" />
                    <span className="sr-only">{labels.scrollPrev}</span>
                  </button>
                  <button type="button" className={arrowBtn} onClick={() => scroll(1)} disabled={!edges.end}>
                    <Arrow />
                    <span className="sr-only">{labels.scrollNext}</span>
                  </button>
                </span>
              </legend>
              <div ref={rail} className="no-scrollbar -mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 sm:mx-0 sm:scroll-px-0 sm:px-0">
                {days.length
                  ? days.map((iso, i) => {
                      const on = iso === day;
                      return (
                        <button
                          key={iso}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            setDay(iso);
                            clear('day');
                          }}
                          className={cn(chip(on), 'w-16 shrink-0 snap-start flex-col gap-0.5 py-2.5')}
                        >
                          <span className={cn('text-micro', on ? 'text-canvas/70' : 'text-ink-muted')}>{i === 0 ? labels.today : fmt(iso, { weekday: 'short' })}</span>
                          <span className="tabular text-h4 leading-none">{fmt(iso, { day: 'numeric' })}</span>
                          <span className={cn('text-micro', on ? 'text-canvas/70' : 'text-ink-muted')}>{fmt(iso, { month: 'short' })}</span>
                        </button>
                      );
                    })
                  : Array.from({ length: 7 }, (_, i) => <span key={i} className="h-20 w-16 shrink-0 border border-line bg-canvas-deep" aria-hidden />)}
                {/* Any other date: the native calendar, from today onwards. */}
                <label className={cn(chip(custom), 'relative shrink-0 snap-start cursor-pointer flex-col gap-1 px-4 py-2.5')}>
                  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                    <path d="M3.5 5h13v11.5h-13zM3.5 8.5h13M7 3v3.5M13 3v3.5" />
                  </svg>
                  <span className="whitespace-nowrap text-micro">{custom && day ? fmt(day, { day: 'numeric', month: 'short', year: 'numeric' }) : labels.otherDate}</span>
                  <input
                    ref={dateInput}
                    type="date"
                    min={today || undefined}
                    value={custom && day ? day : ''}
                    onClick={() => dateInput.current?.showPicker?.()}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      setDay(e.target.value);
                      clear('day');
                    }}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                    aria-label={labels.otherDate}
                  />
                </label>
              </div>
              {error('day')}
            </fieldset>

            {/* 02 Time: one-hour slots; those already past today are greyed out */}
            <fieldset className="min-w-0" aria-describedby={errors.includes('time') ? 'booking-time-error' : undefined}>
              <legend className={legend}>{step('02', labels.time)}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {bookingSlots.map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-pressed={h === hour}
                    disabled={passed(h)}
                    onClick={() => {
                      setHour(h);
                      clear('time');
                    }}
                    className={cn(chip(h === hour), 'tabular whitespace-nowrap px-2 py-2 disabled:cursor-not-allowed disabled:opacity-35')}
                  >
                    {slotText(h, locale, true)}
                  </button>
                ))}
              </div>
              {error('time')}
            </fieldset>

            <fieldset className="min-w-0">
              <legend className={legend}>
                {step('03', labels.interest)}
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
              <legend className={legend}>{step('04', labels.details)}</legend>
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

            {/* Summary and the one action */}
            <div className="border-t border-line pt-6">
              <p className={cn('mb-4 text-body', summary ? 'font-medium' : 'text-ink-muted')} aria-live="polite">
                {summary || labels.summaryEmpty}
              </p>
              <button
                type="submit"
                className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-pill bg-ink py-2 pe-2 ps-6 text-body font-medium text-canvas transition-colors duration-(--dur-fast) hover:bg-copper-deep"
              >
                <span className="flex items-center gap-3">
                  <WhatsAppMark className="size-5" />
                  {labels.submit}
                </span>
                <span className="inline-flex size-11 items-center justify-center rounded-pill bg-canvas text-ink transition-transform duration-(--dur-base) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  <Arrow />
                </span>
              </button>
              <p className="mt-3 text-center text-micro text-ink-muted">{labels.note}</p>
            </div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function WhatsAppMark({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z" />
      <path d="M9.2 9.1c.2 1.9 1.6 3.6 3.7 4.5l1-1 1.6.7v1.3c-3.5.2-7-3.3-6.8-6.8h1.3l.7 1.6Z" />
    </svg>
  );
}
