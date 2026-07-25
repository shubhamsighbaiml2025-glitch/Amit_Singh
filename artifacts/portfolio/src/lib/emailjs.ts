// ─── EmailJS Configuration ────────────────────────────────────────────────────
// Replace the placeholder values below with your actual EmailJS credentials.
// Sign up at https://www.emailjs.com/, create a service (Gmail recommended),
// then create two email templates: one for admin notification, one for user auto-reply.
// ──────────────────────────────────────────────────────────────────────────────

import emailjs from "@emailjs/browser";

export const EMAILJS_SERVICE_ID =
  import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";

export const EMAILJS_TEMPLATE_ADMIN =
  import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN || "YOUR_ADMIN_TEMPLATE_ID";

export const EMAILJS_TEMPLATE_USER =
  import.meta.env.VITE_EMAILJS_TEMPLATE_USER || "YOUR_USER_TEMPLATE_ID";

export const EMAILJS_PUBLIC_KEY =
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

/**
 * Sends an enquiry:
 *  1. Notifies the admin (amitsingh6061.innet@gmail.com) with the enquiry details.
 *  2. Sends an auto-reply to the user confirming receipt.
 */
export async function sendEnquiryEmails(params: {
  fromName: string;
  fromEmail: string;
  fromPhone?: string;
  message: string;
}) {
  const adminParams = {
    to_email: "amitsingh6061.innet@gmail.com",
    from_name: params.fromName,
    from_email: params.fromEmail,
    from_phone: params.fromPhone || "Not provided",
    message: params.message,
    enquiry_time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  };

  const userParams = {
    to_email: params.fromEmail,
    to_name: params.fromName,
    reply_message:
      "Thank you for reaching out to Singh Automobiles Engine Engineering. We will be connecting with you as soon as possible.",
  };

  // Send both concurrently
  await Promise.all([
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ADMIN, adminParams),
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_USER, userParams),
  ]);
}
