import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  { id: String, date: String, image: String, category: String, title: String, uri: String, description: String },
  { _id: false },
);

const contentSchema = new mongoose.Schema({ blogs: [postSchema], news: [postSchema] });

const Content = mongoose.models.Content || mongoose.model("Content", contentSchema, "content");

/** @param {"news" | "blogs"} T */
const readPosts = (T) =>
  fs
    .readdirSync(path.resolve(import.meta.dirname, T))
    .filter((id) => fs.statSync(path.resolve(import.meta.dirname, T, id)).isDirectory())
    .map((id) => ({
      id,
      uri: `https://raw.githubusercontent.com/PAINFUEG0/1-sT-Posts/main/${T}/${id}/index.html`,
      image: `https://raw.githubusercontent.com/PAINFUEG0/1-sT-Posts/main/${T}/${id}/index.png`,
      ...JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, T, id, "meta.json"), "utf8")),
    }));

const news = readPosts("news");
const blogs = readPosts("blogs");

await mongoose.connect(process.env.MONGODB_URI);

await Content.findOneAndUpdate({}, { blogs, news }, { upsert: true, new: true });

await mongoose.disconnect();

console.log("Posts synced successfully");
