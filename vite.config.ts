import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import cssnano from "cssnano";

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [solid(), solidSvg({ svgo: {} })],
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
    },
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  },
  resolve: {
    alias: [{ find: "~", replacement: "/src/" }]
  },
  build: {
    lib: {
      entry: "src/index.tsx",
      name: "PixelMirror",
      formats: ["iife"],
      fileName: () => `index.js`
    }
  }
});
