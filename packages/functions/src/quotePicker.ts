import quotesAsJson from "./quotes.json" assert { type: "json" };

const quotes: { [key: number]: string } = quotesAsJson;
const keys = Object.keys(quotes);

export function generateRandomQuote() {
  // const quotes: { [key: number]: string } = quotesAsJson;
  // const keys = Object.keys(quotes);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const selectedQuote = quotes[parseInt(randomKey)];
  return { [randomKey]: selectedQuote };
}

export function getQuote(key: number) {
  const selectedQuote = quotes[key];
  if (key in quotesAsJson) {
    return { [key]: selectedQuote };
  } else {
    return "No quote found for ID: " + key;
  }
}
