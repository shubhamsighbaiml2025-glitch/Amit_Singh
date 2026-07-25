/**
 * Ultra-Premium HTML Email Templates for Singh Automobiles Engine Engineering
 * Designed with luxury dark steel & industrial gold aesthetics.
 */

export const mailCreditText = "build by asrvtech.in";
export const mailCreditHtml = `
  <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1E293B; text-align: center;">
    <span style="font-size: 11px; color: #64748B; letter-spacing: 1px; text-transform: uppercase; font-family: sans-serif;">
      Crafted with Precision by <a href="https://asrvtech.in" target="_blank" style="color: #F59E0B; text-decoration: none; font-weight: 600;">asrvtech.in</a>
    </span>
  </div>
`;

/**
 * Base Template Container
 */
export function renderBaseEmail({
  title,
  badgeText = "SINGH AUTOMOBILES",
  badgeColor = "#F59E0B",
  contentHtml,
  ctaText,
  ctaUrl,
  footerNote,
}) {
  const ctaButtonHtml = ctaText && ctaUrl ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 12px 0;">
      <tr>
        <td align="center">
          <a href="${ctaUrl}" target="_blank" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #090D16; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 6px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);">
            ${ctaText}
          </a>
        </td>
      </tr>
    </table>
  ` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Singh Automobiles Notification"}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090E; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #E2E8F0;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #07090E; padding: 30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0F172A; border-radius: 12px; border: 1px solid #1E293B; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);">
          
          <!-- Top Accent Metallic Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #FCD34D 100%);"></td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(180deg, #131C31 0%, #0F172A 100%); border-bottom: 1px solid #1E293B;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 4px 12px; background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; margin-bottom: 12px;">
                      <span style="color: ${badgeColor}; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                        ${badgeText}
                      </span>
                    </div>
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; line-height: 1.3;">
                      ${title}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px; background-color: #0F172A;">
              ${contentHtml}
              ${ctaButtonHtml}
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 24px 32px 28px 32px; background-color: #0B1120; border-top: 1px solid #1E293B;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #F1F5F9; letter-spacing: 0.5px;">
                      SINGH AUTOMOBILES ENGINE ENGINEERING
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                      Engine Rebuilding • Precision Diagnostics • Heavy Performance Services
                    </p>
                    ${footerNote ? `<p style="margin: 0 0 12px 0; font-size: 12px; color: #64748B;">${footerNote}</p>` : ""}
                    ${mailCreditHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Admin Notification for New Enquiry
 */
export function renderEnquiryAdminEmail({ name, email, phone, message, submittedAt }) {
  const contentHtml = `
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #94A3B8; line-height: 1.6;">
      A new customer enquiry has been submitted through the website. Here are the details:
    </p>

    <!-- Details Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #162032; border: 1px solid #26334D; border-radius: 8px; margin-bottom: 24px; overflow: hidden;">
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #26334D; width: 30%; color: #64748B; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Customer
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #26334D; color: #FFFFFF; font-size: 14px; font-weight: 600;">
          ${name}
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #26334D; color: #64748B; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Email
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #26334D; color: #F59E0B; font-size: 14px; font-weight: 600;">
          <a href="mailto:${email}" style="color: #F59E0B; text-decoration: none;">${email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #26334D; color: #64748B; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Phone
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #26334D; color: #E2E8F0; font-size: 14px;">
          ${phone || "Not provided"}
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; color: #64748B; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Received At
        </td>
        <td style="padding: 16px 20px; color: #94A3B8; font-size: 13px;">
          ${submittedAt}
        </td>
      </tr>
    </table>

    <!-- Message Quote Box -->
    <div style="margin-top: 20px; padding: 20px; background-color: #131B2A; border-left: 4px solid #F59E0B; border-radius: 4px;">
      <div style="font-size: 12px; font-weight: 700; color: #F59E0B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        Enquiry Message
      </div>
      <div style="font-size: 14px; color: #F1F5F9; line-height: 1.7; white-space: pre-line;">
        ${message}
      </div>
    </div>
  `;

  return renderBaseEmail({
    title: `New Enquiry from ${name}`,
    badgeText: "WEBSITE ENQUIRY",
    badgeColor: "#F59E0B",
    contentHtml,
    ctaText: "Reply to Customer",
    ctaUrl: `mailto:${email}?subject=Re:%20Your%20Enquiry%20-%20Singh%20Automobiles`,
  });
}

/**
 * 2. User Confirmation for New Enquiry
 */
export function renderEnquiryUserEmail({ name, email, phone, message }) {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #FFFFFF; font-weight: 600;">
      Hello ${name},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #94A3B8; line-height: 1.6;">
      Thank you for contacting <strong style="color: #F59E0B;">Singh Automobiles Engine Engineering</strong>. We have received your inquiry and our engineering team will get back to you shortly.
    </p>

    <!-- Submitted Details Summary -->
    <div style="background-color: #162032; border: 1px solid #26334D; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
        Summary of your request
      </div>
      <div style="font-size: 14px; color: #CBD5E1; line-height: 1.6; white-space: pre-line; background-color: #0F172A; padding: 14px; border-radius: 6px; border: 1px solid #1E293B;">
        ${message}
      </div>
    </div>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: #94A3B8;">
      If you have an urgent inquiry regarding engine services, feel free to visit us or contact us directly.
    </p>
  `;

  return renderBaseEmail({
    title: "We Received Your Inquiry",
    badgeText: "CONFIRMATION RECEIPT",
    badgeColor: "#10B981",
    contentHtml,
  });
}

/**
 * Helper to render Star Rating HTML
 */
function renderStarRating(rating) {
  const numRating = Number(rating) || 5;
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= numRating) {
      stars += `<span style="color: #F59E0B; font-size: 22px; margin-right: 4px;">★</span>`;
    } else {
      stars += `<span style="color: #334155; font-size: 22px; margin-right: 4px;">★</span>`;
    }
  }
  return `
    <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0 16px 0;">
      <div>${stars}</div>
      <span style="background-color: rgba(245, 158, 11, 0.15); color: #F59E0B; font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.3);">
        ${numRating}.0 / 5.0
      </span>
    </div>
  `;
}

/**
 * 3. Admin Notification for New Review
 */
export function renderReviewAdminEmail({ name, email, rating, description, submittedAt }) {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #94A3B8; line-height: 1.6;">
      A new customer review has been posted on the website.
    </p>

    <!-- Star Rating Banner -->
    <div style="background-color: #162032; border: 1px solid #26334D; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">
        Rating Given
      </div>
      ${renderStarRating(rating)}

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 12px; border-top: 1px solid #26334D; padding-top: 12px;">
        <tr>
          <td style="font-size: 13px; color: #94A3B8; width: 100px;">Reviewer:</td>
          <td style="font-size: 14px; color: #FFFFFF; font-weight: 600;">${name}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #94A3B8;">Email:</td>
          <td style="font-size: 14px; color: #F59E0B;">${email}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #94A3B8;">Submitted:</td>
          <td style="font-size: 13px; color: #64748B;">${submittedAt}</td>
        </tr>
      </table>
    </div>

    <!-- Review Text Box -->
    <div style="padding: 20px; background-color: #131B2A; border-left: 4px solid #F59E0B; border-radius: 4px;">
      <div style="font-size: 12px; font-weight: 700; color: #F59E0B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        Review Content
      </div>
      <div style="font-size: 14px; color: #F1F5F9; line-height: 1.7; font-style: italic; white-space: pre-line;">
        "${description}"
      </div>
    </div>
  `;

  return renderBaseEmail({
    title: `New ${rating}-Star Review from ${name}`,
    badgeText: "CUSTOMER REVIEW",
    badgeColor: "#F59E0B",
    contentHtml,
  });
}

/**
 * 4. User Thank You for New Review
 */
export function renderReviewUserEmail({ name, email, rating, description }) {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #FFFFFF; font-weight: 600;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #94A3B8; line-height: 1.6;">
      Thank you for taking the time to leave a review for <strong style="color: #F59E0B;">Singh Automobiles Engine Engineering</strong>. Your feedback helps us maintain the highest standard of precision and service.
    </p>

    <!-- Review Card Summary -->
    <div style="background-color: #162032; border: 1px solid #26334D; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
        Your Rating
      </div>
      ${renderStarRating(rating)}
      
      <div style="margin-top: 12px; padding: 14px; background-color: #0F172A; border-radius: 6px; border: 1px solid #1E293B;">
        <p style="margin: 0; font-size: 14px; color: #CBD5E1; line-height: 1.6; font-style: italic;">
          "${description}"
        </p>
      </div>
    </div>

    <p style="margin: 0; font-size: 14px; color: #94A3B8;">
      We look forward to serving you again!
    </p>
  `;

  return renderBaseEmail({
    title: "Thank You For Your Review!",
    badgeText: "FEEDBACK ACKNOWLEDGEMENT",
    badgeColor: "#F59E0B",
    contentHtml,
  });
}

/**
 * 5. Admin Panel Direct Mail (Sent by Admin to any Client/User)
 */
export function renderAdminCustomEmail({ subject, message, attachmentsCount = 0 }) {
  // Format standard multiline text message into structured HTML paragraphs
  const formattedParagraphs = message
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin: 0 0 16px 0; font-size: 15px; color: #E2E8F0; line-height: 1.7; white-space: pre-line;">${p.trim()}</p>`)
    .join("");

  const attachmentBannerHtml = attachmentsCount > 0 ? `
    <div style="margin-top: 24px; padding: 12px 16px; background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; display: flex; align-items: center; gap: 10px;">
      <span style="color: #F59E0B; font-size: 13px; font-weight: 600;">
        📎 ${attachmentsCount} File Attachment${attachmentsCount > 1 ? "s" : ""} Included
      </span>
    </div>
  ` : "";

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      ${formattedParagraphs}
    </div>

    ${attachmentBannerHtml}

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1E293B;">
      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #FFFFFF;">
        Warm Regards,
      </p>
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #F59E0B;">
        Singh Automobiles Engine Engineering
      </p>
    </div>
  `;

  return renderBaseEmail({
    title: subject,
    badgeText: "OFFICIAL COMMUNICATION",
    badgeColor: "#F59E0B",
    contentHtml,
  });
}
