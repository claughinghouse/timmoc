import { generateRandomQuote } from "@timmoc/functions/quotePicker.js";
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async () => {
  const response = generateRandomQuote();
  return {
    statusCode: 200,
    body: Object.values(response).toString(),
  };
});
