import { load } from "cheerio/slim";
import { format } from "prettier";
import { dirname, isAbsolute, resolve } from "node:path/posix";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const rootDir = resolve(import.meta.dirname, "..");
const repoBranchUrl = "https://raw.githubusercontent.com/PAINFUEG0/1-sT-Posts/main";

const prettierConfig = JSON.parse(readFileSync(resolve(rootDir, ".prettierrc"), "utf8"));
prettierConfig.parser = "html";

const replaceImgSrc = async (path) => {
  const $ = load(readFileSync(path, "utf8"));
  $("img").each((i, el) => {
    const src = $(el).attr("src");
    if (src.startsWith("http")) return;
    $(el).attr("src", resolve(dirname(path), src).replace(rootDir, repoBranchUrl));
  });
  writeFileSync(path, await format($.html(), prettierConfig), "utf8");
};

const synchronize = async (dir) => {
  if (!isAbsolute(dir)) dir = resolve(rootDir, dir);
  for (const path of readdirSync(dir, { withFileTypes: true })) {
    if (path.isDirectory()) await synchronize(resolve(dir, path.name));
    else if (path.isFile() && path.name.endsWith(".html")) await replaceImgSrc(resolve(dir, path.name));
  }
};

await synchronize("news");
await synchronize("blogs");
