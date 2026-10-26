import * as Effect from "effect/Effect";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import * as Random from "effect/Random";
import quotes from "./quotes.ts";

export const app = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const url = new URL(request.url, "https://timmoc.dev");

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
}).pipe(Effect.withSpan("timmoc.request"));
