import { DEFAULT_APP_LANGUAGE } from "@estack/contracts/app-language";
import { loadLocale, resolveLocale } from "@estack/i18n";
import { createLazyFileRoute } from "@tanstack/solid-router";
import { createSignal, lazy, onSettled, Show } from "solid-js";

// The demo follows the visitor's language. Its catalogs load with the code, so the demo does not
// start in English; if they fail, the demo shows English. The route in `app-preview.tsx` links the
// app stylesheet.
const EstackPlayground = lazy(() =>
  Promise.all([
    import("@estack/renderer-preview"),
    loadLocale(resolveLocale(DEFAULT_APP_LANGUAGE, navigator.language)).catch(() => undefined),
  ]).then(([module]) => ({ default: module.EstackPlayground })),
);

export const Route = createLazyFileRoute("/app-preview")({ component: AppPreviewPage });

export function AppPreviewPage() {
  const [mounted, setMounted] = createSignal(false);
  onSettled(() => {
    setMounted(true);
  });

  return (
    <div id="root" class="estack-playground-root" data-preview-variant="landing">
      <Show
        when={mounted()}
        fallback={<div class="estack-playground-loading" role="status" aria-label="Loading estack preview" />}
      >
        <EstackPlayground variant="landing" />
      </Show>
    </div>
  );
}
