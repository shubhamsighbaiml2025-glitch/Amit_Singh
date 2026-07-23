export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;

  res.setHeader("Allow", methods.join(", "));
  res.status(405).json({ error: "Method not allowed." });
  return false;
}

export function readJsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

