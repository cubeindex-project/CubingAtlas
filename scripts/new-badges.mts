// TODO: Needs to be redone in a more human readable way.
import { execFileSync, spawnSync } from "node:child_process";
import MarkdownIt, { type Token } from "markdown-it";

const sevenDays = 7 * 24 * 60 * 60 * 1000;
export const listingPath = /^docs\/(?!about\.md$|contribute\.md$|index\.md$)[^/]+\.md$/;

export function* siteLinks(tokens: Token[]) {
  for (let i = 2; i < tokens.length; i++) {
    const { type, children } = tokens[i];
    if (
      type !== "inline" || !children ||
      tokens[i - 1].type !== "paragraph_open" || tokens[i - 2].type !== "list_item_open"
    ) continue;

    // Older listings placed a Markdown emoji before the primary link.
    const start = children.findIndex((token) =>
      token.type !== "emoji" &&
      !(token.type === "text" && /^(?:\s|:[\w+-]+:)*$/.test(token.content)),
    );
    if (children[start]?.type !== "link_open") continue;

    const href = children[start].attrGet("href");
    const url = typeof href === "string" ? URL.parse(href) : null;
    if (url && (url.protocol === "http:" || url.protocol === "https:")) {
      const end = children.findIndex((token, index) => index > start && token.type === "link_close");
      yield { url: url.href, children, end };
    }
  }
}

export function getRecentSites(cwd: string, now = Date.now()) {
  const options = { cwd, encoding: "utf8" as const };
  const git = (...args: string[]) => execFileSync("git", args, options);
  const recent = new Map<string, number>();
  // Without a full Git checkout, don't guess which listings are new.
  const history = spawnSync("git", ["rev-parse", "--is-shallow-repository"], options);
  if (history.status !== 0 || history.stdout.trim() !== "false") return recent;

  const cutoff = now - sevenDays;
  const log = git(
    "log", "--first-parent", "--reverse", `--since-as-filter=@${Math.floor(cutoff / 1000)}`,
    "--format=%H %ct %P", "--", ":(glob)docs/*.md",
  ).trim();
  if (!log) return recent;

  const commits = log.split("\n").map((line) => line.split(" "));
  const md = new MarkdownIt();
  const linksByBlob = new Map<string, string[]>();
  function* sitesAt(revision: string) {
    for (const entry of git("ls-tree", "-rz", revision, "--", "docs").split("\0")) {
      const [metadata, path] = entry.split("\t");
      if (!path || !listingPath.test(path)) continue;
      const [, type, blob] = metadata.split(" ");
      if (type !== "blob") continue;

      let urls = linksByBlob.get(blob);
      if (!urls) {
        const tokens = md.parse(git("cat-file", "blob", blob), {});
        urls = Array.from(siteLinks(tokens), ({ url }) => url);
        linksByBlob.set(blob, urls);
      }
      yield* urls;
    }
  }

  // Seed from before the window so edits and moves don't make old URLs new.
  const baseline = commits[0][2];
  const seen = new Set(baseline ? sitesAt(baseline) : []);
  for (const [revision, seconds] of commits) {
    const added = Number(seconds) * 1000;
    for (const url of sitesAt(revision)) {
      if (seen.has(url)) continue;
      seen.add(url);
      if (added > cutoff && added <= now) recent.set(url, added + sevenDays);
    }
  }
  return recent;
}
