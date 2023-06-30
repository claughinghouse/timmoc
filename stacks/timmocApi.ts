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
      // "GET /{permalink}": "packages/functions/src/permalink.handler",
      // "GET /json": "packages/functions/src/json.handler",
      // "GET /{permalink}/json": "packages/functions/src/jsonPermalink.handler",
      // "GET /text": "packages/functions/src/text.handler",
      // "GET /{permalink}/text": "packages/functions/src/textPermalink.handler",
      "GET /": "packages/functions/src/default.handler",
      $default: "packages/functions/src/404.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
