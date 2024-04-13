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
  console.log(quote);
  return c.json(quote);
});

app.notFound((c) => {
  return c.text(`Could not find ${c.req.path}`, 404);
});

export default app;
