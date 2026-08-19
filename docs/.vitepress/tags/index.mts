import { MarkdownRenderer } from "vitepress";

type TagTypes = 'info' | 'note' | 'tip' | 'important' | 'caution' | 'warning' | 'danger'

type TagKeys = "timer" | "paid"

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

    if (!tag) {
      return false;
    }

    if (!silent) {
      const token = state.push("cubingatlas-tag", "", 0);
      token.content = tagName;
    }

    state.pos += match[0].length;
    return true;
  });

  md.renderer.rules["cubingatlas-tag"] = (tokens, index) => {
    const tagName = tokens[index].content as keyof typeof atlasTags;
    const tag = atlasTags[tagName];

    return `<Badge type="${tag.type}" text="${tag.label}" />`;
  };
}
