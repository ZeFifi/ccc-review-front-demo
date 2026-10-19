import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Les tests Playwright (e2e/*.spec.ts) ne doivent pas être lancés par Vitest.
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", "e2e/**", ".next/**"],
  },
});
