import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [
    cloudflareTest({
      main: "./src/test-worker.ts",
      config: false,
      remoteBindings: false,
      miniflare: {
        compatibilityDate: "2026-10-09",
        compatibilityFlags: ["nodejs_compat"],
        durableObjects: { HISTORY: { className: "HistoryFixture", useSQLite: true } },
      },
    }),
  ],
  fmt: {
    ignorePatterns: [".alchemy/**", ".pi/**", "src/quotes.ts", "aube-lock.yaml", "README.md"],
  },
  lint: {
    ignorePatterns: [".alchemy/**", ".pi/**"],
    options: { typeAware: true, typeCheck: true },
  },
});
