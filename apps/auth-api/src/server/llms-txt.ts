// `/llms.txt` (llmstxt.org): the site as one short Markdown file, for an assistant
// that answers a question about estack. Built from the same registries as the
// sitemap, so a new article or comparison is in it with no edit here.

import { COMPARISONS } from "../content/compare";
import { ESTACK_PLANS } from "../content/compare/comparison";
import { PROVIDER_PAGES } from "../content/providers";
import { ANDROID_APK_AVAILABLE } from "../lib/android-apk";
import { CHANGELOG_DESCRIPTION, changelogUrl } from "../lib/changelog";
import { CONTENT_COLLECTIONS } from "../lib/content";
import { articleUrl, type CollectionId, collectionIndexUrl } from "../lib/content-collection";
import {
  ESTACK_ALTERNATE_DOWNLOAD_LINKS,
  ESTACK_ANDROID_APK_LINK,
  ESTACK_DOWNLOAD_LINKS,
  ESTACK_DOWNLOAD_PAGE_LINKS,
  ESTACK_LINKS,
} from "../lib/landing-links";
import { PLUGINS_DESCRIPTION, pluginIndexUrl } from "../lib/plugins";
import { ESTACK_SITE_DESCRIPTION, ESTACK_SITE_URL } from "../lib/site-metadata";
import { FEED_CACHE_CONTROL } from "./content-feed";

/** The one-sentence answer of a page drawn from data. A prose article has none, and uses its description. */
function referenceAnswer(collection: CollectionId, slug: string): string | undefined {
  if (collection === "compare") return COMPARISONS[slug]?.answer;
  if (collection === "providers") return PROVIDER_PAGES[slug]?.answer;
  return undefined;
}

function absolute(path: string): string {
  return new URL(path, ESTACK_SITE_URL).href;
}

function llmsTxt(): string {
  const lines = [
    "# estack",
    "",
    `> ${ESTACK_SITE_DESCRIPTION}`,
    "",
    "estack is a desktop app for macOS, Windows and Linux. Each agent has its own workspace, thread and history, and keeps them when you change its provider or restart the app. Agents can give work to other agents, and can move to a backup model on another provider when a plan reaches its limit. Agents also answer in Slack, Discord and Telegram. Chats, files and workspaces stay on your computer; estack has no server that holds them. The app is free for noncommercial use. iPhone and Android apps connect to estack on your own computer.",
    "",
    `Each article below also has its text as Markdown, at its URL with \`.md\` added. [llms-full.txt](${absolute("/llms-full.txt")}) holds all of them in one file.`,
    "",
    "## Models and plans",
    "",
    "estack sells no model. Each agent uses a plan or a key you already have:",
    "",
    ...ESTACK_PLANS.map((plan) => `- ${plan.name}: ${plan.plan}`),
    "",
    "## Download",
    "",
    `System requirements and install steps: [macOS](${absolute(ESTACK_DOWNLOAD_PAGE_LINKS.macos)}), [Windows](${absolute(ESTACK_DOWNLOAD_PAGE_LINKS.windows)}), [Linux](${absolute(ESTACK_DOWNLOAD_PAGE_LINKS.linux)}), [iPhone](${absolute(ESTACK_DOWNLOAD_PAGE_LINKS.ios)}), [Android](${absolute(ESTACK_DOWNLOAD_PAGE_LINKS.android)}).`,
    "",
    `- [macOS](${absolute(ESTACK_DOWNLOAD_LINKS.macos)}): macOS 13 or later, Apple silicon`,
    `- [macOS for Intel](${absolute(ESTACK_ALTERNATE_DOWNLOAD_LINKS.macos)}): macOS 13 or later, Intel`,
    `- [Windows](${absolute(ESTACK_DOWNLOAD_LINKS.windows)}): Windows 10 or later, x64`,
    `- [Linux](${absolute(ESTACK_DOWNLOAD_LINKS.linux)}): x64 AppImage`,
    `- [Linux for arm64](${absolute(ESTACK_ALTERNATE_DOWNLOAD_LINKS.linux)}): arm64 AppImage`,
    ...(ANDROID_APK_AVAILABLE
      ? [`- [Android APK](${absolute(ESTACK_ANDROID_APK_LINK)}): Android 7.0 or later, for a phone with no Google Play`]
      : []),
    `- [Source code](${ESTACK_LINKS.repository}): PolyForm Noncommercial 1.0.0`,
    "",
  ];

  for (const collection of CONTENT_COLLECTIONS) {
    lines.push(
      `## ${collection.name}`,
      "",
      `${collection.indexDescription} [All](${collectionIndexUrl(collection)})`,
      "",
    );
    for (const article of collection.articles) {
      const answer = referenceAnswer(collection.id, article.slug);
      lines.push(`- [${article.title}](${articleUrl(collection, article.slug)}): ${answer ?? article.description}`);
    }
    lines.push("");
  }

  lines.push(
    "## Optional",
    "",
    `- [Marketplace apps](${pluginIndexUrl()}): ${PLUGINS_DESCRIPTION}`,
    `- [Changelog](${changelogUrl()}): ${CHANGELOG_DESCRIPTION}`,
    "",
  );
  return lines.join("\n");
}

export function llmsTxtResponse(): Response {
  return new Response(llmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": FEED_CACHE_CONTROL,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
