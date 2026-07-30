/**
 * Client-side email template preview renderer
 * Mirrors the server-side _templates.js but runs in the browser for preview.
 */

export function buildAdminMailPreviewHtml({
  subject,
  message,
  attachmentsCount = 0,
}: {
  subject: string;
  message: string;
  attachmentsCount?: number;
}): string {
  const displaySubject = subject || "Your subject will appear here";
  const displayMessage = message || "Start typing your message to see how it will look in the recipient's inbox...";

  const formattedParagraphs = displayMessage
    .split(/\n\s*\n/)
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; font-size: 15px; color: #E2E8F0; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(p.trim())}</p>`,
    )
    .join("");

  const attachmentBannerHtml =
    attachmentsCount > 0
      ? `<div style="margin-top: 24px; padding: 12px 16px; background-color: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 6px;">
           <span style="color: #F59E0B; font-size: 13px; font-weight: 600;">
             📎 ${attachmentsCount} File Attachment${attachmentsCount > 1 ? "s" : ""} Included
           </span>
         </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(displaySubject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #E2E8F0;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #07090E; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #0F172A; border-radius: 12px; border: 1px solid #1E293B; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">

          <!-- Gold Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #FCD34D 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 28px 20px 28px; background: linear-gradient(180deg, #131C31 0%, #0F172A 100%); border-bottom: 1px solid #1E293B;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 20px; margin-bottom: 10px;">
                <span style="color: #F59E0B; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">OFFICIAL COMMUNICATION</span>
              </div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; line-height: 1.3;">
                ${escapeHtml(displaySubject)}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px; background-color: #0F172A;">
              ${formattedParagraphs}
              ${attachmentBannerHtml}
              <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #1E293B;">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #FFFFFF;">Warm Regards,</p>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #F59E0B;">Singh Automobiles</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px 24px 28px; background-color: #0B1120; border-top: 1px solid #1E293B; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #F1F5F9; letter-spacing: 0.5px;">SINGH AUTOMOBILES ENGINE ENGINEERING</p>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #94A3B8;">Engine Rebuilding • Precision Diagnostics • Heavy Performance Services</p>
              <div style="padding-top: 12px; border-top: 1px solid #1E293B;">
                <span style="font-size: 10px; color: #64748B; letter-spacing: 1px; text-transform: uppercase;">
                  Crafted with Precision by <a href="https://asrvtech.in" target="_blank" style="color: #F59E0B; text-decoration: none; font-weight: 600;">asrvtech.in</a>
                </span>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
