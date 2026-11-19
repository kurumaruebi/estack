import type { landingPageText } from "./landing-page-text";
import { type loadSitePage, SITE_OPEN_GRAPH_LOCALES } from "./site-locale";
import { ESTACK_SITE_URL, estackHomeHead, type HomePageHead } from "./site-metadata";
import { pagePaths, SITE_LOCALES, siteHreflang } from "./site-paths";
import { ESTACK_SOFTWARE_APPLICATION } from "./software-application";

/** What the loaders of `/`, `/pl` and `/pt` return: `loadSitePage(locale, landingPageText)`. */
type LandingPageData = Awaited<ReturnType<typeof loadSitePage<ReturnType<typeof landingPageText>>>>;

/**
 * The head of the home page. `path` is the address of this route; `/` shows the language of the
 * request, so its canonical address stays `/`, and the `hreflang` links name `/pl` for Polish and `/pt` for Portuguese.
 */
export function landingHead(siteUrl: string, path: string, data: LandingPageData | undefined) {
  if (!data) return { links: [{ rel: "canonical", href: new URL(path, ESTACK_SITE_URL).toString() }] };
  const locale = data.site.locale;
  const head: HomePageHead = {
    title: data.text.title,
    description: data.text.description,
    questions: data.text.faq.questions,
    path,
    openGraphLocale: SITE_OPEN_GRAPH_LOCALES[locale],
    alternates: SITE_LOCALES.map((alternate) => ({
      hreflang: siteHreflang(alternate),
      path: pagePaths("/")[alternate],
    })),
  };
  return estackHomeHead(ESTACK_SOFTWARE_APPLICATION, siteUrl, head);
}
