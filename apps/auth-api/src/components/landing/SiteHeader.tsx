import { ESTACK_LINKS } from "../../lib/landing-links";
import { SiteLogoLink } from "../brand/SiteLogoLink";
import { Button, ButtonLink } from "../ui/button";
import { SiteLanguageMenu } from "./SiteLanguageMenu";
import { SiteMobileMenu } from "./SiteMobileMenu";
import { SiteNavigationMenu } from "./SiteNavigationMenu";
import { useSiteChrome } from "./SiteText";

export interface SiteHeaderProps {
  /**
   * The landing page has its own download section, so its button scrolls to it.
   * Every other page opens /download: there is no download section there for a
   * bare "#download" to find.
   */
  page: "landing" | "content";
}

// The one header of the public site. It keeps the `landing-header` class because
// analytics reads it to report a click as coming from the header.
export function SiteHeader(props: SiteHeaderProps) {
  const chrome = useSiteChrome();
  const text = () => chrome().text;
  const actions = () => (
    <>
      {props.page === "landing" ? (
        <Button href={ESTACK_LINKS.download} variant="primary" size="sm" icon="download">
          {text().download}
        </Button>
      ) : (
        <ButtonLink to="/download" variant="primary" size="sm" icon="download">
          {text().download}
        </ButtonLink>
      )}
      {/* A full page load: the /app route brings the desktop document styles, which stop the site page from
          scrolling. A preload on hover or a client-side visit would add them to this page. */}
      <ButtonLink
        to="/app"
        reloadDocument
        variant="secondary"
        size="sm"
        icon="arrow-right"
        class="landing-button-glass site-header-secondary"
      >
        {text().app}
      </ButtonLink>
    </>
  );

  return (
    <header class="landing-header" data-enter="header" lang={chrome().lang}>
      <SiteLogoLink />
      <SiteNavigationMenu />
      <div class="site-header-actions">
        <SiteLanguageMenu />
        {actions()}
        <SiteMobileMenu actions={() => actions()} />
      </div>
    </header>
  );
}
