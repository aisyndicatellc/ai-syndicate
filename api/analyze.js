import { analyzeWebsiteFromUrl } from "../lib/analyze-website.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const url = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;

  if (!url) {
    return res.status(400).json({ error: "Missing url query parameter." });
  }

  try {
    const analysis = await analyzeWebsiteFromUrl(url);
    return res.status(200).json(analysis);
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    return res.status(statusCode).json({
      error:
        error?.message ||
        "We could not analyze that website right now.",
    });
  }
}
