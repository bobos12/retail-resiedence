// Outgoing mail sits behind this interface. With RESEND_API_KEY set, enquiries go
// through Resend; without it (local development) they are logged to the console.

export type Mail = { subject: string; text: string; replyTo?: string };

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

class ResendMailer implements Mailer {
  constructor(
    private apiKey: string,
    private from: string,
    private to: string,
  ) {}

  async send(mail: Mail) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: this.from,
        to: [this.to],
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  }
}

class ConsoleMailer implements Mailer {
  async send(mail: Mail) {
    console.info(`\n[mailer] ${mail.subject}\n${mail.text}\n`);
  }
}

export function getMailer(): Mailer {
  const key = process.env.RESEND_API_KEY;
  if (key) {
    return new ResendMailer(
      key,
      process.env.ENQUIRY_FROM ?? 'Retal Residence <website@retalresidence.com>',
      process.env.ENQUIRY_TO ?? 'sales@retalresidence.com',
    );
  }
  if (process.env.NODE_ENV === 'production') {
    console.warn('[mailer] RESEND_API_KEY is not set; enquiries are only logged.');
  }
  return new ConsoleMailer();
}
