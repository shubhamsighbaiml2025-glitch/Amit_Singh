// ─── Cloudinary Configuration ─────────────────────────────────────────────────
// Replace the placeholder values below with your actual Cloudinary credentials.
// Go to Cloudinary Dashboard → Settings → Upload → Upload presets (create unsigned preset).
// ──────────────────────────────────────────────────────────────────────────────

export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME";

export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "YOUR_UNSIGNED_UPLOAD_PRESET";

/**
 * Uploads a file to Cloudinary via the unsigned upload API.
 * Returns the secure URL of the uploaded file.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("Cloudinary upload failed: " + res.statusText);
  }

  const data = await res.json();
  return data.secure_url as string;
}
