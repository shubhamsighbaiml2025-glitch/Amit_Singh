import { getAdminDb } from "./_firebase-admin.js";
import { allowMethods, readJsonBody } from "./_json.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST", "DELETE"])) return;

  try {
    const db = getAdminDb();

    if (req.method === "DELETE") {
      const { id } = readJsonBody(req);
      if (!id) {
        res.status(400).json({ error: "Gallery image id is required." });
        return;
      }

      await db.collection("gallery").doc(String(id)).delete();
      res.status(200).json({ ok: true });
      return;
    }

    const { url, caption } = readJsonBody(req);
    if (!url) {
      res.status(400).json({ error: "Image URL is required." });
      return;
    }

    const docRef = await db.collection("gallery").add({
      url: String(url),
      caption: String(caption || ""),
      createdAt: new Date(),
    });

    res.status(200).json({ ok: true, id: docRef.id });
  } catch (error) {
    console.error("Gallery update failed:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to update gallery." });
  }
}
