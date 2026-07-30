export function appOrigin(req) {
  const origin = process.env.PUBLIC_SITE_URL || process.env.VITE_PUBLIC_SITE_URL;
  if (origin) return origin.replace(/\/$/, "");

  const host = req?.headers?.["x-forwarded-host"] || req?.headers?.host;
  if (host) {
    const protocol = req?.headers?.["x-forwarded-proto"] || "https";
    return `${protocol}://${host}`;
  }

  return "https://singh-automobiles.vercel.app";
}

export function buildVerifyUrl(origin, token) {
  return `${String(origin).replace(/\/$/, "")}/verify?token=${encodeURIComponent(token)}`;
}

function serializeValue(value) {
  if (value == null) return value;
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      return value.toDate().toISOString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map(serializeValue);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, serializeValue(nestedValue)]),
    );
  }

  return value;
}

export function serializeInvoiceForResponse(invoice = {}) {
  return serializeValue(invoice);
}
