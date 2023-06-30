import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async () => {
  return {
    statusCode: 404,
  };
});
