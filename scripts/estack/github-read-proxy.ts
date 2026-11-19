import { readFileSync } from "node:fs";
import { numberAt, stringAt } from "./coding-jobs";
import { type GithubApp, type InstallationToken, installationToken } from "./github-app";

export interface ProxyConfig {
  repo: string;
  appId: string;
  installationId: string;
  privateKeyPath: string;
  port: number;
}

export type Upstream = { url: string; method: "GET" | "POST" } | null;

const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u;

export function upstreamFor(repo: string, method: string, url: URL): Upstream {
  if (!REPO.test(repo)) return null;
  const path = url.pathname;
  if (path.includes("..") || path.includes("//")) return null;
  if (method === "GET" && path.startsWith("/api/") && path.length > 5)
    return { url: `https://api.github.com/repos/${repo}/${path.slice(5)}${url.search}`, method: "GET" };
  if (method === "GET" && path === "/git/info/refs" && url.search === "?service=git-upload-pack")
    return { url: `https://github.com/${repo}.git/info/refs?service=git-upload-pack`, method: "GET" };
  if (method === "POST" && path === "/git/git-upload-pack")
    return { url: `https://github.com/${repo}.git/git-upload-pack`, method: "POST" };
  return null;
}

function readConfig(path: string): ProxyConfig {
  const value = JSON.parse(readFileSync(path, "utf8"));
  const repo = stringAt(value, "repo");
  const appId = stringAt(value, "appId");
  const installationId = stringAt(value, "installationId");
  const privateKeyPath = stringAt(value, "privateKeyPath");
  const port = numberAt(value, "port");
  if (
    repo === null ||
    !REPO.test(repo) ||
    appId === null ||
    installationId === null ||
    privateKeyPath === null ||
    port === null
  )
    throw new Error("The proxy configuration is not valid.");
  return { repo, appId, installationId, privateKeyPath, port };
}

if (import.meta.main) {
  const config = readConfig(process.argv[2] ?? "/etc/estack/github-read.json");
  const app: GithubApp = {
    appId: config.appId,
    installationId: config.installationId,
    privateKeyPem: readFileSync(config.privateKeyPath, "utf8"),
  };
  let cached: InstallationToken | null = null;
  const token = async (): Promise<string> => {
    if (!cached || Date.parse(cached.expiresAt) - Date.now() < 5 * 60_000) cached = await installationToken(app);
    return cached.token;
  };
  Bun.serve({
    hostname: "127.0.0.1",
    port: config.port,
    async fetch(request) {
      const upstream = upstreamFor(config.repo, request.method, new URL(request.url));
      if (!upstream) return new Response("This proxy only reads this repository.\n", { status: 403 });
      const isGit = !upstream.url.startsWith("https://api.github.com/");
      const authorization = isGit
        ? `Basic ${Buffer.from(`x-access-token:${await token()}`).toString("base64")}`
        : `Bearer ${await token()}`;
      const headers = new Headers({ Authorization: authorization, "User-Agent": "estack" });
      for (const name of ["accept", "content-type", "content-encoding", "git-protocol"]) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
      }
      const response = await fetch(upstream.url, {
        method: upstream.method,
        headers,
        ...(upstream.method === "POST" ? { body: await request.arrayBuffer() } : {}),
      });
      const out = new Headers();
      for (const name of ["content-type", "cache-control"]) {
        const value = response.headers.get(name);
        if (value) out.set(name, value);
      }
      return new Response(response.body, { status: response.status, headers: out });
    },
  });
  process.stdout.write(`GitHub read proxy for ${config.repo} on 127.0.0.1:${config.port}\n`);
}
