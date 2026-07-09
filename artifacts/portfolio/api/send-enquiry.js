import {
  adminEmail,
  allowOnlyPost,
  appendCredit,
  assertSmtpConfigured,
  createTransporter,
} from "./_mail.js";

export default async function handler(req, res) {
  if (!allowOnlyPost(req, res) || !assertSmtpConfigured(res)) return;

  try {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
      res.status(400).json({ error: "Name, email, and message are required." });
      return;
    }

    const transporter = createTransporter();
    const submittedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to: adminEmail,
      replyTo: email,
      subject: `New enquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Submitted: ${submittedAt}`,
        "",
        appendCredit(message),
      ].join("\n"),
    });

    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "We received your enquiry",
      text: appendCredit(`Hello ${name},\n\nThank you for reaching out to Singh Automobiles Engine Engineering. We will connect with you as soon as possible.\n\nRegards,\nSingh Automobiles`),
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("SMTP send failed:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
}
