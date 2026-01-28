import svelteSvg from "@poppanator/sveltekit-svg";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import cssnano from "cssnano";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    svelte(),
    svelteSvg({
      svgoOptions: {
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupIds: false
              }
            }
          }
        ]
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/shared.scss" as *;`
      }
    },
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
  resolve: {
    alias: [{ find: "~", replacement: path.resolve("src") }]
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
