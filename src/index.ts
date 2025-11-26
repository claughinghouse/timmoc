import quotes from "./quotes";

export default {
  async fetch(_request: Request, _env: Env): Promise<Response> {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    return new Response(quote.toString());
  },
};
