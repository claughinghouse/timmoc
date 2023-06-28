import { Api, StackContext } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    // defaults: {
    //   function: {
    //     architecture: "arm_64",
    //     runtime: "nodejs18.x",
    //   },
    // },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /json": "packages/functions/src/json.handler",
      "GET /text": "packages/functions/src/text.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
