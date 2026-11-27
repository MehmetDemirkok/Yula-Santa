/**
 * Account e-mails: password reset and e-mail verification. Pure, so they can be
 * tested. The words come from `auth.mail` in messages/{locale}.json (see
 * lib/auth/accountEmails.ts). They carry no name or other user text, only a link
 * we built, so nothing needs HTML escaping beyond it.
 */

export type EmailKind = "reset" | "verify";
export type MailCopy = { subject: string; heading: string; body: string; button: string; expiry: string; ignore: string };
export type RenderedEmail = { subject: string; html: string; text: string };

const RTL_LOCALES = new Set(["ar"]);

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function renderAccountEmail(copy: MailCopy, locale: string, link: string): RenderedEmail {
    const c = Object.fromEntries(Object.entries(copy).map(([k, v]) => [k, escapeHtml(v)])) as MailCopy;
    const href = escapeHtml(link);
    const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
    const align = dir === "rtl" ? "right" : "left";
    const html = `<!doctype html>
<html lang="${escapeHtml(locale)}" dir="${dir}">
<body style="margin:0;padding:24px;background:#f6f4ef;font-family:Inter,Arial,sans-serif;color:#111827">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr><td style="height:4px;background:linear-gradient(90deg,#b61722,#e7b53c,#4f46e5)"></td></tr>
    <tr><td style="padding:28px 28px 8px;text-align:${align}">
      <p style="margin:0 0 16px;font-size:20px;font-weight:800" dir="ltr">Yula<span style="color:#b61722">Santa</span></p>
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3">${c.heading}</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151">${c.body}</p>
      <p style="margin:0 0 24px"><a href="${href}" style="display:inline-block;padding:14px 24px;border-radius:12px;background:#b61722;color:#ffffff;font-weight:700;text-decoration:none">${c.button}</a></p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280">${c.expiry}</p>
      <p style="margin:0 0 24px;font-size:13px;color:#6b7280">${c.ignore}</p>
      <p style="margin:0 0 24px;font-size:12px;color:#9ca3af;word-break:break-all" dir="ltr">${href}</p>
    </td></tr>
  </table>
</body>
</html>`;
    const text = `${copy.heading}\n\n${copy.body}\n\n${link}\n\n${copy.expiry}\n${copy.ignore}\n\nYulaSanta`;
    return { subject: copy.subject, html, text };
}
