import { glob, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import MarkdownIt from "markdown-it";
import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import sharp from "sharp";

const md = new MarkdownIt();

const markdownFiles: string[] = [];
for await (const file of glob("docs/**/*.md")) {
  markdownFiles.push(file);
}
markdownFiles.sort();

const links = new Set<string>();
const ignoredDomains = [
  "github.com",
  "play.google.com",
  "apps.apple.com",
  "instagram.com",
  "reddit.com",
  "discord.gg",
  "discord.com",
  "scratch.mit.edu",
  "npmjs.com",
  "youtube.com",
  "m.youtube.com",
  "youtu.be",
  "twitch.tv",
  "open.spotify.com",
  "facebook.com",
  "m.facebook.com",
  "x.com",
  "twitter.com",
  "t.co",
  "docs.google.com",
  "drive.google.com",
  "chromewebstore.google.com",
  "speedsolving.com",
];

for (const file of markdownFiles) {
  const markdown = await readFile(file, "utf-8");

  for (const block of md.parse(markdown, {})) {
    for (const token of block.children ?? []) {
      if (token.type !== "link_open") continue;

      const href = token.attrGet("href");
      if (!href || typeof href !== "string") continue;

      let url: URL;
      try {
        url = new URL(href);
      } catch {
        continue;
      }

      if (url.protocol === "https:" || url.protocol === "http:") {
        links.add(url.href);
      }
    }
  }
}

const pending: { link: string; path: string }[] = [];
for (const link of links) {
  const hostname = new URL(link).hostname.replace(/^www\./, "");
  if (ignoredDomains.includes(hostname)) continue;

  const hash = createHash("sha256").update(link).digest("hex").slice(0, 16);
  const path = `docs/public/screenshots/${hash}.webp`;
  if (!existsSync(path)) pending.push({ link, path });
}

await mkdir("docs/public/screenshots", { recursive: true });

if (pending.length === 0) {
  console.log("No missing screenshots.");
} else {
  console.log(`Capturing ${pending.length} missing screenshots.`);

  if (process.argv.includes("--install-browser")) {
    execFileSync(
      "npx",
      ["--no-install", "playwright", "install", "--with-deps", "chromium"],
      { stdio: "inherit" },
    );
  }

  const browser = await chromium.launch();
  try {
    const pages = await Promise.all(
      Array.from({ length: Math.min(3, pending.length) }, () =>
        browser.newPage({ viewport: { width: 1920, height: 1080 } }),
      ),
    );
    const jobs = pending.values();

    await Promise.all(
      pages.map(async (page) => {
        for (const { link, path } of jobs) {
          try {
            await page.goto(link, { waitUntil: "load", timeout: 15_000 });
            const screenshot = await page.screenshot({
              path,
              animations: "disabled",
              timeout: 10_000,
            });
            await sharp(screenshot)
              .resize({ width: 1120, withoutEnlargement: true })
              .webp({ quality: 82 })
              .toFile(path);
          } catch (error) {
            console.warn(`Skipping ${link}:`, error);
          }
        }
      }),
    );
  } finally {
    await browser.close();
  }
}
