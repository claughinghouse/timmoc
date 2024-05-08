import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const quotes = sqliteTable("quotes", {
  id: text("id").notNull(),
  quoteText: text("quote_text").notNull(),
});
