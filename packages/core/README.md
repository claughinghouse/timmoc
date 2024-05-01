# Database Maintenance

sqlite3 data.db <<EOS
.mode csv
.import packages/core/lib/quotes.csv quotes
EOS

---

bun run wrangler d1 execute timmoc-production-timmocdbdatabase --remote --file=packages/core/lib/seed.sql
