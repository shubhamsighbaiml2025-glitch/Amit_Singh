import {
  allowOnlyPost,
  appendCredit,
  assertSmtpConfigured,
  createTransporter,
  normalizeAttachments,
} from "./_mail.js";
import { renderBrandedEmail } from "./_branded-email.js";

export default async function handler(req, res) {
  if (!allowOnlyPost(req, res) || !assertSmtpConfigured(res)) return;

  try {
    const { to, subject, message, attachments, themeId = "precision", badgeText } = req.body || {};
    if (!to || !subject || !message) {
      res.status(400).json({ error: "To, subject, and message are required." });
      return;
    }

    const transporter = createTransporter();
    const normalizedFiles = normalizeAttachments(attachments);

    const htmlBody = renderBrandedEmail({
      themeId: String(themeId || "precision"),
      subject: String(subject),
      message: String(message),
      badgeText: badgeText ? String(badgeText) : undefined,
      attachmentsCount: normalizedFiles.length,
    });

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
