import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://beam-community.org",
  vite: {
    plugins: [tailwindcss()],
  },
});
