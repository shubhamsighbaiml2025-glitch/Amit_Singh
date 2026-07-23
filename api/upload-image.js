import { createHash } from "crypto";
import { getAdminDb } from "./_firebase-admin.js";
import { allowMethods, readJsonBody } from "./_json.js";

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset =
  process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    if (!cloudName || !uploadPreset) {
      res.status(500).json({ error: "Cloudinary is not configured." });
      return;
    }

    const { file, filename, hash } = readJsonBody(req);
    if (!file || typeof file !== "string") {
      res.status(400).json({ error: "Image file is required." });
      return;
    }

    const fileHash =
      typeof hash === "string" && hash.trim()
        ? hash.trim()
        : createHash("sha256").update(file).digest("hex");
    const db = getAdminDb();
    const assetRef = db.collection("uploaded_assets").doc(`image_${fileHash}`);
    const existingAsset = await assetRef.get();

    if (existingAsset.exists) {
      const asset = existingAsset.data();
      if (asset?.url) {
        res.status(200).json({ ok: true, url: asset.url, reused: true });
        return;
      }
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("public_id", `gallery/${fileHash}`);
    formData.append("overwrite", "false");
    if (filename) formData.append("context", `original_filename=${String(filename)}`);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );
    const payload = await uploadResponse.json();

    if (!uploadResponse.ok) {
      console.error("Cloudinary upload failed:", payload);
      res.status(502).json({ error: payload?.error?.message || "Image upload failed." });
      return;
    }

    await assetRef.set(
      {
        url: payload.secure_url,
        publicId: payload.public_id,
        originalFilename: String(filename || ""),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true },
    );

    res.status(200).json({ ok: true, url: payload.secure_url, reused: false });
  } catch (error) {
    console.error("Image upload failed:", error);
    res.status(500).json({ error: "Image upload failed." });
  }
}

