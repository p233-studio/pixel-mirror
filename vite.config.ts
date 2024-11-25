import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import cssnano from "cssnano";

let modulesConfig = {
  generateScopedName: "[local]-[hash:base64:4]"
};

if (process.env.IS_PROD) {
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
    generateScopedName: "[hash:base64:2]"
  };
}

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [solid(), solidSvg({ svgo: {} })],
  css: {
    modules: modulesConfig,
    postcss: {
      plugins: [
        cssnano({ preset: ["cssnano-preset-advanced", { discardUnused: { fontFace: false } }] })
      ]
    },
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        additionalData: `@use "~/styles/_common" as *;`
      }
    }
  },
  resolve: {
    alias: [{ find: "~", replacement: "/src/" }]
  }
});
