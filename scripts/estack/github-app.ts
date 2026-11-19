import { createSign } from "node:crypto";
import { stringAt } from "./coding-jobs";

export interface GithubApp {
  appId: string;
  installationId: string;
  privateKeyPem: string;
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

export function appJwt(app: GithubApp, now: Date = new Date()): string {
  const issuedAt = Math.floor(now.getTime() / 1000) - 60;
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({ iat: issuedAt, exp: issuedAt + 540, iss: app.appId }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${base64Url(signer.sign(app.privateKeyPem))}`;
}

export interface InstallationToken {
  token: string;
  expiresAt: string;
}

export async function installationToken(app: GithubApp): Promise<InstallationToken> {
  const response = await fetch(`https://api.github.com/app/installations/${app.installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${appJwt(app)}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "estack",
    },
  });
  if (!response.ok) throw new Error(`GitHub refused the installation token: ${response.status}`);
  const body = await response.json();
  const token = stringAt(body, "token");
  const expiresAt = stringAt(body, "expires_at");
  if (token === null || expiresAt === null)
    throw new Error("GitHub returned an installation token in an unknown shape.");
  return { token, expiresAt };
}

export function gitAuthArguments(token: string): string[] {
  const basic = Buffer.from(`x-access-token:${token}`).toString("base64");
  return ["-c", `http.https://github.com/.extraheader=AUTHORIZATION: basic ${basic}`];
}

export async function githubApi<T>(
  token: string,
  method: string,
  path: string,
  parse: (value: unknown) => T,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "estack",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`GitHub ${method} ${path}: ${response.status} ${text.slice(0, 300)}`);
  return parse(text === "" ? null : JSON.parse(text));
}

export const ignoreBody = (): null => null;
