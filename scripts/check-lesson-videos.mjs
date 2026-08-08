#!/usr/bin/env node
/**
 * Checks every lesson's embedded YouTube video against YouTube's real
 * oEmbed API. Run this any time you add or edit a lesson:
 *
 *   node scripts/check-lesson-videos.mjs
 *
 * Exits with a non-zero code if any embedded video is broken, so it can
 * also be wired into CI (e.g. a pre-deploy check).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LESSONS_DIR = join(__dirname, "..", "public", "lessons");

function extractVideoId(html) {
  const m = html.match(/youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

async function checkVideo(id) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${id}`
  )}&format=json`;
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const files = readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".html")).sort();
  let ok = 0, broken = 0, none = 0;
  const brokenList = [];

  for (const file of files) {
    const html = readFileSync(join(LESSONS_DIR, file), "utf-8");
    const id = extractVideoId(html);
    const lessonId = file.replace(".html", "");
    if (!id) {
      console.log(`  —  ${lessonId}  (no video embedded)`);
      none++;
      continue;
    }
    const works = await checkVideo(id);
    if (works) {
      console.log(`  ✓  ${lessonId}  (${id})`);
      ok++;
    } else {
      console.log(`  ✕  ${lessonId}  (${id})  BROKEN`);
      broken++;
      brokenList.push({ lessonId, id });
    }
  }

  console.log(`\n${ok} working, ${broken} broken, ${none} with no video (of ${files.length} lessons)`);
  if (broken > 0) {
    console.log("\nBroken videos:");
    brokenList.forEach(({ lessonId, id }) =>
      console.log(`  ${lessonId}: https://www.youtube.com/watch?v=${id}`)
    );
    process.exit(1);
  }
}

main();
