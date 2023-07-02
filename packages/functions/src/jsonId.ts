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
      const value = Object.values(quote)[0];
      const response = {
        id: event.pathParameters?.id,
        quote: value,
        json_permalink:
          "https://" + event.requestContext.domainName + "/json/" + id,
      };
      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    } catch (error) {
      return { statusCode: 404, body: "Invalid ID" };
    }
  }
);
