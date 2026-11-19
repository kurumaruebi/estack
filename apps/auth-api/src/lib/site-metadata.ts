// No Vite-only import belongs in this file. `vite.config.ts` reads it, through the
// news artwork generator, while plain Node loads the config, and Node cannot
// resolve an `?url` specifier. That is why the font asset arrives as an argument
// from the root route instead of as an import here.

import { faqStructuredData, type LandingQuestion } from "./landing-faq";
import { ESTACK_ALTERNATE_DOWNLOAD_LINKS, ESTACK_DOWNLOAD_LINKS, ESTACK_LINKS } from "./landing-links";

export const ESTACK_SITE_URL = "https://estack.invalid/";
export const ESTACK_SITE_TITLE = "estack: Run a team of AI agents on your computer";
export const ESTACK_SITE_DESCRIPTION =
  "A free desktop app that runs AI agents as a team on your own computer, with the ChatGPT, Claude, Gemini or Grok plan you already pay for, or your own model.";
export const ESTACK_SOCIAL_IMAGE_URL = `${ESTACK_SITE_URL}estack-social.png`;
/** The account `ESTACK_LINKS.x` opens, which a shared card names. */
export const ESTACK_X_HANDLE = "@estack.invalid";
const ESTACK_X_URL = "https://x.com/estack.invalid";
const ESTACK_REPOSITORY_URL = "https://github.com/kurumaruebi/estack";
const ESTACK_PRODUCT_HUNT_URL = "https://www.producthunt.com/products/estack-3";
const ESTACK_LICENSE_URL = "https://polyformproject.org/licenses/noncommercial/1.0.0/";
// One id for each entity, so that every page describes the same organization,
// site and app, and an assistant can join what the pages say about each.
const ESTACK_ORGANIZATION_ID = `${ESTACK_SITE_URL}#organization`;
const ESTACK_WEBSITE_ID = `${ESTACK_SITE_URL}#website`;
const ESTACK_APPLICATION_ID = `${ESTACK_SITE_URL}#app`;
/** Square, as schema.org wants for a publisher logo. */
export const ESTACK_LOGO_URL = `${ESTACK_SITE_URL}icon-512x512.png`;
export const ESTACK_SOCIAL_IMAGE_ALT = "Meet estack on a dark grid background";

/** The Open Graph tags of the site's own social card, which is 1600x900. */
export const ESTACK_SOCIAL_IMAGE_META = [
  { property: "og:image", content: ESTACK_SOCIAL_IMAGE_URL },
  { property: "og:image:type", content: "image/png" },
  { property: "og:image:width", content: "1600" },
  { property: "og:image:height", content: "900" },
  { property: "og:image:alt", content: ESTACK_SOCIAL_IMAGE_ALT },
] as const;

/** The site's card in the shape of `pageSocialImageMeta`, for a page that can have either. */
export const ESTACK_SOCIAL_IMAGE_TAGS = {
  openGraph: ESTACK_SOCIAL_IMAGE_META,
  twitter: [
    { name: "twitter:image", content: ESTACK_SOCIAL_IMAGE_URL },
    { name: "twitter:image:alt", content: ESTACK_SOCIAL_IMAGE_ALT },
  ],
} as const;

/** A page's own social card: a 1600x900 JPEG in `public/social/`, the size of the site's card. */
export interface PageSocialImage {
  /** The path from the site root, for example `/social/teams.jpg`. */
  path: string;
  alt: string;
}

/** The card of the terms, the privacy policy and the DPA. */
export const ESTACK_LEGAL_SOCIAL_IMAGE: PageSocialImage = {
  path: "/social/legal.jpg",
  alt: "Plain terms. No surprises. estack agents beside a paper map",
};

/**
 * The Open Graph and X tags of a page's own social card. The image URL uses the site that
 * serves the page, so a pull-request preview names an image that it has.
 */
export function pageSocialImageMeta(image: PageSocialImage, siteUrl: string) {
  const url = new URL(image.path, siteUrl).toString();
  return {
    openGraph: [
      { property: "og:image", content: url },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1600" },
      { property: "og:image:height", content: "900" },
      { property: "og:image:alt", content: image.alt },
    ],
    twitter: [
      { name: "twitter:image", content: url },
      { name: "twitter:image:alt", content: image.alt },
    ],
  } as const;
}

// The hosts production answers on. Both serve the same pages, and those pages go by
// estack.invalid.
const ESTACK_PRODUCTION_HOSTS = new Set(["estack.invalid", "api.estack.invalid"]);

/**
 * The site that the head tags of a page served at `pageUrl` name. Social sites fetch
 * `og:url` and `og:image` themselves and show no card when those answer 404. A
 * pull-request preview serves pages and images that estack.invalid does not have yet,
 * so any host other than production names itself. Cloudflare marks preview URLs
 * `noindex`, so a preview canonical does not compete with production.
 */
export function siteUrlForPage(pageUrl: URL): string {
  return ESTACK_PRODUCTION_HOSTS.has(pageUrl.hostname) ? ESTACK_SITE_URL : `${pageUrl.origin}/`;
}

/** What the app's structured data names and that this file can not import: see the note at the top. */
export interface EstackApplicationFacts {
  /** The version of the newest release. */
  version: string;
  /** An absolute URL of a picture of the app. */
  screenshot: string;
}

export function estackSoftwareApplication(facts: EstackApplicationFacts) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": ESTACK_APPLICATION_ID,
    name: "estack",
    url: ESTACK_SITE_URL,
    image: ESTACK_SOCIAL_IMAGE_URL,
    description: ESTACK_SITE_DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "AI agent app",
    operatingSystem: [
      "macOS 13 or later (Apple silicon or Intel)",
      "Windows 10 or later (x64)",
      "Linux (x64 or arm64)",
    ],
    // The installers themselves: schema.org's `downloadUrl` is the file, not a page about it.
    downloadUrl: [
      ESTACK_DOWNLOAD_LINKS.macos,
      ESTACK_ALTERNATE_DOWNLOAD_LINKS.macos,
      ESTACK_DOWNLOAD_LINKS.windows,
      ESTACK_DOWNLOAD_LINKS.linux,
      ESTACK_ALTERNATE_DOWNLOAD_LINKS.linux,
    ].map((path) => new URL(path, ESTACK_SITE_URL).toString()),
    // What people ask an assistant for. Keep it to what the released app does.
    featureList: [
      "Runs Codex, Claude Code, Gemini (Antigravity), Grok and OpenCode agents",
      "Uses your ChatGPT, Claude, Google AI Pro or Ultra, or Grok plan",
      "Any OpenAI-compatible model server, also one on your own computer",
      "Agents that work as a team and keep their workspace and history",
      "Chats, files and workspaces stay on your computer",
      "iPhone and Android apps that connect to your own computer",
      "Free for noncommercial use",
    ],
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    softwareVersion: facts.version,
    screenshot: facts.screenshot,
    license: ESTACK_LICENSE_URL,
    publisher: { "@id": ESTACK_ORGANIZATION_ID },
    sameAs: [ESTACK_REPOSITORY_URL, ESTACK_PRODUCT_HUNT_URL],
  } as const;
}

export type EstackSoftwareApplication = ReturnType<typeof estackSoftwareApplication>;

// Search engines read these two for the site name and the logo next to a result.
const ESTACK_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ESTACK_ORGANIZATION_ID,
  name: "estack",
  url: ESTACK_SITE_URL,
  logo: ESTACK_LOGO_URL,
  sameAs: [
    ESTACK_REPOSITORY_URL,
    ESTACK_X_URL,
    ESTACK_LINKS.threads,
    ESTACK_LINKS.linkedin,
    ESTACK_LINKS.reddit,
    ESTACK_LINKS.instagram,
    ESTACK_LINKS.tiktok,
    ESTACK_LINKS.facebook,
    ESTACK_PRODUCT_HUNT_URL,
  ],
} as const;

const ESTACK_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": ESTACK_WEBSITE_ID,
  name: "estack",
  url: ESTACK_SITE_URL,
  publisher: { "@id": ESTACK_ORGANIZATION_ID },
} as const;

export const ESTACK_SECURITY_HEADERS = {
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
} as const;

/**
 * @param interLatinFont The hashed URL of Inter's upright latin range, the one font
 * file this site downloads. It is reached through two levels of CSS `@import`, so a
 * browser only learns of it after the stylesheet has parsed. That is late enough
 * that the first paint uses a fallback face and every line of text moves when Inter
 * replaces it. The caller passes the same hashed asset the `@font-face` rule asks
 * for, so the preload below is that request and not a second one.
 */
export function estackRootHead(interLatinFont: string) {
  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: ESTACK_SITE_TITLE },
      { name: "description", content: ESTACK_SITE_DESCRIPTION },
      { name: "application-name", content: "estack" },
      { name: "color-scheme", content: "dark" },
      { name: "theme-color", content: "#1a1a1a" },
    ],
    links: [
      {
        rel: "preload",
        as: "font" as const,
        type: "font/woff2",
        href: interLatinFont,
        crossorigin: "anonymous" as const,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  };
}

/** The home page's own social card. Other pages without a card of their own keep the site's card. */
const ESTACK_HOME_SOCIAL_IMAGE: PageSocialImage = {
  path: "/social/home.jpg",
  alt: "Models come and go. Your team stays. estack agents on a paper planet",
};

/** The text and the address of the home page in one language. */
export interface HomePageHead {
  title: string;
  description: string;
  questions: readonly LandingQuestion[];
  /** The path of this language's home page, such as `/`, `/pl` or `/pt`. */
  path: string;
  openGraphLocale: string;
  /** The home page in each language, for `hreflang` links. The first is also `x-default`. */
  alternates: readonly { hreflang: string; path: string }[];
}

export function estackHomeHead(application: EstackSoftwareApplication, siteUrl: string, page: HomePageHead) {
  const image = pageSocialImageMeta(ESTACK_HOME_SOCIAL_IMAGE, siteUrl);
  const url = new URL(page.path, ESTACK_SITE_URL).toString();
  const [fallback] = page.alternates;
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { "script:ld+json": application },
      { "script:ld+json": ESTACK_ORGANIZATION },
      { "script:ld+json": ESTACK_WEBSITE },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "estack" },
      { property: "og:locale", content: page.openGraphLocale },
      { property: "og:url", content: url },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      ...image.openGraph,
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: ESTACK_X_HANDLE },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      ...image.twitter,
      { "script:ld+json": faqStructuredData(page.questions) },
    ],
    links: [
      { rel: "canonical", href: url },
      ...page.alternates.map((alternate) => ({
        rel: "alternate",
        hreflang: alternate.hreflang,
        href: new URL(alternate.path, ESTACK_SITE_URL).toString(),
      })),
      ...(fallback
        ? [{ rel: "alternate", hreflang: "x-default", href: new URL(fallback.path, ESTACK_SITE_URL).toString() }]
        : []),
    ],
  };
}
