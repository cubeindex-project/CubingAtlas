import type { MarkdownRenderer } from "vitepress";

export const platformIcons = {
  GitHub: "github.svg",
  YouTube: "youtube.svg",
  Android: "android.svg",
  iOS: "ios.svg",
  Reddit: "reddit.svg",
  Discord: "discord.svg",
  Instagram: "instagram.svg",
  X: "x.svg",
  Facebook: "facebook.svg",
  Twitch: "twitch.svg",
  NPM: "npm.svg",
  Spotify: "spotify.svg"
} as const;

export function iconsPlugin(md: MarkdownRenderer) {
  md.core.ruler.after("inline", "cubingatlas-icons", (state) => {
    for (const block of state.tokens) {
      if (block.type !== "inline" || !block.children) continue;

      const tokens = block.children;
      for (let index = 0; index < tokens.length - 2; index++) {
        const opening = tokens[index];
        const label = tokens[index + 1];
        const closing = tokens[index + 2];

        // Only replace whole, plain-text link labels, not prose or formatted labels.
        if (
          opening.type !== "link_open" ||
          label.type !== "text" ||
          closing.type !== "link_close" ||
          !Object.prototype.hasOwnProperty.call(platformIcons, label.content)
        ) {
          continue;
        }

        const filename = platformIcons[label.content as keyof typeof platformIcons];
        const icon = new state.Token("html_inline", "", 0);
        const name = filename.replace(/\.svg$/, "");
        opening.attrJoin("class", "platform-icon-link");
        icon.content = `<span class="platform-icon platform-icon--${name}" role="img" aria-label="${label.content}" title="${label.content}"></span>`;
        tokens[index + 1] = icon;
      }
    }
  });
}
