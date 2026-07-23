// ─── Cloudinary Configuration ─────────────────────────────────────────────────
// Replace the placeholder values below with your actual Cloudinary credentials.
// Go to Cloudinary Dashboard → Settings → Upload → Upload presets (create unsigned preset).
// ──────────────────────────────────────────────────────────────────────────────

export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME";

export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "YOUR_UNSIGNED_UPLOAD_PRESET";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function fileSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Uploads a file to Cloudinary via the unsigned upload API.
 * Returns the secure URL of the uploaded file.
 */
export async function uploadToCloudinary(file: File, resourceType: "image" | "video" = "image"): Promise<string> {
  if (resourceType === "image") {
    const response = await fetch("/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: await fileToDataUrl(file),
        filename: file.name,
        hash: await fileSha256(file),
      }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "Image upload failed");
    }

    return payload.url as string;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("Cloudinary upload failed: " + res.statusText);
  }

  const data = await res.json();
  return data.secure_url as string;
}
