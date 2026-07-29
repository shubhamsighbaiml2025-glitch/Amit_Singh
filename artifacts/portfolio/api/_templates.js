import { renderBrandedEmail } from "./_branded-email.js";

export const mailCreditText = "build by asrvtech.in";
export const mailCreditHtml = `
  <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1E293B; text-align: center;">
    <span style="font-size: 11px; color: #64748B; letter-spacing: 1px; text-transform: uppercase; font-family: sans-serif;">
      Crafted with Precision by <a href="https://asrvtech.in" target="_blank" style="color: #F59E0B; text-decoration: none; font-weight: 600;">asrvtech.in</a>
    </span>
  </div>
`;

/**
 * 1. Admin Notification for New Enquiry
 */
export function renderEnquiryAdminEmail({ name, email, phone, message, submittedAt }) {
  return renderBrandedEmail({
    themeId: "precision",
    subject: `New Enquiry from ${name}`,
    introText: "A new customer enquiry has been submitted through the website.",
    message: message,
    details: [
      { label: "Customer", value: name },
      { label: "Email", value: email, isLink: true, linkUrl: `mailto:${email}` },
      { label: "Phone", value: phone || "Not provided" },
      { label: "Received At", value: submittedAt },
    ],
    ctaText: `Reply to ${name}`,
    ctaUrl: `mailto:${email}?subject=Re:%20Your%20Enquiry%20-%20Singh%20Automobiles`,
  });
}

/**
 * 2. User Confirmation for New Enquiry
 */
export function renderEnquiryUserEmail({ name, email, phone, message }) {
  return renderBrandedEmail({
    themeId: "precision",
    subject: "We Received Your Enquiry",
    introText: `Hello ${name}, thank you for contacting Singh Automobiles.`,
    message: `We have received your inquiry and our engineering team will get back to you shortly.\n\nSummary of your request:\n"${message}"\n\nIf you have an urgent inquiry regarding engine services, feel free to visit us or contact us directly.`,
  });
}

/**
 * 3. Admin Notification for New Review
 */
export function renderReviewAdminEmail({ name, email, rating, description, submittedAt }) {
  return renderBrandedEmail({
    themeId: "performance",
    subject: `New ${rating}-Star Review from ${name}`,
    introText: "A new customer review has been posted on the website.",
    message: description,
    rating: rating,
    details: [
      { label: "Reviewer", value: name },
      { label: "Email", value: email, isLink: true, linkUrl: `mailto:${email}` },
      { label: "Submitted At", value: submittedAt },
    ],
    ctaText: `Reply to ${name}`,
    ctaUrl: `mailto:${email}?subject=Re:%20Your%20Review%20-%20Singh%20Automobiles`,
  });
}

/**
 * 4. User Thank You for New Review
 */
export function renderReviewUserEmail({ name, email, rating, description }) {
  return renderBrandedEmail({
    themeId: "performance",
    subject: "Thank You For Your Review!",
    introText: `Dear ${name}, thank you for taking the time to leave a review for Singh Automobiles.`,
    message: `Your feedback helps us maintain the highest standard of precision and service.\n\nYour submitted review:\n"${description}"\n\nWe look forward to serving you again!`,
    rating: rating,
  });
}

/**
 * 5. Admin Custom Mail (Sent from Admin Panel)
 */
export function renderAdminCustomEmail({ themeId = "precision", subject, message, attachmentsCount = 0 }) {
  return renderBrandedEmail({
    themeId,
    subject: subject || "Message from Singh Automobiles",
    message,
    attachmentsCount,
  });
}
