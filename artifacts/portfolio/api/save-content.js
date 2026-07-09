import { getAdminDb } from "./_firebase-admin.js";
import { allowMethods, readJsonBody } from "./_json.js";

function normalizeContent(content) {
  return {
    heroTitle: String(content.heroTitle || ""),
    heroSubtitle: String(content.heroSubtitle || ""),
    heroImageUrl: String(content.heroImageUrl || ""),
    engineImageUrl: String(content.engineImageUrl || ""),
    profileImageUrl: String(content.profileImageUrl || ""),
    aboutText: String(content.aboutText || ""),
    servicesList: Array.isArray(content.servicesList)
      ? content.servicesList.map((service) => ({
          title: String(service?.title || ""),
          description: String(service?.description || ""),
        }))
      : [],
  };
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = readJsonBody(req);
    const content = normalizeContent(body.content || body);
    await getAdminDb().collection("content").doc("site").set(content, { merge: true });
    res.status(200).json({ ok: true, content });
  } catch (error) {
    console.error("Content save failed:", error);
    res.status(500).json({ error: "Failed to save content." });
  }
}
