import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import { getAdminDb } from "../api/_firebase-admin.js";
import {
  renderBrandedEmail,
  getEmailTheme,
} from "../api/_branded-email.js";
import {
  renderEnquiryAdminEmail,
  renderEnquiryUserEmail,
  renderReviewAdminEmail,
  renderReviewUserEmail,
} from "../api/_templates.js";

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
      html: renderEnquiryAdminEmail({ name: String(name), email: String(email), phone: String(phone || ""), message: String(message), submittedAt }),
    });

    // Email to Customer
    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "We received your enquiry — Singh Automobiles",
      text: appendCredit(`Hello ${name},\n\nThank you for reaching out. We will connect with you shortly.\n\nRegards,\nSingh Automobiles`),
      html: renderEnquiryUserEmail({ name: String(name), email: String(email), phone: String(phone || ""), message: String(message) }),
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
      html: renderReviewAdminEmail({ name: cleanName, email: cleanEmail, rating: cleanRating, description: cleanDescription, submittedAt }),
    });

    // Email to Customer
    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to: cleanEmail,
      subject: "Thank you for reviewing Singh Automobiles",
      text: appendCredit(`Hello ${cleanName},\n\nThank you for your ${cleanRating}-star review. We truly appreciate your feedback.\n\nRegards,\nSingh Automobiles`),
      html: renderReviewUserEmail({ name: cleanName, email: cleanEmail, rating: cleanRating, description: cleanDescription }),
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

    const { to, subject, message, attachments, themeId = "precision" } = req.body || {};
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

    res.json({ ok: true });
  } catch (error) {
    console.error("Admin mail SMTP failed:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(port, () => {
  console.log(`SMTP API running on http://localhost:${port}`);
});
