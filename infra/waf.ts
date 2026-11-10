import type { Rule } from "@alchemy.run/cloudflare/Ruleset";

// Exported from the live "Drop Internet Background Radiation" rule on 2026-11-10.
// Keep its zone-wide coverage, including subdomains, when adding the apex policy.
const existingProbePaths = [
  "/.env",
  "/.git",
  "/.config",
  "/.svn",
  "/.aws",
  "/.htaccess",
  "/.htpasswd",
  "/.DS_Store",
  "/wp-login",
  "/xmlrpc",
  "/phpmyadmin",
  "/wp-admin",
  "/wp-includes",
  "/wp-content",
  "/phpinfo",
  ".php",
  ".php/",
  ".php?",
  "/@vite",
  "/.vscode",
  "/config",
];

const existingProbeExpression = existingProbePaths
  .map((path) => `(http.request.uri.path contains ${JSON.stringify(path)})`)
  .join(" or ");

// Discovery paths remain unblocked, even though the app currently returns 404.
// Add new application routes here before deploying them.
const supportedPaths = [
  "/",
  "/unique",
  "/generate",
  "/robots.txt",
  "/favicon.ico",
  "/.well-known/security.txt",
];

const unsupportedRequestExpression = `(lower(http.host) eq "timmoc.dev" and (
  not http.request.method in {"GET" "HEAD"}
  or (
    not http.request.uri.path in {${supportedPaths.map((path) => JSON.stringify(path)).join(" ")}}
    and not starts_with(http.request.uri.path, "/cdn-cgi/")
  )
))`;

/** Complete production custom-firewall policy, with no dependency on remote rule IDs. */
export const wafRules = [
  {
    ref: "drop_internet_background_radiation",
    description: "Drop Internet Background Radiation",
    action: "block",
    enabled: true,
    expression: `(${existingProbeExpression}) or ${unsupportedRequestExpression}`,
  },
] satisfies Rule[];
