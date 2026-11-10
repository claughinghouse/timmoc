import type { Rule } from "@alchemy.run/cloudflare/Ruleset";

/** Complete apex-only custom-firewall policy; add new app routes before deploying them. */
export const wafRules = [
  {
    ref: "drop_internet_background_radiation",
    description: "Drop Internet Background Radiation",
    action: "block",
    enabled: true,
    // Discovery paths remain unblocked, even though the app currently returns 404.
    expression: `(lower(http.host) eq "timmoc.dev" and (
  not http.request.method in {"GET" "HEAD"}
  or (
    not http.request.uri.path in {
      "/" "/unique" "/generate"
      "/robots.txt" "/favicon.ico" "/.well-known/security.txt"
    }
    and not starts_with(http.request.uri.path, "/cdn-cgi/")
  )
))`,
  },
] satisfies Rule[];
