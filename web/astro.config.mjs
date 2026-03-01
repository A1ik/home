import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      persist: { path: "../worker/.wrangler/state/v3" },
    },
  }),
  integrations: [react(), markdoc(), keystatic()],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ru", "uk"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
