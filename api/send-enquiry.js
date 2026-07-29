import {
  adminEmail,
  allowOnlyPost,
  appendCredit,
  createTransporter,
  getMissingSmtpFields,
} from "./_mail.js";
import { getAdminDb } from "./_firebase-admin.js";
import { renderEnquiryAdminEmail, renderEnquiryUserEmail } from "./_templates.js";

export default async function handler(req, res) {
  if (!allowOnlyPost(req, res)) return;

  try {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
      res.status(400).json({ error: "Name, email, and message are required." });
      return;
    }

    await getAdminDb().collection("enquiries").add({
      name: String(name),
      email: String(email),
      phone: String(phone || ""),
      message: String(message),
      submittedAt: new Date(),
    });

    const missingSmtpFields = getMissingSmtpFields();
    if (missingSmtpFields.length > 0) {
      console.warn(`Enquiry saved, email skipped. Missing SMTP: ${missingSmtpFields.join(", ")}`);
      res.status(200).json({ ok: true, emailSent: false });
      return;
    }

    try {
      const transporter = createTransporter();
      const submittedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      // Email to Admin (Ultra-attractive colorful card)
      await transporter.sendMail({
        from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
        to: adminEmail,
        replyTo: email,
        subject: `New enquiry from ${name}`,
        text: [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "Not provided"}`, `Submitted: ${submittedAt}`, "", appendCredit(message)].join("\n"),
        html: renderEnquiryAdminEmail({ name: String(name), email: String(email), phone: String(phone || ""), message: String(message), submittedAt }),
      });

      // Email to Customer (Ultra-attractive colorful receipt)
      await transporter.sendMail({
        from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: "We received your enquiry — Singh Automobiles",
        text: appendCredit(`Hello ${name},\n\nThank you for reaching out to Singh Automobiles. We will connect with you shortly.\n\nRegards,\nSingh Automobiles`),
        html: renderEnquiryUserEmail({ name: String(name), email: String(email), phone: String(phone || ""), message: String(message) }),
      });

      res.status(200).json({ ok: true, emailSent: true });
    } catch (emailError) {
      console.error("Enquiry saved, SMTP failed:", emailError);
      res.status(200).json({ ok: true, emailSent: false });
    }
  } catch (error) {
    console.error("Enquiry save failed:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to save enquiry." });
  }
}
