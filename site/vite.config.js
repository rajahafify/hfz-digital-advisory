import { defineConfig } from "vite";

// BASE_PATH is set by the GitHub Pages workflow to /<repo-name>.
// Leave it unset for local dev and for a custom domain on cPanel.
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
