import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: [".alchemy/**", ".pi/**", "src/quotes.ts", "aube-lock.yaml", "README.md"],
  },
  lint: {
    ignorePatterns: [".alchemy/**", ".pi/**"],
    options: { typeAware: true, typeCheck: true },
  },
});
