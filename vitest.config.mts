import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/support/empty.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["tests/support/setup.ts"],
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", "e2e/**", ".open-next/**", ".next/**"],
  },
});
