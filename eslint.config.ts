import pluginJs from "@eslint/js";
import pluginTs from "typescript-eslint";
import pluginStylistic from "@stylistic/eslint-plugin";
import globals from "globals";

export default pluginTs.config(
   { files: ["**/*.{js,ts}"] },
   { ignores: [
      "node_modules/",
      "dist/",
      "foundry/",
   ] },
   pluginJs.configs.recommended,
   pluginTs.configs.recommended,
   pluginStylistic.configs.customize({
      indent: 3,
      quotes: "double",
      semi: true,
      arrowParens: true,
      braceStyle: "1tbs",
      blockSpacing: true,
      quoteProps: "as-needed",
      commaDangle: "only-multiline",
   }),
   {
      plugins: { "@stylistic": pluginStylistic },
      rules: {
         "@stylistic/max-len": ["error", {
            code: 120,
            ignoreComments: true,
            ignoreUrls: true,
         }],
         "@stylistic/max-statements-per-line": "off",
         "@stylistic/multiline-ternary": ["error", "always-multiline"],
         "@stylistic/spaced-comment": "off",
         "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
         "@stylistic/comma-dangle": ["error", "always-multiline"],
      },
   },
   {
      rules: {
         "@typescript-eslint/no-unused-vars": ["error", {
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
         }],
         "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      },
   },
   {
      files: ["src/*.{js,ts}"],
      languageOptions: {
         globals: globals.browser,
      },
   },
   {
      files: ["vite.config.ts", "eslint.config.ts", "dev/*.{js,ts}"],
      languageOptions: {
         globals: { ...globals.node, ...globals.browser },
      },
   },
);
