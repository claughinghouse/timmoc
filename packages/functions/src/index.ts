import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.notFound((c) => {
  return c.text(`Could not find ${c.req.path}`, 404);
});

export default app;
