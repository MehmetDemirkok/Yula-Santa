/**
 * Transactional e-mail through Resend's REST API (server-only). No SDK: one
 * fetch is all we need. The key is send-only and limited to yulasanta.com.tr.
 *
 * Env: RESEND_API_KEY (required to send), EMAIL_FROM (optional).
 */

const DEFAULT_FROM = "YulaSanta <no-reply@yulasanta.com.tr>";

export function isEmailConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY);
}

export type OutgoingEmail = {
    to: string;
    subject: string;
    html: string;
    text: string;
    /** `<event>/<id>`: a retry with the same key is not sent twice (Resend keeps keys for 24 hours). */
    idempotencyKey: string;
    tag: string;
};

/** Returns true when Resend accepted the e-mail. Never throws. */
export async function sendEmail(email: OutgoingEmail): Promise<boolean> {
    const key = process.env.RESEND_API_KEY;
    if (!key) return false;
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
                "Idempotency-Key": email.idempotencyKey.slice(0, 256),
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || DEFAULT_FROM,
                to: [email.to],
                subject: email.subject,
                html: email.html,
                text: email.text,
                tags: [{ name: "type", value: email.tag }],
            }),
        });
        if (!response.ok) {
            console.error("resend send failed", response.status, await response.text().catch(() => ""));
            return false;
        }
        return true;
    } catch (error) {
        console.error("resend send failed", error);
        return false;
    }
}
