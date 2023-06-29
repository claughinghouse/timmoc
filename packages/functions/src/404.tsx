import { ApiHandler } from "sst/node/api";
import { quotes } from "./quotes";

export const handler = ApiHandler(async () => {
  return {
    statusCode: 404,
  };
});
