import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import CustomLayout from "./CustomLayout.vue";
import ExpiringBadge from "./ExpiringBadge.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app }) {
    app.component("ExpiringBadge", ExpiringBadge);
  },
} satisfies Theme;
