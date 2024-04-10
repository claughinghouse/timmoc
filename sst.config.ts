/// <reference path="./.sst/platform/config.d.ts" />

import { weakImport } from "sst/constructs";

export default $config({
  app(input) {
    return {
      name: "timmoc",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "cloudflare",
    };
  },
  async run() {
    const domain =
      {
        production: "timmoc.dev",
        dev: "timmoc.laughinghou.se",
      }[$app.stage] || $app.stage + "timmoc.laughinghou.se";

    const timmocWorker = new sst.cloudflare.Worker("TimmocWorker", {
      handler: "packages/functions/src/index.ts",
      url: true,
      domain: domain,
    });
    return {
      url: timmocWorker.url,
    };
  },
});
