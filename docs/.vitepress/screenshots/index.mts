import type { MarkdownRenderer } from "vitepress";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";

export function screenshotsPlugin(md: MarkdownRenderer) {
  md.core.ruler.push("cubingatlas-link-previews", (state) => {
    for (const block of state.tokens) {
      if (block.type !== "inline" || !block.children) continue;

      let filename: string | undefined;

      block.children = block.children.flatMap((token) => {
        if (token.type === "link_open") {
          filename = undefined;
          const url = URL.parse(String(token.attrGet("href")));

          if (url?.protocol === "https:" || url?.protocol === "http:") {
            const hash = createHash("sha256")
              .update(url.href)
              .digest("hex")
              .slice(0, 16);

            const candidate = `${hash}.webp`;
            if (
              existsSync(
                new URL(`../../public/screenshots/${candidate}`, import.meta.url),
              )
            ) {
              filename = candidate;
              token.attrJoin("class", "has-link-preview");
            }
          }
        }

        if (token.type === "link_close" && filename) {
          const preview = new state.Token("html_inline", "", 0);
          preview.content = `<img class="link-preview" src="/screenshots/${filename}" alt="" loading="lazy" width="560" height="315">`;
          filename = undefined;
          return [preview, token];
        }

        return [token];
      });
    }
  });
}
