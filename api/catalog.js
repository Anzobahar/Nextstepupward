// Vercel serverless function — GET /api/catalog
// Public, secret-free product list (handy for rendering prices dynamically).
import { publicCatalog } from "../lib/catalog.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "public, max-age=60");
  return res.status(200).json(publicCatalog());
}
