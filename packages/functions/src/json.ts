import { ApiHandler } from "sst/node/api";
import { randomQuote } from "./quotePicker";

export const handler = ApiHandler(async () => {
  const response = randomQuote();
  return {
    statusCode: 200,
    body: JSON.stringify({ commit_msg: response }),
  };
});
