import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getQuote } from "./quotePicker.js";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) {
    return { statusCode: 404, body: "Missing ID" };
  }

  const quote = getQuote(String(id));
  const value = Object.values(quote)[0];
  return { statusCode: 200, body: value };
};
