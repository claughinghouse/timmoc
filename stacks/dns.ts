import { StackContext } from "sst/constructs";

const MAPPING: Record<string, string> = {
  prod: "timmoc.dev",
};

export function DNS(props: StackContext) {
  const zone = MAPPING[props.app.stage] || "dev.timmoc.dev";
  const domain = MAPPING[props.app.stage] || `${props.app.stage}.${zone}`;
  return { zone, domain };
}
