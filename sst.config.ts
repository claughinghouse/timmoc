/// <reference path="./.sst/platform/config.d.ts" />

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
        dev: "dev.timmoc.dev",
      }[$app.stage] || `${$app.stage}.dev.timmoc.dev`;

    const timmocDb = new sst.cloudflare.D1("TimmocDb");

    const timmocWorker = new sst.cloudflare.Worker("TimmocWorker", {
      handler: "packages/functions/src/index.ts",
      url: true,
      domain: domain,
      link: [timmocDb],
    });
    return {
      url: timmocWorker.url,
    };
  },
});
