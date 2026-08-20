import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { formatFetchPrice } from './pricing';

export async function sendCreditEmail(input: {
    email: string;
    creditUrl: string;
    reason: string;
    locale: string;
}): Promise<{ sent: boolean }> {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || process.env.EMAIL_FROM;
    if (!key || !from) return { sent: false };

    const tr = input.locale.startsWith('tr');
    const subject = tr
        ? `${SITE_NAME}: 1 TikTok çekiliş hakkı`
        : `${SITE_NAME}: 1 TikTok giveaway credit`;
    const text = tr
        ? [
              'Ödemen iade edilmedi.',
              input.reason,
              `1 çekiliş hakkı tanımlandı (${formatFetchPrice('tr')} değerinde).`,
              `Hakkını kullan: ${input.creditUrl}`,
              SITE_URL,
          ].join('\n\n')
        : [
              'Your payment was not refunded.',
              input.reason,
              'You received 1 giveaway credit.',
              `Use it here: ${input.creditUrl}`,
              SITE_URL,
          ].join('\n\n');

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `tiktok-credit/${input.email}/${input.creditUrl}`,
        },
        body: JSON.stringify({
            from,
            to: [input.email],
            subject,
            text,
        }),
    });

    return { sent: res.ok };
}
