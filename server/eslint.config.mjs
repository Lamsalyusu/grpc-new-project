import js from "@eslint/js";
import tseslint from "typescript-eslint";
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "off",
      
    },
  },
];


// import js from "@eslint/js";
// import tseslint from "typescript-eslint";

// export default [
//   js.configs.recommended,
//   ...tseslint.configs.recommended,
//   {
//     files: ["**/*.{js,ts}"],
//     rules: {
//       "@typescript-eslint/no-require-imports": "off",
//       "no-undef": "off",
//       // Turn off TS rule for JS files, use standard JS rule with ignore pattern
//       "@typescript-eslint/no-unused-vars": [
//         "off",
//         {
//           "vars": "all",
//           "args": "after-used",
//           "ignoreRestSiblings": true,
//           "varsIgnorePattern": "^_",
//           "argsIgnorePattern": "^_",
//           "caughtErrorsIgnorePattern": "^_"
//         }
//       ],
//       "no-unused-vars": [
//         "error",
//         {
//           "vars": "all",
//           "args": "after-used",
//           "ignoreRestSiblings": true,
//           "varsIgnorePattern": "^_",
//           "argsIgnorePattern": "^_",
//           "caughtErrorsIgnorePattern": "^_"
//         }
//       ],
//     },
//   },
// ];



