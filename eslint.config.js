import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid/configs/typescript";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  { ignores: ["dist", "node_modules", ".git"] },
  {
    files: ["plugins/vite.js"],
    languageOptions: {
      globals: {
        process: "readonly"
      }
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  solid,
  eslintPluginPrettierRecommended
);
