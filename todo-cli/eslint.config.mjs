import { defineConfig } from "eslint/config";
import js from "@eslint/js"; // Ensure this is correct
import globals from "globals";

export default defineConfig({
  env: {
    node: true,
    browser: true,
  },
  plugins: {
    js, // Correct plugin reference
  },
  extends: [
    "eslint:recommended", // Core ESLint recommended rules
    "plugin:js/recommended", // Ensure this is using @eslint/js plugin
  ],
  rules: {
    "no-undef": "warn", // Adjust rules as needed
  },
});
