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

export async function uploadImage(file: File): Promise<string> {
  const response = await fetch("/api/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file: await fileToDataUrl(file),
      filename: file.name,
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

