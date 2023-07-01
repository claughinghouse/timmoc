import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getQuote } from "./quotePicker.js";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) {
    return { statusCode: 404, body: "Missing ID" };
  }

  const quote = getQuote(String(id));
  return { statusCode: 200, body: JSON.stringify(quote) };
};
