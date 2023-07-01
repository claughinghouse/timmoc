import { getRandomQuote } from "@timmoc/functions/quotePicker.js";
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async () => {
  const response = getRandomQuote();
  return {
    statusCode: 200,
    body: Object.values(response).toString(),
  };
});
