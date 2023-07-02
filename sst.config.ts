import { SSTConfig } from "sst";
import { API } from "./stacks/timmocApi.js";
import { DNS } from "./stacks/dns.js";

export default {
  config(_input) {
    const profile: Record<string, string> = {
      dev: "development",
      prod: "prod",
    };
    return {
      name: "timmoc",
      region: "us-east-2",
      profile: profile[_input.stage || ""] || profile.dev,
    };
  },
  stacks(app) {
    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy("destroy");
    }
    app.stack(DNS).stack(API);
  },
} satisfies SSTConfig;
