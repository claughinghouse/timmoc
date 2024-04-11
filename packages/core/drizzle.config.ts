import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
  strict: true,
  verbose: true,
  out: "./migrations/",
  schema: "./src/**/*.sql.ts",
  driver: "d1",
  dbCredentials: {
    wranglerConfigPath: "wrangler.toml",
    dbName: Resource.TimmocDb,
  },
});
