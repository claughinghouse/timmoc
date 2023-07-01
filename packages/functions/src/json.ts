import { ApiHandler } from "sst/node/api";
import { getRandomQuote } from "./quotePicker.js";

export const handler = ApiHandler(async () => {
  const response = getRandomQuote();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getRandomQuote()),
  };
});
