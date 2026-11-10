import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Stage from "alchemy/Stage";
import * as Effect from "effect/Effect";
import { wafRules } from "./infra/waf.ts";
import Worker from "./src/index.ts";

export default Alchemy.Stack(
  "timmoc",
  { providers: Cloudflare.providers(), state: Cloudflare.state() },
  Effect.gen(function* () {
    if ((yield* Stage.Stage) === "production") {
      const zone = yield* Cloudflare.Zone.Zone("Zone", { name: "timmoc.dev" });
      // Own the complete phase: dashboard-only custom rules can be overwritten.
      yield* Cloudflare.Ruleset.Ruleset("WafRules", {
        zone,
        name: "timmoc custom firewall",
        phase: "http_request_firewall_custom",
        rules: wafRules,
      });
    }

    const worker = yield* Worker;
    return { url: worker.url };
  }),
);
