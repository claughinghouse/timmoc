# Building timmoc with AI

This is a sanitized, condensed record of a development conversation between the maintainer and an AI coding assistant. It documents how AI helped build the opt-in commit-message routes and investigate a development-environment failure.

The exchanges below are **paraphrases, not a verbatim transcript**. Repeated instructions, tool output, and routine progress messages have been condensed. Personal identifiers, machine paths, private conversation links, account-specific infrastructure addresses, and credentials are omitted. Technical names, public package versions, and error codes are retained where they explain a decision.

This record describes the work and checks performed during the session; it is not a claim that the feature was deployed or that every future dependency version will behave the same way.

## Two different uses of AI

- **During development:** The assistant inspected the repository, wrote code and tests, ran local checks, and investigated dependency and infrastructure behavior. The maintainer supplied the goal, corrected misunderstandings, and authorized external actions.
- **In the application:** Cloudflare Workers AI generates funny commit messages. The application uses `@cf/meta/llama-3.2-1b-instruct`; that is separate from the coding assistant. Local tests substitute inference and do not validate the live model's output quality.

## 1. Start with a learning experiment

**Maintainer:** Add a Durable Object per IP that remembers which commit messages we have handed out. Try another existing message before generating a new one with a cheap Workers AI model. Make it opt-in, on a new route and branch. This is for fun and to learn Workers AI.

**Clarification:** Duplicates are acceptable. Use a Durable Object alarm for cleanup and retain history for one year.

**Result:** The existing `/` route stays stateless. The new history path checks the catalog for messages the caller's IP has not received, saves the selected message before returning it, and generates only when that catalog is exhausted. Generated messages are best-effort, not guaranteed unique.

The implementation uses the project's existing Alchemy and Effect stack, with SQLite-backed Durable Object storage. History expires 365 days after the first `/unique` request in a history period; subsequent requests do not extend it.

## 2. Correct the route design

**Maintainer:** Add a separate generation route and corresponding function. All routes must use GET because they will be called from a git commit alias.

**Correction:** A proposed `GET /generate?messages=...` interface was not the intended API. The maintainer wanted `/unique` and `/generate`, with no query parameters.

**Result:**

| Route           | Behavior                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `GET /`         | Return a random existing message without IP history.                                            |
| `GET /unique`   | Return and record an unused catalog message for the caller's IP; generate after exhaustion.     |
| `GET /generate` | Generate using the existing commit-message array internally, without recording message history. |

Both new routes return plain text and require neither a request body nor query parameters. The examples passed to the generation function come from the application, not caller-supplied JSON.

**What the correction changed:** A function accepting an array internally does not imply that the HTTP caller must supply that array. The maintainer's alias workflow determined the public interface.

## 3. Limit inference, not catalog selection

**Maintainer:** How can we rate-limit the routes? Use strict Durable Object limits.

**Correction:** Apply the limit only once the existing array is exhausted on `/unique`.

**Result:** The object enforces a shared allowance of **five AI attempts per rolling 60 seconds per IP**. `/generate` always uses that allowance; `/unique` uses it only when it needs generation. Serving an unused catalog message neither consumes allowance nor gets blocked by an exhausted AI allowance.

Reservations are persisted before inference, and failed generation attempts count. Requests and alarm cleanup are serialized within the object. Excess attempts return HTTP 429 with `Retry-After`; responses from both opt-in routes use `Cache-Control: private, no-store`.

The alarm handles both retention periods: one-year message history and short-lived inference timestamps. It deletes all storage and clears the alarm when neither remains. An IP used only for `/generate` does not acquire a year of message history.

**Limitations kept explicit:** Shared public IPs share history and allowance. Changing IPs starts separate state. Hashing an IP is pseudonymization, not anonymity. A per-IP quota is not a global spending cap.

## 4. Verify behavior without paying for inference

**Assistant:** Exercise the actual history handlers in local workerd with real SQLite-backed Durable Objects, substituting only the inference dependency. Check the HTTP behavior as well as the storage behavior.

**Recorded checks:**

- Catalog exhaustion before generation, persistence across eviction, and isolation between callers.
- Concurrent requests, shared AI allowance, failed-attempt accounting, and rolling-window boundaries.
- One-year history expiry and alarm cleanup without resetting still-active AI allowance.
- Parameter-free GET routes, IP canonicalization, method rejection, and HTTP 429/503 responses.
- Generator input/output validation through the AI binding seam.

All **10 tests**, lint, and type checks passed. A local Alchemy-built Worker also served **35 concurrent `/unique` requests with 35 distinct catalog messages**.

**What this did not prove:** Live Workers AI inference was not invoked. These checks verify orchestration, limits, storage, and response handling, not the humor or uniqueness of real model output. The initial preview used isolated local state, so it did not verify access to the shared deployment state store.

The maintainer then requested a commit and push to a new branch. The feature was pushed to `feat/unique-commits`. No CI checks ran for that push because the repository workflow triggers on pull requests or pushes to `main`, not feature-branch pushes. Local checks were not presented as a successful CI run.

## 5. Investigate a real startup failure

**Maintainer:** Are the dependencies current? `alchemy dev` reports a newer Alchemy release, then fails while updating the shared state store with `StateStoreError`, `DecodeError`, and HTTP 409. A terminal-read `EIO` also appears after interruption.

**Assistant:** Check installed versions against the package registry and inspect the state-store implementation. Do not assume that an upgrade notice explains the failure.

The installed dependencies were behind current releases. The maintainer authorized dependency updates and, if necessary, an upgrade of the shared state store.

**Upgrade work:** Alchemy moved from `2.0.0-beta.83` to `2.0.0-beta.85`; the Effect packages moved together from `4.0.5` to `4.1.2`. TypeScript, Vite+, and Cloudflare packages were updated too. Node type definitions stayed on the latest Node 24 line to match the runtime rather than jumping to Node 26 types.

The first check after updating failed: the newer Alchemy release had split Cloudflare support into **`@alchemy.run/cloudflare`**. Adding that matching provider package and changing the imports restored passing checks. The update required more than changing version numbers.

**Root cause:** A read-only probe of the shared state store's legacy bootstrap path returned HTTP 409 with this explanation:

> This Cloudflare State Store was deployed by a newer version of Alchemy. Upgrade alchemy to use it.

The store already used version 8. Its implementation deliberately refuses the old bootstrap path to prevent an older CLI from overwriting authentication and encryption secrets. The older client surfaced this protection as a decode failure rather than a helpful upgrade message.

**Resolution:** The newer CLI successfully adopted the existing store. No state-store redeployment was needed. The normal `alchemy dev` configuration then loaded shared state and started the local Worker successfully.

All 10 tests and static checks passed again. HTTP smoke checks confirmed the original route, distinct catalog messages, and rejection of POST generation. No production app deployment or live inference was performed. The post-interruption `EIO` was not reproduced in the noninteractive run and was not claimed to be fixed.

## What this session illustrates

AI contributed implementation, tests, package migration work, and source-level investigation. Human corrections shaped the API and prevented an unwanted limit on ordinary catalog requests. Tool results supplied evidence when an initial explanation was uncertain.

The useful record includes the wrong turns: the query-parameter proposal, the overly broad rate limit, the dependency split discovered by failing checks, and the distinction between local verification and shared-state startup. AI assistance shortened the work, but did not remove the need for explicit requirements, review, verification, or permission before changing shared infrastructure.
