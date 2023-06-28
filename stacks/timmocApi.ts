import { Api, StackContext } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    accessLog: {
      retention: "one_year",
    },
    defaults: {
      function: {
        architecture: "arm_64",
        runtime: "nodejs18.x",
      },
      throttle: {
        rate: 10,
      },
    },
    routes: {
      "GET /json": "packages/functions/src/json.handler",
      "GET /text": "packages/functions/src/text.handler",
      "GET /{id}": "",
      "GET /json/{id}": "",
      "GET /text/{id}": "",
      $default: "packages/functions/src/lambda.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
