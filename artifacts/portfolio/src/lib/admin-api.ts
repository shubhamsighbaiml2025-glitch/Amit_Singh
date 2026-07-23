async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload as T;
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export async function fileSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function uploadImage(file: File): Promise<string> {
  const response = await fetch("/api/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file: await fileToDataUrl(file),
      filename: file.name,
      hash: await fileSha256(file),
    }),
  });
  const payload = await parseApiResponse<{ ok: true; url: string }>(response);
  return payload.url;
}

export async function addGalleryImage(url: string, caption: string) {
  const response = await fetch("/api/gallery-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, caption }),
  });
  return parseApiResponse<{ ok: true; id: string }>(response);
}

export async function deleteGalleryImage(id: string) {
  const response = await fetch("/api/gallery-image", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return parseApiResponse<{ ok: true }>(response);
}

export async function addVideo(url: string, title: string) {
  const response = await fetch("/api/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title }),
  });
  return parseApiResponse<{ ok: true; id: string }>(response);
}

export async function deleteVideo(id: string) {
  const response = await fetch("/api/video", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return parseApiResponse<{ ok: true }>(response);
}
