import * as Cloudflare from "alchemy/Cloudflare";
import * as Stage from "alchemy/Stage";
import * as Effect from "effect/Effect";
import * as Random from "effect/Random";
import { app } from "./app.ts";

export default Cloudflare.Worker(
  "Worker",
  {
    main: import.meta.url,
    name: Stage.Stage.pipe(
      Effect.map((stage) => (stage === "production" ? "timmoc" : `timmoc-${stage}`)),
    ),
    domain: Stage.Stage.pipe(Effect.map((stage) => (stage === "production" ? "timmoc.dev" : null))),
    compatibility: { date: "2026-10-09", flags: ["nodejs_compat"] },
    workersDev: { enabled: true, previewsEnabled: true },
    placement: { mode: "smart" },
  },
  Effect.succeed({
    fetch: Effect.suspend(() => {
      const seed = crypto.randomUUID();
      return app.pipe(Random.withSeed(seed));
    }),
  }).pipe(Effect.provide(Cloudflare.Telemetry({ headSamplingRate: 1 }))),
);
