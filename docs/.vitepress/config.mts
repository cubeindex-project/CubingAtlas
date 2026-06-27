import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CubingAtlas",
  description: "The curated directory for speedcubers.",
  sitemap: {
    hostname: "https://atlas.thecubeindex.com",
  },
  lastUpdated: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: "local",
    },

    editLink: {
      pattern:
        "https://github.com/cubeindex-project/CubingAtlas/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    nav: [
      { text: "Home", link: "/" },
      {
        text: "Contribute",
        link: "/contribute",
      },
      {
        text: "About Us",
        link: "/about",
      },
    ],

    sidebar: [
      {
        text: "Tools",
        items: [
          { text: "Timers", link: "/timers" },
          { text: "Trainers", link: "/trainers" },
          { text: "Virtual Puzzles", link: "/virtual" },
          { text: "Puzzle Solvers", link: "/solvers" },
          { text: "Hypercubing", link: "/hypercubing" },
          { text: "Development Software", link: "/dev-software" },
          { text: "WCA Tools", link: "/wca-tools" },
        ],
      },
      {
        text: "Resources",
        items: [
          { text: "Learning", link: "/learning" },
          { text: "Databases", link: "/databases" },
          { text: "Statistics", link: "/statistics" },
          { text: "Communities", link: "/communities" },
          { text: "Media", link: "/media" },
          { text: "Wikis", link: "/wikis" },
        ],
      },
      {
        text: "Non-English",
        link: "/non-english",
      },
      {
        text: "Miscellaneous",
        link: "/misc",
      },
      {
        text: "Dead Projects",
        link: "/dead",
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/cubeindex-project/CubingAtlas",
      },
      { icon: "discord", link: "https://thecubeindex.com/discord" },
    ],

    footer: {
      message: "Released under the GPL-3.0 License.",
      copyright: `Copyright © 2026-${new Date().getFullYear()} <a href="https://github.com/cubeindex-project">CubeIndex Project</a>`,
    },
  },

  vite: {
    server: {
      allowedHosts: ["code.fluffy-solfege.ts.net"],
    },
  },
});
