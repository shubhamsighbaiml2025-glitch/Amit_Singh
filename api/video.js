import { getAdminDb } from "./_firebase-admin.js";
import { allowMethods, readJsonBody } from "./_json.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST", "DELETE"])) return;

  try {
    const db = getAdminDb();

    if (req.method === "DELETE") {
      const { id } = readJsonBody(req);
      if (!id) {
        res.status(400).json({ error: "Video id is required." });
        return;
      }

      await db.collection("videos").doc(String(id)).delete();
      res.status(200).json({ ok: true });
      return;
    }

    const { url, title } = readJsonBody(req);
    if (!url) {
      res.status(400).json({ error: "Video URL is required." });
      return;
    }

    const docRef = await db.collection("videos").add({
      url: String(url),
      title: String(title || ""),
      createdAt: new Date(),
    });

    res.status(200).json({ ok: true, id: docRef.id });
  } catch (error) {
    console.error("Video update failed:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to update videos." });
  }
}
