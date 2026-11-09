<div align="center">

# [timmoc.dev](https://timmoc.dev)

</div>

## 📖 What is this?

A [What The Commit](https://whatthecommit.com/) clone built as a Cloudflare Worker. It returns random commit messages for those times when you just need to ship code and don't want to think about commit messages. I started this project when [commitment](https://github.com/ngerakines/commitment) and [whatthecommit](https://whatthecommit.com) were down.

---

## 🚀 How to use

| Endpoint | Description                              | Try it                           | Response            |
| -------- | ---------------------------------------- | -------------------------------- | ------------------- |
| `/`      | Returns a random commit message in plain text | [timmoc.dev](https://timmoc.dev) | `Wubbalubbadubdub!` |
| `/unique` | Returns an unused catalog message for your IP, then generates after exhaustion | GET, no parameters | Plain text |
| `/generate` | Always generates from the existing commit-message array, without IP history | GET, no parameters | Plain text |

#### For a list of quotes, see [quotes.ts](https://github.com/claughinghouse/timmoc/blob/main/src/quotes.ts)

I have an alias in my [.gitconfig](https://github.com/claughinghouse/dotfiles/blob/main/dot_gitconfig#L12) that allows me to run `git yolo` and it will commit with a random commit message from this repo. If I feel really adventurous, I can run `git yeet` and it will add all the files, commit them, and push.

You can add this git alias and be up and running quickly.

```bash
git config --global alias.timmoc '!git commit -m "$(curl -s https://timmoc.dev)"'
```

Then just run `git timmoc` to add a random commit message to your staged changes.

### Opt-in history and Workers AI

`GET /unique` checks a Durable Object for your IP, chooses a message from `quotes.ts` that it has not handed to that IP, and saves it before returning it. Once there are no unused catalog messages, it calls Workers AI with the catalog and previously generated messages. Concurrent requests for the same IP are serialized.

History expires **365 days after the first `/unique` request**, not a year after every request. A Durable Object alarm deletes expired history; the next visit starts fresh. Requests also check expiry in case the alarm is delayed. There is no global uniqueness guarantee: shared public IPs share history, changing IPs starts different history, and generated messages may repeat. If inference fails, times out after 15 seconds, or the full examples exceed the 40,000-byte prompt budget, `/unique` returns a catalog message instead.

`GET /generate` calls the same generation function with the existing `quotes.ts` array. It needs **no query parameters or request body**, does not record message history, and returns HTTP 503 if generation is unavailable. Both new routes return plain text with `Cache-Control: private, no-store`. Other methods on these routes return 405.

**Only AI attempts are rate-limited:** at most **5 per rolling 60 seconds per IP**, shared between `/generate` and `/unique` after catalog exhaustion. Serving unused catalog messages consumes no allowance and remains available even when generation is limited. The Durable Object serializes and persists reservations before inference, including failed attempts, so concurrent requests and eviction cannot reset the limit. Excess attempts return HTTP **429** with `Retry-After` in seconds. Its alarm removes expired counters, retains any unexpired history, and deletes all storage and the alarm when neither remains. Generation-only visitors therefore retain counters for one minute, not a year. This per-IP limit is not a global spending cap.

The model is [`@cf/meta/llama-3.2-1b-instruct`](https://developers.cloudflare.com/workers-ai/models/llama-3.2-1b-instruct/), called through a Workers AI binding. Only commit messages are sent to the model. Both opt-in routes use Cloudflare's `CF-Connecting-IP` header (never `X-Forwarded-For`), canonicalize IPv6, and hash the address before naming the object. Hashing is pseudonymization, not anonymity; it does not change Cloudflare's own logging or retention. `/` remains unchanged and never creates IP history or rate-limit state.

After deploying this branch, opt your git alias into history:

```bash
git config --global alias.timmoc-unique '!f() { message=$(curl -fsS https://timmoc.dev/unique) && git commit -m "$message"; }; f'
```

Use `/generate` in that alias instead if you always want AI. `curl -f` and `&&` keep HTTP errors from becoming commit messages. These are public, unauthenticated AI endpoints, so each generation can incur Workers AI usage charges.

### Architecture decision: keep state in Alchemy's Effect-native Durable Object

The existing app uses Alchemy V2 and Effect. The new per-IP namespace and AI binding are declared in that same composition root, rather than adding a separate Wrangler configuration or Agents SDK. The object needs only a history record, up to five attempt timestamps, and a cleanup alarm, so it uses the key/value API on **SQLite-backed** Durable Object storage; no application SQL schema or ORM is needed. The alarm owns cleanup rather than a recurring heartbeat that would retain an otherwise expired object.

Run `aube run check` and `aube run test`. Tests run in local workerd with real SQLite-backed objects, eviction, concurrency, and alarms; inference is substituted at the generator/binding seam, so tests incur no Workers AI charges. The test Worker is not deployed. The Vite override keeps the Cloudflare test plugin on Vite+'s bundled Vite implementation.

## But why?

Since most of my projects are solo ventures, I dislike spending time and creative juices creating commit messages that I may never see again. I would rather `git yeet` my changes and iterate rapidly.

## 🫶 Contributing

Want to see your commit message added to the list? Submit a PR with your commit message added to the [quotes.ts](https://github.dev/claughinghouse/timmoc/blob/main/src/quotes.ts) file. If you want to add a new feature, please open an issue first.

## 🤝 Gratitude and Thanks

Thanks to [Nick Gerakines](https://github.com/ngerakines) for creating [commitment](https://github.com/ngerakines/commitment) and the original [whatthecommit](https://whatthecommit.com) that inspired this project.
