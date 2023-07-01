import quotesAsJson from "./quotes.json" assert { type: "json" };

export function generateRandomQuote() {
  const quotes: { [key: string]: string } = quotesAsJson;
  const keys = Object.keys(quotes);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const selectedQuote = quotes[randomKey];
  return { [randomKey]: selectedQuote };
}
