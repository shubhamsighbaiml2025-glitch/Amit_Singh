import {
  allowOnlyPost,
  appendCredit,
  assertSmtpConfigured,
  createTransporter,
  normalizeAttachments,
} from "./_mail.js";
import { renderAdminCustomEmail } from "./_templates.js";

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

    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text: appendCredit(message),
      html: renderAdminCustomEmail({
        subject: String(subject),
        message: String(message),
        attachmentsCount: normalizedFiles.length,
      }),
      attachments: normalizedFiles,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Admin SMTP send failed:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
}
