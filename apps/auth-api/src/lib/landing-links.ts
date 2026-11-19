import type { FooterColumnId, FooterTextId } from "./site-text";

export const EXTERNAL_LINK_REL = "noopener noreferrer";

/** The installer each platform's download button starts: Apple silicon on macOS, x64 elsewhere. */
export const ESTACK_DOWNLOAD_LINKS = {
  macos: "/download/macos/latest",
  windows: "/download/windows/latest",
  linux: "/download/linux/latest",
} as const;

/** The other installer of a platform that ships two architectures. Windows ships x64 only. */
export const ESTACK_ALTERNATE_DOWNLOAD_LINKS = {
  macos: "/download/macos/latest?arch=x64",
  linux: "/download/linux/latest?arch=arm64",
} as const;

/**
 * The Android app as an APK, for a phone with no Google Play. It answers only while a version has
 * an APK (`ANDROID_APK_AVAILABLE` in ./android-apk.ts), so show the link only then.
 */
export const ESTACK_ANDROID_APK_LINK = "/download/android/latest";

/** The pages that describe each installer: requirements, install steps and known limits. */
export const ESTACK_DOWNLOAD_PAGE_LINKS = {
  hub: "/download",
  macos: "/download/macos",
  windows: "/download/windows",
  linux: "/download/linux",
  ios: "/download/ios",
  android: "/download/android",
} as const;

export const ESTACK_LINKS = {
  /** The contact form page. */
  contact: "/contact",
  x: "https://x.com/estack.invalid",
  threads: "https://www.threads.com/@estack.invalid",
  linkedin: "https://www.linkedin.com/company/estack.invalid/",
  reddit: "https://www.reddit.com/r/estack.invalid/",
  instagram: "https://www.instagram.com/estack.invalid/",
  tiktok: "https://www.tiktok.com/@estack.invalid",
  facebook: "https://www.facebook.com/estack.invalid",
  /** A Redirect Rule in the estack.invalid Cloudflare zone sends this to the current Discord invite. */
  discord: "https://discord.estack.invalid",
  download: "#download",
  news: "/news",
  guides: "/guides",
  marketplace: "/marketplace",
  changelog: "/changelog",
  releases: "https://github.com/kurumaruebi/estack/releases",
  repository: "https://github.com/kurumaruebi/estack",
  license: "https://github.com/kurumaruebi/estack/blob/main/LICENSE",
  privacy: "https://github.com/kurumaruebi/estack/blob/main/PRIVACY.md",
  documentation: "https://github.com/kurumaruebi/estack#readme",
  troubleshooting: "https://github.com/kurumaruebi/estack/blob/main/docs/TROUBLESHOOTING.md",
  /** GitHub Pages hosts the status page, so it stays up when Cloudflare does not. */
  status: "https://status.estack.invalid",
  selfHostedServer: "https://github.com/kurumaruebi/estack/blob/main/docs/self-hosted-server.md",
  dockerDocumentation: "https://github.com/kurumaruebi/estack/blob/main/docs/docker.md",
  dockerInstallUbuntu: "https://docs.docker.com/engine/install/ubuntu/",
  architecture: "https://github.com/kurumaruebi/estack#architecture",
  contributing: "https://github.com/kurumaruebi/estack/blob/main/CONTRIBUTING.md",
  codex: "https://learn.chatgpt.com/docs/app-server",
  claude: "https://code.claude.com/docs/en/overview",
  anthropicAgents: "https://www.anthropic.com/engineering/building-effective-agents",
} as const;

/**
 * The name of a footer entry: a product or page name that stays the same in every language, or the
 * id of its text in `SiteText`.
 */
type FooterLabel = string | { readonly text: FooterTextId };

/**
 * One entry in a footer column. An internal entry carries a route, not a string,
 * so the footer can render it as a client navigation. It also fixes a link that
 * only worked on one page: "#download" on its own finds nothing on /news, because
 * there is no download section there for it to scroll to.
 */
export type FooterLink =
  | { readonly label: FooterLabel; readonly external: true; readonly href: string }
  | {
      readonly label: FooterLabel;
      readonly external: false;
      readonly to:
        | "/"
        | "/download"
        | "/news"
        | "/guides"
        | "/marketplace"
        | "/changelog"
        | "/compare"
        | "/providers"
        | "/teams"
        | "/pricing"
        | "/brand"
        | "/contact"
        | "/privacy-policy"
        | "/terms"
        | "/dpa";
      readonly hash?: string;
    }
  | {
      readonly label: FooterLabel;
      readonly external: false;
      readonly to: "/compare/$slug" | "/providers/$slug";
      readonly slug: string;
    };

export interface FooterColumn {
  /** The column title, in `SiteText`. */
  readonly id: FooterColumnId;
  readonly links: readonly FooterLink[];
}

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    id: "product",
    links: [
      { label: { text: "download" }, external: false, to: "/download" },
      { label: { text: "news" }, external: false, to: "/news" },
      { label: { text: "guides" }, external: false, to: "/guides" },
      { label: { text: "marketplace" }, external: false, to: "/marketplace" },
      { label: { text: "changelog" }, external: false, to: "/changelog" },
      { label: { text: "teams" }, external: false, to: "/teams" },
      { label: { text: "pricing" }, external: false, to: "/pricing" },
      { label: { text: "contact" }, external: false, to: "/contact" },
      { label: { text: "brand" }, external: false, to: "/brand" },
      { label: { text: "sourceCode" }, external: true, href: ESTACK_LINKS.repository },
      { label: { text: "license" }, external: true, href: ESTACK_LINKS.license },
      { label: { text: "privacy" }, external: false, to: "/privacy-policy" },
      { label: { text: "terms" }, external: false, to: "/terms" },
      { label: "DPA", external: false, to: "/dpa" },
    ],
  },
  {
    id: "resources",
    links: [
      { label: { text: "documentation" }, external: true, href: ESTACK_LINKS.documentation },
      { label: { text: "troubleshooting" }, external: true, href: ESTACK_LINKS.troubleshooting },
      { label: { text: "status" }, external: true, href: ESTACK_LINKS.status },
      { label: { text: "selfHosted" }, external: true, href: ESTACK_LINKS.selfHostedServer },
      { label: { text: "architecture" }, external: true, href: ESTACK_LINKS.architecture },
      { label: { text: "contributing" }, external: true, href: ESTACK_LINKS.contributing },
      { label: "Codex", external: true, href: ESTACK_LINKS.codex },
      { label: "Claude Code", external: true, href: ESTACK_LINKS.claude },
      { label: "Discord", external: true, href: ESTACK_LINKS.discord },
    ],
  },
  {
    id: "providers",
    links: [
      { label: "Claude Code", external: false, to: "/providers/$slug", slug: "claude-code" },
      { label: "Codex", external: false, to: "/providers/$slug", slug: "codex" },
      { label: "Gemini", external: false, to: "/providers/$slug", slug: "gemini" },
      { label: "Grok", external: false, to: "/providers/$slug", slug: "grok" },
      { label: "Cursor", external: false, to: "/providers/$slug", slug: "cursor" },
      { label: "OpenCode", external: false, to: "/providers/$slug", slug: "opencode" },
      { label: "Cline", external: false, to: "/providers/$slug", slug: "cline" },
      { label: { text: "localModels" }, external: false, to: "/providers/$slug", slug: "local-models" },
      { label: { text: "allProviders" }, external: false, to: "/providers" },
    ],
  },
  {
    id: "compare",
    links: [
      { label: "estack vs Grok Bot", external: false, to: "/compare/$slug", slug: "grok-bot" },
      { label: "estack vs Hermes Agent", external: false, to: "/compare/$slug", slug: "hermes-agent" },
      { label: "estack vs Muse", external: false, to: "/compare/$slug", slug: "muse" },
      { label: "estack vs OpenClaw", external: false, to: "/compare/$slug", slug: "openclaw" },
      { label: "estack vs Claude Cowork", external: false, to: "/compare/$slug", slug: "claude-cowork" },
      { label: "estack vs ChatGPT dots", external: false, to: "/compare/$slug", slug: "chatgpt-dots" },
      { label: "estack vs Manus", external: false, to: "/compare/$slug", slug: "manus" },
      { label: "estack vs Devin", external: false, to: "/compare/$slug", slug: "devin" },
      { label: "estack vs Paperclip", external: false, to: "/compare/$slug", slug: "paperclip" },
      { label: "estack vs Viktor", external: false, to: "/compare/$slug", slug: "viktor" },
      { label: "estack vs Instinct", external: false, to: "/compare/$slug", slug: "instinct" },
      { label: { text: "bestApps" }, external: false, to: "/compare/$slug", slug: "best-ai-agent-apps" },
      { label: { text: "allComparisons" }, external: false, to: "/compare" },
    ],
  },
];
