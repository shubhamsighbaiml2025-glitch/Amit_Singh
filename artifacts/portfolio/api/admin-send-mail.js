import {
  allowOnlyPost,
  appendCredit,
  assertSmtpConfigured,
  createTransporter,
  normalizeAttachments,
} from "./_mail.js";

export default async function handler(req, res) {
  if (!allowOnlyPost(req, res) || !assertSmtpConfigured(res)) return;

  try {
    const { to, subject, message, attachments } = req.body || {};
    if (!to || !subject || !message) {
      res.status(400).json({ error: "To, subject, and message are required." });
      return;
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text: appendCredit(message),
      attachments: normalizeAttachments(attachments),
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Admin SMTP send failed:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
}
