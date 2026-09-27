'use server';

import en from '../../../../messages/en.json';
import { enquirySchema, formToObject, invalidFields, RESIDENCE_ANY, type EnquiryState } from '@/lib/enquiry';
import { getMailer } from '@/lib/mailer';

export async function sendEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const raw = formToObject(formData);

  // A filled honeypot means a bot: answer as if it worked, send nothing.
  if (raw.company) return { status: 'sent' };

  const result = enquirySchema.safeParse(raw);
  if (!result.success) return { status: 'invalid', fields: invalidFields(result) };

  const e = result.data;
  const names = en.residences.items as Record<string, { name: string }>;
  const residence = e.residence === RESIDENCE_ANY ? 'Not decided yet' : (names[e.residence]?.name ?? e.residence);
  const locale = String(formData.get('locale') ?? 'en');

  try {
    await getMailer().send({
      subject: `Visit request: ${e.name}, ${e.date}`,
      replyTo: e.email,
      text: [
        `Name: ${e.name}`,
        `Phone: ${e.phone}`,
        `Email: ${e.email}`,
        `Residence: ${residence}`,
        `Preferred date: ${e.date}`,
        `Language: ${locale === 'ar' ? 'Arabic' : 'English'}`,
        '',
        e.message || '(no message)',
      ].join('\n'),
    });
    return { status: 'sent' };
  } catch (err) {
    console.error('[enquiry] send failed', err);
    return { status: 'failed' };
  }
}
