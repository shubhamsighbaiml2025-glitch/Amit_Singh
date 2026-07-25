export const themes = {
  precision: {
    id: "precision",
    label: "Precision Gold",
    desc: "Industrial Dark & Amber Gold",
    badge: "OFFICIAL COMMUNICATION",
    bg: "#07090E",
    panel: "#0F172A",
    panel2: "#131C31",
    border: "#26334D",
    text: "#E2E8F0",
    muted: "#94A3B8",
    accent: "#F59E0B",
    accentGlow: "rgba(245, 158, 11, 0.15)",
    buttonText: "#090D16",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #FCD34D 100%)",
  },
  performance: {
    id: "performance",
    label: "Performance Red",
    desc: "High-Energy Crimson & Flame",
    badge: "PERFORMANCE NOTICE",
    bg: "#0D0406",
    panel: "#1A0A0F",
    panel2: "#260E16",
    border: "#4A1523",
    text: "#FFF1F2",
    muted: "#FCA5A5",
    accent: "#EF4444",
    accentGlow: "rgba(239, 68, 68, 0.15)",
    buttonText: "#18070A",
    gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #F97316 100%)",
  },
  trust: {
    id: "trust",
    label: "Electric Blue",
    desc: "Tech Diagnostics Sapphire & Cyan",
    badge: "SERVICE CARE UPDATE",
    bg: "#040D1A",
    panel: "#0B192E",
    panel2: "#10233F",
    border: "#1E3A5F",
    text: "#E0F2FE",
    muted: "#93C5FD",
    accent: "#38BDF8",
    accentGlow: "rgba(56, 189, 248, 0.15)",
    buttonText: "#04111D",
    gradient: "linear-gradient(135deg, #38BDF8 0%, #0284C7 50%, #34D399 100%)",
  },
  luxury: {
    id: "luxury",
    label: "Emerald Green",
    desc: "Premium Machinery Care & Emerald",
    badge: "PREMIUM SERVICE MESSAGE",
    bg: "#03140E",
    panel: "#082119",
    panel2: "#0E3025",
    border: "#184E3D",
    text: "#ECFDF5",
    muted: "#A7F3D0",
    accent: "#10B981",
    accentGlow: "rgba(16, 185, 129, 0.15)",
    buttonText: "#03120E",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 50%, #F59E0B 100%)",
  },
};

export function getEmailTheme(themeId = "precision") {
  return themes[themeId] || themes.precision;
}

export function escHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderStarRating(rating = 5, accentColor = "#F59E0B") {
  const num = Math.min(5, Math.max(1, Number(rating) || 5));
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= num) {
      starsHtml += `<span style="color:${accentColor};font-size:22px;margin-right:3px;">&#9733;</span>`;
    } else {
      starsHtml += `<span style="color:#334155;font-size:22px;margin-right:3px;">&#9734;</span>`;
    }
  }
  return `
    <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;margin:10px 0 16px;">
      <div>${starsHtml}</div>
      <span style="color:${accentColor};font-size:12px;font-weight:700;letter-spacing:0.5px;">${num}.0 / 5.0</span>
    </div>
  `;
}

export function renderBrandedEmail({
  themeId = "precision",
  subject = "Singh Automobiles",
  badgeText,
  introText,
  message = "",
  details = [],
  rating,
  attachmentsCount = 0,
  ctaText,
  ctaUrl,
}) {
  const t = getEmailTheme(themeId);
  const safeSubject = escHtml(subject || "Singh Automobiles Notification");
  const safeBadge = escHtml(badgeText || t.badge);
  const safeIntro = introText ? escHtml(introText) : "";

  const paragraphs = String(message)
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px 0;font-size:15px;color:${t.text};line-height:1.75;white-space:pre-wrap;">${escHtml(p)}</p>`)
    .join("");

  const detailRows = details.length > 0
    ? `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${t.panel2};border:1px solid ${t.border};border-radius:10px;border-collapse:separate;margin:18px 0 22px;overflow:hidden;">
        ${details.map(({ label, value, isLink, linkUrl }) => `
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid ${t.border};font-size:11px;color:${t.muted};font-weight:700;text-transform:uppercase;letter-spacing:0.8px;width:32%;">${escHtml(label)}</td>
            <td style="padding:12px 16px;border-bottom:1px solid ${t.border};font-size:14px;color:${t.text};font-weight:600;">
              ${isLink ? `<a href="${escHtml(linkUrl || `mailto:${value}`)}" style="color:${t.accent};text-decoration:none;">${escHtml(value)}</a>` : escHtml(value || "Not provided")}
            </td>
          </tr>`).join("")}
      </table>`
    : "";

  const starsBlock = rating ? renderStarRating(rating, t.accent) : "";

  const attachmentBanner = attachmentsCount > 0
    ? `<div style="margin-top:20px;padding:12px 16px;background:${t.accentGlow};border:1px solid ${t.border};border-radius:8px;display:flex;align-items:center;gap:8px;">
        <span style="color:${t.accent};font-size:13px;font-weight:700;">📎 ${attachmentsCount} File Attachment${attachmentsCount > 1 ? "s" : ""} Included</span>
       </div>`
    : "";

  const ctaButton = ctaText && ctaUrl
    ? `<table border="0" cellpadding="0" cellspacing="0" style="margin:26px 0 10px;">
        <tr>
          <td align="center">
            <a href="${escHtml(ctaUrl)}" target="_blank" style="background:${t.gradient};color:${t.buttonText};font-size:14px;font-weight:800;text-decoration:none;padding:13px 28px;border-radius:8px;display:inline-block;letter-spacing:0.5px;box-shadow:0 4px 15px ${t.accentGlow};">
              ${escHtml(ctaText)}
            </a>
          </td>
        </tr>
       </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background-color:${t.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${t.text};-webkit-font-smoothing:antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${t.bg};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:${t.panel};border-radius:14px;border:1px solid ${t.border};overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Top Metallic Gradient Bar -->
          <tr>
            <td style="height:5px;background:${t.gradient};"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px 32px;background:${t.panel2};border-bottom:1px solid ${t.border};">
              <div style="display:inline-block;padding:4px 12px;background:${t.accentGlow};border:1px solid ${t.border};border-radius:20px;margin-bottom:12px;">
                <span style="color:${t.accent};font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
                  ${safeBadge}
                </span>
              </div>
              <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;">
                ${safeSubject}
              </h1>
              ${safeIntro ? `<p style="margin:10px 0 0 0;font-size:14px;color:${t.muted};line-height:1.6;">${safeIntro}</p>` : ""}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;background-color:${t.panel};">
              ${detailRows}
              ${starsBlock}
              ${paragraphs}
              ${attachmentBanner}
              ${ctaButton}

              <div style="margin-top:32px;padding-top:20px;border-top:1px solid ${t.border};">
                <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#FFFFFF;">Warm Regards,</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:${t.accent};">Singh Automobiles Engine Engineering</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 28px 32px;background-color:${t.panel2};border-top:1px solid ${t.border};text-align:center;">
              <p style="margin:0 0 4px 0;font-size:12px;font-weight:800;color:#FFFFFF;letter-spacing:0.5px;">
                SINGH AUTOMOBILES ENGINE ENGINEERING
              </p>
              <p style="margin:0 0 12px 0;font-size:11px;color:${t.muted};line-height:1.5;">
                Engine Rebuilding &bull; Precision Diagnostics &bull; Heavy Performance Services
              </p>
              <div style="padding-top:12px;border-top:1px solid ${t.border};">
                <span style="font-size:10px;color:${t.muted};letter-spacing:1px;text-transform:uppercase;">
                  Crafted with Precision by <a href="https://asrvtech.in" target="_blank" style="color:${t.accent};text-decoration:none;font-weight:700;">asrvtech.in</a>
                </span>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
