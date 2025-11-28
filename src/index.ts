import quotes from "./quotes";

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];

      return new Response(quote.toString());
    }

    return new Response("Not found", { status: 404 });
  },
};
