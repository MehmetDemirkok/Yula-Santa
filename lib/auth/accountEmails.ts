/**
 * Sends the account e-mails (server-only): issues a one-time token and mails the
 * link in the visitor's language. Failures are logged and reported as false;
 * callers decide what to show.
 */
import { createToken } from "./userStore";
import { accountLink, appOrigin, pickLocale, RESET_TTL_MINUTES, VERIFY_TTL_MINUTES } from "./emailLinks";
import { renderAccountEmail, type EmailKind, type MailCopy } from "@/lib/email/templates";
import { isEmailConfigured, sendEmail } from "@/lib/email/send";

/** `auth.mail.<kind>` from messages/{locale}.json; `locale` is already one of ours (pickLocale). */
async function mailCopy(locale: string, kind: EmailKind): Promise<MailCopy> {
    const messages = (await import(`../../messages/${locale}.json`)).default as { auth: { mail: Record<EmailKind, MailCopy> } };
    return messages.auth.mail[kind];
}

async function send(kind: EmailKind, user: { id: string; email: string }, rawLocale: string, requestUrl: string): Promise<boolean> {
    if (!isEmailConfigured()) return false;
    const locale = pickLocale(rawLocale);
    const purpose = kind === "reset" ? "reset" : "verify";
    const token = await createToken(user.id, purpose, kind === "reset" ? RESET_TTL_MINUTES : VERIFY_TTL_MINUTES);
    const link = accountLink(appOrigin(requestUrl, process.env.VERCEL_ENV), locale, kind === "reset" ? "/reset-password" : "/verify-email", token);
    const mail = renderAccountEmail(await mailCopy(locale, kind), locale, link);
    return sendEmail({
        to: user.email,
        ...mail,
        idempotencyKey: `${kind === "reset" ? "password-reset" : "verify-email"}/${user.id}/${token.slice(0, 12)}`,
        tag: kind === "reset" ? "password_reset" : "verify_email",
    });
}

export function sendVerificationEmail(user: { id: string; email: string }, locale: string, requestUrl: string): Promise<boolean> {
    return send("verify", user, locale, requestUrl);
}

export function sendResetEmail(user: { id: string; email: string }, locale: string, requestUrl: string): Promise<boolean> {
    return send("reset", user, locale, requestUrl);
}
