import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import { getAdminDb } from "../api/_firebase-admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const app = express();
const port = Number(process.env.SMTP_API_PORT || 4174);
const adminEmail = process.env.SMTP_TO_EMAIL || "amitsingh6061.innet@gmail.com";
const mailCredit = "build by asrvtech.in";

app.use(express.json({ limit: "15mb" }));

// ─── SMTP Helpers ───────────────────────────────────────────────────────────

const requiredSmtpFields = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM_EMAIL"];

function getMissingSmtpFields() {
  return requiredSmtpFields.filter((key) => !process.env[key]);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function appendCredit(message = "") {
  return `${String(message).trim()}\n\n${mailCredit}`;
}

function normalizeRating(value) {
  const r = Number(value);
  if (!Number.isFinite(r)) return 5;
  return Math.min(5, Math.max(1, Math.round(r)));
}

function normalizeAttachments(files = []) {
  return files
    .filter((f) => f?.name && f?.content && f?.type)
    .slice(0, 5)
    .map((f) => ({ filename: f.name, content: f.content, encoding: "base64", contentType: f.type }));
}

// ─── Inline HTML Templates ──────────────────────────────────────────────────

function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function starRating(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="font-size:20px;color:${i < rating ? "#F59E0B" : "#334155"};">${i < rating ? "&#9733;" : "&#9734;"}</span>`
  ).join("");
}

function emailShell(badgeLabel, headingHtml, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Singh Automobiles</title></head>
<body style="margin:0;padding:0;background:#07090E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#E2E8F0;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#07090E;padding:32px 16px;">
  <tr><td align="center">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#0F172A;border-radius:12px;border:1px solid #1E293B;box-shadow:0 20px 40px rgba(0,0,0,0.6);overflow:hidden;">
      <tr><td style="height:4px;background:linear-gradient(90deg,#D97706,#F59E0B,#FCD34D);"></td></tr>
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
    <td style="padding:10px 14px;border-bottom:1px solid #1E293B;font-size:12px;color:#94A3B8;font-weight:600;text-transform:uppercase;white-space:nowrap;width:30%;">${esc(label)}</td>
    <td style="padding:10px 14px;border-bottom:1px solid #1E293B;font-size:14px;color:#E2E8F0;">${esc(value)}</td>
  </tr>`;
}

// Admin gets full customer details + reply button
function buildAdminEnquiryEmail({ name, email, phone, message, submittedAt }) {
  const heading = `<h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">New Customer Enquiry</h1>`;
  const body = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#080F1E;border:1px solid #1E293B;border-radius:8px;border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("Name", name)}${infoRow("Email", email)}${infoRow("Phone", phone || "Not provided")}${infoRow("Submitted", submittedAt)}
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

// Customer gets a premium confirmation email
function buildUserEnquiryEmail({ name }) {
  const heading = `<h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">We Received Your Enquiry</h1>`;
  const body = `
    <p style="font-size:16px;color:#E2E8F0;line-height:1.7;margin:0 0 16px;">Dear <strong style="color:#F59E0B;">${esc(name)}</strong>,</p>
    <p style="font-size:15px;color:#CBD5E1;line-height:1.7;margin:0 0 16px;">Thank you for reaching out to <strong style="color:#FFFFFF;">Singh Automobiles Engine Engineering</strong>. We have received your enquiry and will get back to you as soon as possible.</p>
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

// Admin gets review with star rating
function buildAdminReviewEmail({ name, email, rating, description, submittedAt }) {
  const heading = `<h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">New Customer Review — ${rating}/5 Stars</h1>`;
  const body = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#080F1E;border:1px solid #1E293B;border-radius:8px;border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("Name", name)}${infoRow("Email", email)}${infoRow("Submitted", submittedAt)}
    </table>
    <div style="text-align:center;margin:20px 0 16px;">${starRating(rating)}</div>
    <p style="font-size:12px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Review</p>
    <div style="background:#080F1E;border:1px solid #1E293B;border-radius:8px;padding:16px;">
      <p style="margin:0;font-size:14px;color:#E2E8F0;line-height:1.7;white-space:pre-wrap;">${esc(description)}</p>
    </div>
    <div style="margin-top:20px;text-align:center;">
      <a href="mailto:${esc(email)}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#F59E0B,#D97706);color:#090D16;font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;">Reply to ${esc(name)}</a>
    </div>`;
  return emailShell("NEW REVIEW RECEIVED", heading, body);
}

// Customer gets a thank-you with their review quoted
function buildUserReviewEmail({ name, rating, description }) {
  const heading = `<h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">Thank You for Your Review!</h1>`;
  const body = `
    <p style="font-size:16px;color:#E2E8F0;line-height:1.7;margin:0 0 16px;">Dear <strong style="color:#F59E0B;">${esc(name)}</strong>,</p>
    <p style="font-size:15px;color:#CBD5E1;line-height:1.7;margin:0 0 16px;">Thank you for reviewing <strong style="color:#FFFFFF;">Singh Automobiles Engine Engineering</strong>. Your feedback means a great deal to us.</p>
    <div style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#94A3B8;">Your Rating</p>
      <div>${starRating(rating)}</div>
      <p style="margin:12px 0 0;font-size:13px;color:#E2E8F0;line-height:1.6;font-style:italic;">"${esc(description)}"</p>
    </div>
    <div style="margin-top:24px;padding-top:18px;border-top:1px solid #1E293B;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#FFFFFF;">Warm Regards,</p>
      <p style="margin:0;font-size:14px;font-weight:600;color:#F59E0B;">Singh Automobiles Engine Engineering</p>
    </div>`;
  return emailShell("REVIEW CONFIRMED", heading, body);
}

// Admin custom mail from admin panel
function buildAdminCustomEmail(subject, message, attachmentsCount) {
  const safeSubject = esc(subject || "Message from Singh Automobiles");
  const paragraphs = esc(message || "")
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px 0;font-size:15px;color:#E2E8F0;line-height:1.8;white-space:pre-wrap;">${p.trim()}</p>`)
    .join("");
  const attachBanner = attachmentsCount > 0
    ? `<div style="margin-top:20px;padding:12px 16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:6px;">
         <span style="color:#F59E0B;font-size:13px;font-weight:600;">&#128206; ${attachmentsCount} Attachment${attachmentsCount > 1 ? "s" : ""} Included</span>
       </div>`
    : "";
  const heading = `<h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${safeSubject}</h1>`;
  const body = `
    ${paragraphs}
    ${attachBanner}
    <div style="margin-top:28px;padding-top:18px;border-top:1px solid #1E293B;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#FFFFFF;">Warm Regards,</p>
      <p style="margin:0;font-size:14px;font-weight:600;color:#F59E0B;">Singh Automobiles Engine Engineering</p>
    </div>`;
  return emailShell("OFFICIAL COMMUNICATION", heading, body);
}

// ─── Routes ─────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, smtpConfigured: getMissingSmtpFields().length === 0 });
});

app.post("/api/send-enquiry", async (req, res) => {
  try {
    const missing = getMissingSmtpFields();
    if (missing.length > 0) {
      res.status(500).json({ error: `Missing SMTP config: ${missing.join(", ")}` });
      return;
    }

    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
      res.status(400).json({ error: "Name, email, and message are required." });
      return;
    }

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
      text: appendCredit(`Hello ${name},\n\nThank you for reaching out. We will connect with you shortly.\n\nRegards,\nSingh Automobiles`),
      html: buildUserEnquiryEmail({ name: String(name) }),
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Enquiry SMTP failed:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.post("/api/send-review", async (req, res) => {
  try {
    const { name, email, rating, description } = req.body || {};
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim();
    const cleanDescription = String(description || "").trim();
    const cleanRating = normalizeRating(rating);

    if (!cleanName || !cleanEmail || !cleanDescription) {
      res.status(400).json({ error: "Name, email, and review description are required." });
      return;
    }

    await getAdminDb().collection("reviews").add({
      name: cleanName, email: cleanEmail, rating: cleanRating, description: cleanDescription, createdAt: new Date(),
    });

    const missing = getMissingSmtpFields();
    if (missing.length > 0) {
      console.warn(`Review saved, email skipped. Missing: ${missing.join(", ")}`);
      res.json({ ok: true, emailSent: false });
      return;
    }

    const transporter = createTransporter();
    const submittedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Email to Admin
    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to: adminEmail,
      replyTo: cleanEmail,
      subject: `New ${cleanRating}-star review from ${cleanName}`,
      text: [`Name: ${cleanName}`, `Email: ${cleanEmail}`, `Rating: ${cleanRating}/5`, `Submitted: ${submittedAt}`, "", appendCredit(cleanDescription)].join("\n"),
      html: buildAdminReviewEmail({ name: cleanName, email: cleanEmail, rating: cleanRating, description: cleanDescription, submittedAt }),
    });

    // Email to Customer
    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to: cleanEmail,
      subject: "Thank you for reviewing Singh Automobiles",
      text: appendCredit(`Hello ${cleanName},\n\nThank you for your ${cleanRating}-star review. We truly appreciate your feedback.\n\nRegards,\nSingh Automobiles`),
      html: buildUserReviewEmail({ name: cleanName, rating: cleanRating, description: cleanDescription }),
    });

    res.json({ ok: true, emailSent: true });
  } catch (error) {
    console.error("Review save/send failed:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to submit review." });
  }
});

app.post("/api/admin-send-mail", async (req, res) => {
  try {
    const missing = getMissingSmtpFields();
    if (missing.length > 0) {
      res.status(500).json({ error: `Missing SMTP config: ${missing.join(", ")}` });
      return;
    }

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
      subject: String(subject),
      text: appendCredit(String(message)),
      html: buildAdminCustomEmail(String(subject), String(message), normalizedFiles.length),
      attachments: normalizedFiles,
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Admin mail SMTP failed:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(port, () => {
  console.log(`SMTP API running on http://localhost:${port}`);
});
