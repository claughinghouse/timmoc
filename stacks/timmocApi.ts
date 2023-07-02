import { Api, StackContext, use } from "sst/constructs";
import { DNS } from "./dns.js";

export function API({ stack }: StackContext) {
  const dns = use(DNS);

  const api = new Api(stack, "api", {
    customDomain: {
      hostedZone: dns.zone,
      domainName: dns.domain,
    },
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
      "GET /{id}": "packages/functions/src/id.handler",
      "GET /json": "packages/functions/src/json.handler",
      "GET /json/{id}": "packages/functions/src/jsonId.handler",
      "GET /": "packages/functions/src/default.handler",
      $default: "packages/functions/src/404.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
  return api;
}
