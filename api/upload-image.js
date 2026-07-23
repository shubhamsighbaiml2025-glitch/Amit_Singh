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

    const { file, filename } = readJsonBody(req);
    if (!file || typeof file !== "string") {
      res.status(400).json({ error: "Image file is required." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    if (filename) formData.append("public_id", String(filename).replace(/\.[^.]+$/, ""));

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

    res.status(200).json({ ok: true, url: payload.secure_url });
  } catch (error) {
    console.error("Image upload failed:", error);
    res.status(500).json({ error: "Image upload failed." });
  }
}

