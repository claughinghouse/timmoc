import * as Cloudflare from "alchemy/Cloudflare";
import * as Output from "alchemy/Output";
import * as Stage from "alchemy/Stage";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Random from "effect/Random";
import { app } from "./app.ts";
import { CommitGenerator } from "./commit-generator.ts";
import { uniqueCommits } from "./unique-commits.ts";

const generatorLayer = Layer.unwrap(
  Effect.gen(function* () {
    const ai = yield* Cloudflare.Workers.AI();
    return CommitGenerator.layer(ai);
  }),
).pipe(Layer.provide(Cloudflare.Workers.AIBinding));

/** SQLite-backed history namespace, provisioned alongside the Worker by Alchemy. */
export class UniqueCommits extends Cloudflare.DurableObject<UniqueCommits>()(
  "UniqueCommits",
  Effect.gen(function* () {
    const state = yield* Cloudflare.DurableObjectState;
    return yield* uniqueCommits(state.storage);
  }).pipe(Effect.provide(generatorLayer)),
) {}

export default Cloudflare.Worker(
  "Worker",
  {
    main: import.meta.url,
    name: Stage.Stage.pipe(
      Effect.map((stage) => (stage === "production" ? "timmoc" : `timmoc-${stage}`)),
      Output.fromEffect,
    ),
    domain: Stage.Stage.pipe(
      Effect.map((stage) => (stage === "production" ? "timmoc.dev" : null)),
      Output.fromEffect,
    ),
    compatibility: { date: "2026-10-09", flags: ["nodejs_compat"] },
    workersDev: { enabled: true, previewsEnabled: true },
    placement: { mode: "smart" },
  },
  Effect.gen(function* () {
    const histories = yield* UniqueCommits;
    return {
      fetch: Effect.suspend(() => {
        const seed = crypto.randomUUID();
        return app(histories).pipe(Random.withSeed(seed));
      }),
    };
  }).pipe(Effect.provide(Cloudflare.Telemetry({ headSamplingRate: 1 }))),
);
