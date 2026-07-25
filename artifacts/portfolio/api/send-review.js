import {
  adminEmail,
  allowOnlyPost,
  appendCredit,
  createTransporter,
  getMissingSmtpFields,
} from "./_mail.js";
import { getAdminDb } from "./_firebase-admin.js";

function normalizeRating(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

export default async function handler(req, res) {
  if (!allowOnlyPost(req, res)) return;

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
      name: cleanName,
      email: cleanEmail,
      rating: cleanRating,
      description: cleanDescription,
      createdAt: new Date(),
    });

    const missingSmtpFields = getMissingSmtpFields();
    if (missingSmtpFields.length > 0) {
      console.warn(`Review saved, email skipped. Missing SMTP config: ${missingSmtpFields.join(", ")}`);
      res.status(200).json({ ok: true, emailSent: false });
      return;
    }

    try {
      const transporter = createTransporter();
      const submittedAt = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      await transporter.sendMail({
        from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
        to: adminEmail,
        replyTo: cleanEmail,
        subject: `New ${cleanRating}-star review from ${cleanName}`,
        text: [
          `Name: ${cleanName}`,
          `Email: ${cleanEmail}`,
          `Rating: ${cleanRating}/5`,
          `Submitted: ${submittedAt}`,
          "",
          appendCredit(cleanDescription),
        ].join("\n"),
      });

      await transporter.sendMail({
        from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
        to: cleanEmail,
        subject: "Thank you for reviewing Singh Automobiles",
        text: appendCredit(
          [
            `Hello ${cleanName},`,
            "",
            "Thank you for reviewing Singh Automobiles Engine Engineering. We truly appreciate your feedback and your trust in our service.",
            "",
            `Your rating: ${cleanRating}/5`,
            "Your review:",
            cleanDescription,
            "",
            "Regards,",
            "Singh Automobiles",
          ].join("\n"),
        ),
      });

      res.status(200).json({ ok: true, emailSent: true });
    } catch (emailError) {
      console.error("Review saved, SMTP send failed:", emailError);
      res.status(200).json({ ok: true, emailSent: false });
    }
  } catch (error) {
    console.error("Review save failed:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to save review." });
  }
}
