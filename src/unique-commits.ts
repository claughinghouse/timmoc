import type { DurableObjectStorage } from "@alchemy.run/cloudflare/Workers/DurableObjectStorage";
import type { RuntimeContext } from "alchemy/RuntimeContext";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Random from "effect/Random";
import * as Schema from "effect/Schema";
import * as Semaphore from "effect/Semaphore";
import { CommitGenerator } from "./commit-generator.ts";
import quotes from "./quotes.ts";

const retentionMs = 365 * 24 * 60 * 60 * 1000;
const windowMs = 60_000;
const catalog = [...new Set(quotes.map((quote) => quote.trim()))];
const historySchema = Schema.Struct({
  expiresAt: Schema.Number,
  messages: Schema.Array(Schema.String),
});
const limitsSchema = Schema.Array(Schema.Number);

/** Serializable outcomes returned by the per-IP history RPC. */
export type CommitOutcome =
  | { readonly status: "ok"; readonly message: string }
  | { readonly status: "limited"; readonly retryAfter: number };

/** Build the history handlers against the current Durable Object and generator services. */
export const uniqueCommits = Effect.fnUntraced(function* (storage: DurableObjectStorage) {
  const generator = yield* CommitGenerator;

  return Effect.gen(function* () {
    // Serialize inference as well as storage: an AI await releases DO input gates.
    const lock = yield* Semaphore.make(1);
    const readHistory = Effect.gen(function* () {
      const stored = yield* storage.get("history");
      return stored === undefined
        ? undefined
        : yield* Schema.decodeUnknownEffect(historySchema)(stored).pipe(Effect.orDie);
    });
    const readLimits = Effect.gen(function* () {
      const stored = yield* storage.get("limits");
      return stored === undefined
        ? []
        : yield* Schema.decodeUnknownEffect(limitsSchema)(stored).pipe(Effect.orDie);
    });
    const scheduleCleanup = Effect.fnUntraced(function* (at: number) {
      const alarm = yield* storage.getAlarm();
      yield* storage.setAlarm(Math.min(alarm ?? at, at));
    });
    // Called only while holding the instance lock. Persist before inference, including failures.
    const reserve = Effect.fnUntraced(function* () {
      const now = yield* Clock.currentTimeMillis;
      const stored = yield* readLimits;
      const timestamps = stored.filter((at) => at > now - windowMs);
      const oldest = timestamps[0];
      if (timestamps.length >= 5 && oldest !== undefined) {
        return {
          status: "limited",
          retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
        } as const;
      }
      timestamps.push(now);
      yield* scheduleCleanup(now + windowMs);
      yield* storage.put("limits", timestamps);
      return { status: "allowed" } as const;
    });

    return {
      next: Effect.fn("commits.next")(function* (): Effect.fn.Return<
        CommitOutcome,
        never,
        RuntimeContext
      > {
        const now = yield* Clock.currentTimeMillis;
        const stored = yield* readHistory;
        const history =
          stored !== undefined && stored.expiresAt > now
            ? stored
            : { expiresAt: now + retentionMs, messages: [] };
        // Set cleanup before writing history, including on failed inference.
        yield* scheduleCleanup(history.expiresAt);
        const seen = new Set(history.messages);
        const remaining = catalog.filter((message) => !seen.has(message));
        let message: string;

        if (remaining.length > 0) {
          message = yield* Random.choice(remaining).pipe(Effect.orDie);
        } else {
          const aiAllowance = yield* reserve();
          if (aiAllowance.status === "limited") return aiAllowance;
          message = yield* generator
            .generate([...new Set([...catalog, ...history.messages])])
            .pipe(Effect.catch(() => Random.choice(quotes)));
        }

        // Persist before returning. Duplicates need no additional storage.
        yield* storage.put("history", {
          ...history,
          messages: [...new Set([...history.messages, message])],
        });
        return { status: "ok", message };
      }, lock.withPermits(1)),
      alarm: Effect.fnUntraced(function* () {
        const history = yield* readHistory;
        const now = yield* Clock.currentTimeMillis;
        const stored = yield* readLimits;
        const timestamps = stored.filter((at) => at > now - windowMs);
        const activeHistory = history !== undefined && history.expiresAt > now;
        if (activeHistory || timestamps.length > 0) {
          if (!activeHistory) yield* storage.delete("history");
          if (timestamps.length > 0) yield* storage.put("limits", timestamps);
          else yield* storage.delete("limits");
          yield* storage.setAlarm(
            Math.min(
              activeHistory ? history.expiresAt : Infinity,
              timestamps.length > 0 ? Math.max(...timestamps) + windowMs : Infinity,
            ),
          );
          return;
        }
        yield* storage.deleteAll();
        yield* storage.deleteAlarm();
      }, lock.withPermits(1)),
    };
  });
});

/** Public history handlers exposed by the per-IP Durable Object. */
export type UniqueCommitHistory = Effect.Success<Effect.Success<ReturnType<typeof uniqueCommits>>>;
