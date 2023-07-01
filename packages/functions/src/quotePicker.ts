import hashedQuotes from "./hashedQuotes.json" assert { type: "json" };

interface Quote {
  [key: string]: string;
}

const quotes: Quote = hashedQuotes;
const keys = Object.keys(quotes);

export function generateRandomQuote() {
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const selectedQuote = quotes[randomKey];
  return { [randomKey]: selectedQuote };
}

export function getQuote(key: string) {
  const selectedQuote = quotes[key];
  if (key in quotes) {
    return { [key]: selectedQuote };
  } else {
    return { error: "No quote found for ID: " + key };
  }
}
