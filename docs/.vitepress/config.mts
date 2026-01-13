import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CubingAtlas",
  description: "The curated directory for speedcubers.",
  // sitemap: {
  //   hostname: 'https://example.com'
  // },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: 'public/logo.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cubeindex-project/CubingAtlas' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © 2026-${new Date().getFullYear()} <a href="https://github.com/cubeindex-project">CubeIndex Project</a>`,
    }
  }
})
