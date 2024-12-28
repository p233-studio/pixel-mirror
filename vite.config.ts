import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import cssnano from "cssnano";

let modulesConfig = {
  generateScopedName: "[local]-[hash:base64:4]"
};

if (process.env.NODE_ENV === "production") {
  const fileSet = {};
  const hashSet = {};
  modulesConfig = {
    getJSON: function (file, json) {
      if (fileSet[file]) return;

      fileSet[file] = true;
      Object.values(json).forEach((i) => {
        if (hashSet[i]) throw Error("HASH COLLISION ERROR");
        hashSet[i] = true;
      });
    },
    generateScopedName: "_PM-[hash:base64:3]"
  };
}

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [solid(), solidSvg({ svgo: {} }), cssInjectedByJsPlugin()],
  css: {
    modules: modulesConfig,
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
