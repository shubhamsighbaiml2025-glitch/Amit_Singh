import nodemailer from "nodemailer";

export const adminEmail = process.env.SMTP_TO_EMAIL || "amitsingh6061.innet@gmail.com";
export const mailCredit = "build by asrvtech.in";

const requiredSmtpFields = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM_EMAIL",
];

export function getMissingSmtpFields() {
  return requiredSmtpFields.filter((key) => !process.env[key]);
}

export function createTransporter() {
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

export function appendCredit(message = "") {
  const trimmed = String(message).trim();
  return `${trimmed}\n\n${mailCredit}`;
}

export function normalizeAttachments(files = []) {
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

export function allowOnlyPost(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return false;
  }

  return true;
}

export function assertSmtpConfigured(res) {
  const missing = getMissingSmtpFields();
  if (missing.length > 0) {
    res.status(500).json({ error: `Missing SMTP config: ${missing.join(", ")}` });
    return false;
  }

  return true;
}
