import { getRandomQuote } from "@timmoc/functions/quotePicker.js";
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async () => {
  const randomQuote = getRandomQuote();
  // Remove the quotes from the json object
  const response = JSON.stringify(randomQuote).replace(/^"|"$/g, "");
  return {
    statusCode: 200,
    body: response,
  };
});
