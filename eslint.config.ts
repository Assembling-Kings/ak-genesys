import { globalIgnores } from "eslint/config";
import pluginJs from "@eslint/js";
import pluginTs from "typescript-eslint";
import pluginStylistic from "@stylistic/eslint-plugin";
import pluginCss from "@eslint/css";
import pluginYml from "eslint-plugin-yml";
import pluginHtml from "@html-eslint/eslint-plugin";
import parserHtml, { TEMPLATE_ENGINE_SYNTAX } from "@html-eslint/parser";
import globals from "globals";

export default pluginTs.config(
   {
      linterOptions: {
         reportUnusedInlineConfigs: "error",
         reportUnusedDisableDirectives: "error",
      },
      languageOptions: {
         globals: globals.browser,
      },
   },
   globalIgnores(["dist/", "foundry/", "static/"]),
   { files: ["**/*.{js,ts}"], ...pluginJs.configs.recommended },
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
            ignoreRegExpLiterals: true,
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
            args: "all",
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
         }],
         "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
         "default-case": ["error"],
         "default-case-last": ["error"],
      },
   },
   {
      ...pluginHtml.configs["flat/recommended"],
      files: ["**/*.hbs"],
      plugins: { "@html-eslint": pluginHtml },
      languageOptions: {
         parser: parserHtml,
         parserOptions: {
            templateEngineSyntax: TEMPLATE_ENGINE_SYNTAX.HANDLEBAR,
         },
      },
      rules: {
         // Disabled for now since it ignores handlebars expressions for the purpose of indenting it's children.
         "@html-eslint/indent": "off",
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
   ...pluginYml.configs["flat/recommended"],
);
