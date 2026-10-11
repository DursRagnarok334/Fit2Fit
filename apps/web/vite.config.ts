import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En GitHub Pages la app vive en /nombre-del-repo/. El workflow define VITE_BASE.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
});
