import { ApiHandler } from "sst/node/api";
import { generateRandomQuote } from "@timmoc/core/quotePicker.js";

export const handler = ApiHandler(async () => {
  const response = generateRandomQuote();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(generateRandomQuote()),
  };
});
