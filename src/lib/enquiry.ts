import { z } from 'zod';
import { residences } from '@/content/residences';

export const RESIDENCE_ANY = 'any';
const residenceValues = [RESIDENCE_ANY, ...residences.map((r) => r.slug)] as [string, ...string[]];

/** Today's date in Al Khobar, as YYYY-MM-DD. */
export function todayInRiyadh(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(now);
}

/** One day of slack so visitors west of Riyadh can still pick "today". */
function earliestDate() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return todayInRiyadh(d);
}

// Shared by the form (instant feedback) and the Server Action (the real check).
export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/)
    .refine((v) => v.replace(/\D/g, '').length >= 8),
  email: z.email().max(200),
  residence: z.enum(residenceValues),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((v) => v >= earliestDate()),
  message: z.string().trim().max(2000),
  /** Honeypot: people never see it, bots fill it in. */
  company: z.string().max(0),
});

export type Enquiry = z.infer<typeof enquirySchema>;
export type EnquiryField = Exclude<keyof Enquiry, 'company'>;

export type EnquiryState =
  | { status: 'idle' }
  | { status: 'invalid'; fields: EnquiryField[] }
  | { status: 'sent' }
  | { status: 'failed' };

export function formToObject(data: FormData) {
  const get = (k: string) => String(data.get(k) ?? '');
  return {
    name: get('name'),
    phone: get('phone'),
    email: get('email').trim(),
    residence: get('residence') || RESIDENCE_ANY,
    date: get('date'),
    message: get('message'),
    company: get('company'),
  };
}

export function invalidFields(result: ReturnType<typeof enquirySchema.safeParse>): EnquiryField[] {
  if (result.success) return [];
  const fields = new Set<EnquiryField>();
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && key !== 'company') fields.add(key as EnquiryField);
  }
  return [...fields];
}
