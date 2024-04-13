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
    // TODO: Move this to Resource.TimmocDb once supported
    dbName: "timmoc-cody-timmocdbdatabase",
  },
});
