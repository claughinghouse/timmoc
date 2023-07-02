import { getQuote } from "@timmoc/core/quotePicker.js";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(
  async (
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
      const id = event.pathParameters?.id;
      const quote = getQuote(String(id));
      return {
        statusCode: 200,
        body: Object.values(quote)[0],
      };
    } catch (error) {
      return { statusCode: 404, body: "Invalid ID" };
    }
  }
);
