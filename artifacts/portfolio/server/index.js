import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const app = express();
const port = Number(process.env.SMTP_API_PORT || 4174);
const adminEmail = process.env.SMTP_TO_EMAIL || "amitsingh6061.innet@gmail.com";
const mailCredit = "build by asrvtech.in";

app.use(express.json({ limit: "15mb" }));

const requiredSmtpFields = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM_EMAIL",
];

function getMissingSmtpFields() {
  return requiredSmtpFields.filter((key) => !process.env[key]);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function appendCredit(message = "") {
  const trimmed = String(message).trim();
  return `${trimmed}\n\n${mailCredit}`;
}

function normalizeAttachments(files = []) {
  return files
    .filter((file) => file?.name && file?.content && file?.type)
    .slice(0, 5)
    .map((file) => ({
      filename: file.name,
      content: file.content,
      encoding: "base64",
      contentType: file.type,
    }));
}

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

    res.json({ ok: true });
  } catch (error) {
    console.error("SMTP send failed:", error);
    res.status(500).json({ error: "Failed to send email." });
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

    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text: appendCredit(message),
      attachments: normalizeAttachments(attachments),
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("SMTP send failed:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(port, () => {
  console.log(`SMTP API running on http://localhost:${port}`);
});
