import { defineConfig } from "vite";
import cssnano from "cssnano";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [svelte()],
  css: {
    postcss: {
      plugins: [
        cssnano({
          preset: [
            "cssnano-preset-advanced",
            {
              discardUnused: { fontFace: false },
              zindex: false
            }
          ]
        })
      ]
    }
  },
  build: {
    lib: {
      entry: "src/main.ts",
      name: "PixelMirror",
      formats: ["iife"],
      fileName: () => "index.js"
    }
  }
});
