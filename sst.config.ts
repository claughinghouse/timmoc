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
    const worker = new sst.cloudflare.Worker("Timmoc", {
      handler: "packages/functions/src/index.ts",
      url: true,
    });
    return {
      url: worker.url,
    };
  },
});
