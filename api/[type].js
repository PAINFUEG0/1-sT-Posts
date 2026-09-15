/** @format */

// api/[type].js

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  { id: String, date: String, image: String, category: String, title: String, uri: String, description: String },
  { _id: false },
);

const contentSchema = new mongoose.Schema({ blogs: [postSchema], news: [postSchema] });

const Content = mongoose.models.Content || mongoose.model("Content", contentSchema, "content");

/** @param {import("@vercel/node").VercelRequest} req @param {import("@vercel/node").VercelResponse} res */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET") return res.status(405).end();
  if (req.query.type !== "blogs" && req.query.type !== "news") return res.status(404).json({ error: "Not found" });

  try {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI);

    const content = await Content.findOne().lean();
    return res.status(200).json(content?.[req.query.type] ?? []);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      stack: error.stack || "Stack trace N/A",
      message: error.message || error || "Unknown error",
    });
  }
}
