// The GitHub App that the built-in GitHub connection signs in to.
//
// `bun scripts/create-github-app.ts` creates the app and prints its Client ID. A Client ID is
// public: device flow and refresh need nothing else, and the client secret never ships.

const GITHUB_APP_CLIENT_ID = "";
const GITHUB_APP_SLUG = "estackgit";

export interface GitHubAppConfig {
  clientId: string;
  slug: string;
}

/** The configured app, or null. `ESTACK_GITHUB_CLIENT_ID` and `ESTACK_GITHUB_APP_SLUG` override it. */
export function githubAppConfig(env: NodeJS.ProcessEnv = process.env): GitHubAppConfig | null {
  const clientId = env.ESTACK_GITHUB_CLIENT_ID?.trim() || GITHUB_APP_CLIENT_ID;
  const slug = env.ESTACK_GITHUB_APP_SLUG?.trim() || GITHUB_APP_SLUG;
  if (!/^[A-Za-z0-9.]+$/u.test(clientId) || !/^[a-z0-9-]+$/u.test(slug)) return null;
  return { clientId, slug };
}
