import pluginJs from "@eslint/js";
import pluginTs from "typescript-eslint";
import pluginStylistic from "@stylistic/eslint-plugin";
import pluginCss from "@eslint/css";
import globals from "globals";

export default pluginTs.config(
   { linterOptions: {
      reportUnusedInlineConfigs: "error",
      reportUnusedDisableDirectives: "error",
   } },
   { ignores: ["node_modules/", "dist/", "foundry/", "static/"] },
   { files: ["**/*.js"], ...pluginJs.configs.recommended },
   pluginTs.configs.recommended,
   {
      files: ["**/*.{js,ts}"],
      ...pluginStylistic.configs.customize({
         indent: 3,
         quotes: "double",
         semi: true,
         arrowParens: true,
         braceStyle: "1tbs",
         blockSpacing: true,
         quoteProps: "as-needed",
         commaDangle: "only-multiline",
      }),
   },
   {
      files: ["**/*.{js,ts}"],
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
      files: ["**/*.{js,ts}"],
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
   {
      files: ["**/*.css"],
      language: "css/css",
      plugins: { css: pluginCss },
      extends: [pluginCss.configs.recommended],
      rules: {
         "css/use-baseline": ["error", { available: "newly" }],
         "css/no-invalid-properties": ["error", { allowUnknownVariables: true }],
      },
   },
);
