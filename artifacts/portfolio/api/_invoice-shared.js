export function appOrigin(req) {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_PUBLIC_SITE_URL ||
    (req?.headers?.host ? `https://${req.headers.host}` : "https://amit-singh-sepia.vercel.app")
  ).replace(/\/$/, "");
}

export function buildVerifyUrl(origin, token) {
  return `${String(origin).replace(/\/$/, "")}/verify?token=${encodeURIComponent(token)}`;
}
