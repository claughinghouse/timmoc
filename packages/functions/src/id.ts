import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getQuote } from "@timmoc/core/quotePicker.js";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const id = event.pathParameters?.id;
  const quote = getQuote(String(id));
  const value = Object.values(quote)[0];
  return { statusCode: 200, body: value };
};
