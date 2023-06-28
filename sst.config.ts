import { SSTConfig } from "sst";
import { API } from "./stacks/timmocApi";

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
    app.stack(API);
  },
} satisfies SSTConfig;
