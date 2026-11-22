import { fileURLToPath } from "node:url";
import type { MarkdownRenderer } from "vitepress";
import { getRecentSites, listingPath, siteLinks } from "../../../scripts/new-badges.mts";

type TagTypes = 'info' | 'note' | 'tip' | 'important' | 'caution' | 'warning' | 'danger'

type TagKeys = "timer" | "paid" | "podcast" | "new"

interface TagDefinition {
    label: string
    type: TagTypes
}

type Tags = Record<TagKeys, TagDefinition>

export const atlasTags: Tags = {
  timer: {
    label: "Timer",
    type: "info",
  },
  paid: {
    label: "Paid",
    type: "warning",
  },
  podcast: {
    label: "Podcast",
    type: 'info'
  },
  new: {
    label: "New",
    type: "tip",
  }
} as const;

export function tagsPlugin(md: MarkdownRenderer) {
  md.inline.ruler.before("text", "cubingatlas-tag", (state, silent) => {
    const remainingSource = state.src.slice(state.pos);
    const match = remainingSource.match(/^`([a-z0-9-]+)`/);

    if (!match) {
      return false;
    }

    const tagName = match[1] as TagKeys;
    const tag = atlasTags[tagName];

    if (!tag || tagName === "new") {
      return false;
    }

    if (!silent) {
      const token = state.push("cubingatlas-tag", "", 0);
      token.content = tagName;
    }

    state.pos += match[0].length;
    return true;
  });

  const recentSites = getRecentSites(fileURLToPath(new URL("../../../", import.meta.url)));
  if (recentSites.size > 0) {
    md.core.ruler.after("inline", "cubingatlas-recent-site-tags", (state) => {
      if (!listingPath.test(`docs/${state.env.relativePath}`)) return;

      for (const { url, children, end } of siteLinks(state.tokens)) {
        const expiresAt = recentSites.get(url);
        if (!expiresAt) continue;

        const token = new state.Token("cubingatlas-tag", "", 0);
        token.content = "new";
        token.meta = { expiresAt };
        children.splice(end + 1, 0, token);
      }
    });
  }

  md.renderer.rules["cubingatlas-tag"] = (tokens, index) => {
    const { content, meta } = tokens[index];
    const tag = atlasTags[content as TagKeys];
    const badge = `<Badge type="${tag.type}" text="${tag.label}" />`;

    return meta?.expiresAt
      ? ` <ExpiringBadge :expires-at="${meta.expiresAt}">${badge}</ExpiringBadge>`
      : badge;
  };
}
