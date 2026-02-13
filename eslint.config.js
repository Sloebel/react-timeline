import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";

export default [
  { ignores: ["dist/", "node_modules/", "**/*.config.*"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
      globals: {},
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
    },
    rules: {
      // TypeScript replaces these ESLint rules
      "no-unused-vars": "off",
      "no-undef": "off",
      "constructor-super": "off",
      "getter-return": "off",
      "no-const-assign": "off",
      "no-dupe-args": "off",
      "no-dupe-class-members": "off",
      "no-dupe-keys": "off",
      "no-func-assign": "off",
      "no-import-assign": "off",
      "no-new-symbol": "off",
      "no-obj-calls": "off",
      "no-redeclare": "off",
      "no-setter-return": "off",
      "no-this-before-super": "off",
      "no-unreachable": "off",
      "no-unsafe-negation": "off",
      "no-var": "error",
      "no-alert": "error",
      "no-shadow": "warn",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-syntax": [
        "error",
        "ForInStatement",
        "LabeledStatement",
        "WithStatement",
      ],
      "no-unused-expressions": ["error", { allowShortCircuit: true }],
      "no-param-reassign": ["error", { props: false }],
      "class-methods-use-this": "warn",
      "import/order": [
        "error",
        {
          pathGroups: [
            {
              pattern: "{.,..}/**/*.scss",
              group: "internal",
              position: "after",
            },
            {
              pattern: "react",
              group: "builtin",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          groups: [["builtin", "external"], ["parent", "sibling"], "internal"],
          "newlines-between": "always",
          warnOnUnassignedImports: true,
        },
      ],
      // @typescript-eslint recommended
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // Type-aware rules (require parserOptions.project) - enable when using type-aware ESLint:
      // '@typescript-eslint/await-thenable': 'error',
      // '@typescript-eslint/no-floating-promises': 'warn',
      // '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      // '@typescript-eslint/unbound-method': 'error',
      // '@typescript-eslint/require-await': 'error',
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "warn",
    },
  },
];
