import { randomQuote } from "@timmoc/functions/quotePicker.js";
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async () => {
  const response = randomQuote();
  return {
    statusCode: 200,
    body: response,
  };
});
