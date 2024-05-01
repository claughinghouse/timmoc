# Database Setup

Import the csv into the local SQLite database

```shell
sqlite3 data.db <<EOS
.mode csv
.import packages/core/lib/quotes.csv quotes
EOS
```

Dump the local SQLite database

From within the `packages/core/lib` directory

```shell
sqlite3 dump.db .dump > seed.sql
```

---

## Import the SQLite dump file into Cloudflare D1

From within the `packages/core` directory since we need the `wrnagler.toml` file

```shell
bun run prod:migrate:generate
bun run prod:migrate:apply:remote
bun run prod:migrate:apply:seed
```
