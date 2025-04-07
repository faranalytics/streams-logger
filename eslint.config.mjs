import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylisticTs from "@stylistic/eslint-plugin-ts";
import parserTs from "@typescript-eslint/parser";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ["**/dist/**"],
  },
  {
    plugins: {
      "@stylistic/ts": stylisticTs
    },
    languageOptions: {
      parser: parserTs,
    }
  },
  {
    rules: {
      "quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
      "@typescript-eslint/await-thenable": ["error"],
      "@typescript-eslint/no-floating-promises": ["error"],
      "@stylistic/ts/indent": ["error", 2],
      "@stylistic/ts/semi": ["error", "always"],
    }
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);