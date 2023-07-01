import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getQuote } from "./quotePicker.js";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const id = event.pathParameters?.id;
  if (!id || isNaN(Number(id))) {
    return { statusCode: 404, body: "Invalid ID: " + id };
  }

  const quote = getQuote(Number(id));
  if (typeof quote === "string") {
    return { statusCode: 404, body: quote };
  } else {
    return { statusCode: 200, body: JSON.stringify(quote) };
  }
};
