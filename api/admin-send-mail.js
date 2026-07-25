import {
  allowOnlyPost,
  appendCredit,
  assertSmtpConfigured,
  createTransporter,
  normalizeAttachments,
} from "./_mail.js";

/**
 * Inline HTML template — no external import dependency.
 * Renders a premium dark-themed email for admin custom messages.
 */
function buildHtmlEmail(subject, message, attachmentsCount) {
  const safeSubject = esc(subject || "Message from Singh Automobiles");
  const safeMessage = esc(message || "");

  const paragraphs = safeMessage
    .split(/\n\s*\n/)
    .map(
      (p) =>
        `<p style="margin:0 0 16px 0;font-size:15px;color:#E2E8F0;line-height:1.8;white-space:pre-wrap;">${p.trim()}</p>`,
    )
    .join("");

  const attachBanner =
    attachmentsCount > 0
      ? `<div style="margin-top:20px;padding:12px 16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:6px;">
           <span style="color:#F59E0B;font-size:13px;font-weight:600;">&#128206; ${attachmentsCount} Attachment${attachmentsCount > 1 ? "s" : ""} Included</span>
         </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background-color:#07090E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#E2E8F0;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#07090E;padding:32px 16px;">
  <tr><td align="center">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#0F172A;border-radius:12px;border:1px solid #1E293B;box-shadow:0 20px 40px rgba(0,0,0,0.6);overflow:hidden;">

      <!-- Gold Accent Bar -->
      <tr><td style="height:4px;background:linear-gradient(90deg,#D97706,#F59E0B,#FCD34D);"></td></tr>

      <!-- Header -->
      <tr><td style="padding:32px 32px 24px;background:linear-gradient(180deg,#131C31 0%,#0F172A 100%);border-bottom:1px solid #1E293B;">
        <div style="display:inline-block;padding:4px 14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:20px;margin-bottom:14px;">
          <span style="color:#F59E0B;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">OFFICIAL COMMUNICATION</span>
        </div>
        <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;">${safeSubject}</h1>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:28px 32px;background-color:#0F172A;">
        ${paragraphs}
        ${attachBanner}
        <div style="margin-top:28px;padding-top:18px;border-top:1px solid #1E293B;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#FFFFFF;">Warm Regards,</p>
          <p style="margin:0;font-size:14px;font-weight:600;color:#F59E0B;">Singh Automobiles Engine Engineering</p>
        </div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:20px 32px;background-color:#0B1120;border-top:1px solid #1E293B;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#F1F5F9;letter-spacing:0.5px;">SINGH AUTOMOBILES ENGINE ENGINEERING</p>
        <p style="margin:0 0 14px;font-size:11px;color:#94A3B8;">Engine Rebuilding &bull; Precision Diagnostics &bull; Heavy Performance Services</p>
        <div style="padding-top:12px;border-top:1px solid #1E293B;">
          <span style="font-size:10px;color:#64748B;letter-spacing:1px;text-transform:uppercase;">
            Crafted with Precision by <a href="https://asrvtech.in" target="_blank" style="color:#F59E0B;text-decoration:none;font-weight:600;">asrvtech.in</a>
          </span>
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req, res) {
  if (!allowOnlyPost(req, res) || !assertSmtpConfigured(res)) return;

  try {
    const { to, subject, message, attachments } = req.body || {};
    if (!to || !subject || !message) {
      res.status(400).json({ error: "To, subject, and message are required." });
      return;
    }

    const transporter = createTransporter();
    const normalizedFiles = normalizeAttachments(attachments);

    const htmlBody = buildHtmlEmail(
      String(subject),
      String(message),
      normalizedFiles.length,
    );

    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject: String(subject),
      text: appendCredit(String(message)),
      html: htmlBody,
      attachments: normalizedFiles,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Admin SMTP send failed:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
}
