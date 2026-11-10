import { it } from "@effect/vitest";
import { expect } from "vite-plus/test";
import { RuntimeContext } from "alchemy/RuntimeContext";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import { TestClock } from "effect/testing";
import { CommitGenerator } from "./commit-generator.ts";
import quotes from "./quotes.ts";

const completion = (content: string) => ({
  choices: [{ message: { content }, finish_reason: "stop" }],
});

it.effect("sends the full examples to the cheap model and returns a plain message", () =>
  Effect.gen(function* () {
    const generator = yield* CommitGenerator;
    expect(yield* generator.generate(quotes)).toBe("Ship the tiny robot");
  }).pipe(
    Effect.provide(
      CommitGenerator.layer({
        run: (model, inputs) => {
          expect(model).toBe("@cf/ibm-granite/granite-4.0-h-micro");
          const system = inputs.messages?.find((message) => message.role === "system")?.content;
          expect(system).toContain("single plain-text line");
          expect(system).toContain("Do not include line breaks, Markdown, code fences");
          expect(inputs.messages?.find((message) => message.role === "user")?.content).toBe(
            JSON.stringify(quotes),
          );
          return Effect.succeed(completion(' "Ship the tiny robot" '));
        },
      }),
    ),
    Effect.provide(RuntimeContext.phantom),
  ),
);

it.effect("unwraps a model's fenced single-line response", () =>
  Effect.gen(function* () {
    const generator = yield* CommitGenerator;
    expect(yield* generator.generate(quotes)).toBe("Ship the tiny robot");
  }).pipe(
    Effect.provide(
      CommitGenerator.layer({
        run: () => Effect.succeed(completion("```\nShip the tiny robot\n```")),
      }),
    ),
    Effect.provide(RuntimeContext.phantom),
  ),
);

it.effect("classifies safe failure reasons without retaining raw provider errors", () =>
  Effect.gen(function* () {
    for (const [run, reason] of [
      [() => Effect.fail({ secret: "must not enter diagnostics" }), "inference-failed"],
      [() => Effect.succeed({ unexpected: true }), "invalid-response"],
      [() => Effect.succeed(completion("")), "invalid-message"],
      [() => Effect.succeed({ choices: [] }), "invalid-response"],
      [
        () =>
          Effect.succeed({
            choices: [{ message: { content: "partial" }, finish_reason: "length" }],
          }),
        "invalid-response",
      ],
    ] as const) {
      const error = yield* Effect.gen(function* () {
        const generator = yield* CommitGenerator;
        return yield* generator.generate(quotes);
      }).pipe(
        Effect.provide(CommitGenerator.layer({ run })),
        Effect.provide(RuntimeContext.phantom),
        Effect.flip,
      );
      expect(error.reason).toBe(reason);
      expect(JSON.stringify(error)).not.toContain("must not enter diagnostics");
    }
  }),
);

it.effect("classifies inference timeout after 15 seconds", () =>
  Effect.gen(function* () {
    const generator = yield* CommitGenerator;
    const fiber = yield* generator.generate(quotes).pipe(Effect.flip, Effect.forkChild);
    yield* TestClock.adjust("15 seconds");
    expect((yield* Fiber.join(fiber)).reason).toBe("timeout");
  }).pipe(
    Effect.provide(CommitGenerator.layer({ run: () => Effect.never })),
    Effect.provide(RuntimeContext.phantom),
  ),
);

it.effect("rejects unusable AI output and oversized examples without an inference call", () =>
  Effect.gen(function* () {
    for (const response of ["", "one\ntwo", "```\none\ntwo\n```", "x".repeat(201)]) {
      const result = yield* Effect.gen(function* () {
        const generator = yield* CommitGenerator;
        return yield* generator.generate(quotes);
      }).pipe(
        Effect.provide(CommitGenerator.layer({ run: () => Effect.succeed(completion(response)) })),
        Effect.provide(RuntimeContext.phantom),
        Effect.exit,
      );
      expect(Exit.isFailure(result)).toBe(true);
    }
    const result = yield* Effect.gen(function* () {
      const generator = yield* CommitGenerator;
      return yield* generator.generate(["x".repeat(40_001)]);
    }).pipe(
      Effect.provide(
        CommitGenerator.layer({ run: () => Effect.die("Oversized input reached AI") }),
      ),
      Effect.provide(RuntimeContext.phantom),
      Effect.result,
    );
    expect(result._tag).toBe("Failure");
  }),
);
