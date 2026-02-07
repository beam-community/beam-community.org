import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://beam-community.org",
  integrations: [icon(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
