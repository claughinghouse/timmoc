import { Hono } from "hono";
import { Resource } from "sst";

const app = new Hono();

// app.get("/", (c) => {
//   return c.text("Hello Hono!");
// });

app.get("/", async (c) => {
  const quote = await Resource.TimmocDb.prepare(
    "SELECT quote_text FROM quotes ORDER BY RANDOM() LIMIT 1",
  ).run();
  console.log(quote.results[0].quote_text);

  return c.text(quote.results[0].quote_text);
});

app.notFound((c) => {
  return c.text(`Could not find ${c.req.path}`, 404);
});

export default app;
