import { isIP } from "node:net";
import * as Effect from "effect/Effect";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import * as Random from "effect/Random";
import quotes from "./quotes.ts";
import type { UniqueCommitHistory } from "./unique-commits.ts";

/** /unique records per-IP history and generates only after catalog exhaustion. */
export const app = Effect.fn("timmoc.request")(function* (histories: {
  readonly getByName: (name: string) => Pick<UniqueCommitHistory, "next">;
}) {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const url = new URL(request.url, "https://timmoc.dev");

  if (url.pathname === "/unique") {
    const headers = { "cache-control": "private, no-store" };
    if (request.method !== "GET") {
      return HttpServerResponse.text(`Use GET ${url.pathname}`, {
        status: 405,
        headers: { ...headers, allow: "GET" },
      });
    }
    const ip = request.headers["cf-connecting-ip"];
    if (ip === undefined || isIP(ip) === 0) {
      return HttpServerResponse.text("Cloudflare client IP unavailable", {
        status: 400,
        headers,
      });
    }
    // Canonicalize IPv6 and hash the address; no raw IP is stored or sent to AI.
    const canonical = isIP(ip) === 6 ? new URL(`http://[${ip}]/`).hostname : ip;
    const digest = yield* Effect.promise(() =>
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical)),
    );
    const key = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const history = histories.getByName(key);
    return yield* history.next().pipe(
      Effect.map((outcome) => {
        switch (outcome.status) {
          case "ok":
            return HttpServerResponse.text(outcome.message, { headers });
          case "limited":
            return HttpServerResponse.text("AI rate limit exceeded; try again later", {
              status: 429,
              headers: { ...headers, "retry-after": String(outcome.retryAfter) },
            });
          case "unavailable":
            return HttpServerResponse.text("Generation unavailable; try again later", {
              status: 503,
              headers: { ...headers, "retry-after": "30" },
            });
        }
      }),
      Effect.catch(() =>
        Effect.succeed(
          HttpServerResponse.text("Commit history unavailable", {
            status: 503,
            headers,
          }),
        ),
      ),
    );
  }

  if (url.pathname !== "/") {
    return HttpServerResponse.text("Not found", {
      status: 404,
      contentType: "text/plain; charset=utf-8",
    });
  }

  const quote = yield* Random.choice(quotes);
  return HttpServerResponse.text(quote, {
    contentType: "text/plain; charset=utf-8",
  });
});
