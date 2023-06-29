import { ApiHandler } from "sst/node/api";
import { randomQuote } from "./quotePicker";

export const handler = ApiHandler(async () => {
  const response = randomQuote();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hash: "HASH",
      commit_msg: response,
      permalink: "sha",
    }),
  };
});
