import {
  adminEmail,
  allowOnlyPost,
  appendCredit,
  createTransporter,
  getMissingSmtpFields,
} from "./_mail.js";
import { getAdminDb } from "./_firebase-admin.js";

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function goldBar() {
  return `<tr><td style="height:4px;background:linear-gradient(90deg,#D97706,#F59E0B,#FCD34D);"></td></tr>`;
}

function emailShell(badgeLabel, headingHtml, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Singh Automobiles</title></head>
<body style="margin:0;padding:0;background:#07090E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#E2E8F0;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#07090E;padding:32px 16px;">
  <tr><td align="center">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#0F172A;border-radius:12px;border:1px solid #1E293B;box-shadow:0 20px 40px rgba(0,0,0,0.6);overflow:hidden;">
      ${goldBar()}
      <tr><td style="padding:28px 32px 20px;background:linear-gradient(180deg,#131C31,#0F172A);border-bottom:1px solid #1E293B;">
        <div style="display:inline-block;padding:4px 14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:20px;margin-bottom:12px;">
          <span style="color:#F59E0B;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${esc(badgeLabel)}</span>
        </div>
        ${headingHtml}
      </td></tr>
      <tr><td style="padding:28px 32px;background:#0F172A;">${bodyHtml}</td></tr>
      <tr><td style="padding:20px 32px;background:#0B1120;border-top:1px solid #1E293B;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#F1F5F9;letter-spacing:0.5px;">SINGH AUTOMOBILES ENGINE ENGINEERING</p>
        <p style="margin:0 0 12px;font-size:11px;color:#94A3B8;">Engine Rebuilding &bull; Precision Diagnostics &bull; Heavy Performance</p>
        <div style="padding-top:12px;border-top:1px solid #1E293B;">
          <span style="font-size:10px;color:#64748B;letter-spacing:1px;text-transform:uppercase;">
            Crafted with Precision by <a href="https://asrvtech.in" target="_blank" style="color:#F59E0B;text-decoration:none;font-weight:600;">asrvtech.in</a>
          </span>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function infoRow(label, value) {
  return `<tr>
    <td style="padding:10px 14px;border-bottom:1px solid #1E293B;font-size:12px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;width:30%;">${esc(label)}</td>
    <td style="padding:10px 14px;border-bottom:1px solid #1E293B;font-size:14px;color:#E2E8F0;">${esc(value)}</td>
  </tr>`;
}

function buildAdminEnquiryEmail({ name, email, phone, message, submittedAt }) {
  const heading = `<h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">New Customer Enquiry</h1>`;
  const body = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#080F1E;border:1px solid #1E293B;border-radius:8px;border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("Name", name)}
      ${infoRow("Email", email)}
      ${infoRow("Phone", phone || "Not provided")}
      ${infoRow("Submitted", submittedAt)}
    </table>
    <p style="font-size:12px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Message</p>
    <div style="background:#080F1E;border:1px solid #1E293B;border-radius:8px;padding:16px;">
      <p style="margin:0;font-size:14px;color:#E2E8F0;line-height:1.7;white-space:pre-wrap;">${esc(message)}</p>
    </div>
    <div style="margin-top:20px;text-align:center;">
      <a href="mailto:${esc(email)}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#F59E0B,#D97706);color:#090D16;font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;">Reply to ${esc(name)}</a>
    </div>`;
  return emailShell("NEW ENQUIRY", heading, body);
}

function buildUserEnquiryEmail({ name }) {
  const heading = `<h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">We Received Your Enquiry</h1>`;
  const body = `
    <p style="font-size:16px;color:#E2E8F0;line-height:1.7;margin:0 0 16px;">Dear <strong style="color:#F59E0B;">${esc(name)}</strong>,</p>
    <p style="font-size:15px;color:#CBD5E1;line-height:1.7;margin:0 0 16px;">Thank you for reaching out to <strong style="color:#FFFFFF;">Singh Automobiles Engine Engineering</strong>. We have received your enquiry and our team will get back to you as soon as possible.</p>
    <div style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:13px;color:#94A3B8;font-weight:600;">What happens next?</p>
      <p style="margin:0;font-size:14px;color:#E2E8F0;line-height:1.6;">Our team typically responds within 24 hours. For urgent matters, you can reach us directly.</p>
    </div>
    <div style="margin-top:24px;padding-top:18px;border-top:1px solid #1E293B;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#FFFFFF;">Warm Regards,</p>
      <p style="margin:0;font-size:14px;font-weight:600;color:#F59E0B;">Singh Automobiles Engine Engineering</p>
    </div>`;
  return emailShell("ENQUIRY RECEIVED", heading, body);
}

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

      // Email to Admin
      await transporter.sendMail({
        from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
        to: adminEmail,
        replyTo: email,
        subject: `New enquiry from ${name}`,
        text: [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "Not provided"}`, `Submitted: ${submittedAt}`, "", appendCredit(message)].join("\n"),
        html: buildAdminEnquiryEmail({ name: String(name), email: String(email), phone: String(phone || ""), message: String(message), submittedAt }),
      });

      // Email to Customer
      await transporter.sendMail({
        from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: "We received your enquiry — Singh Automobiles",
        text: appendCredit(`Hello ${name},\n\nThank you for reaching out to Singh Automobiles Engine Engineering. We will connect with you shortly.\n\nRegards,\nSingh Automobiles`),
        html: buildUserEnquiryEmail({ name: String(name) }),
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
