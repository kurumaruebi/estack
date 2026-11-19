import type { AppThemePalette } from "@estack/contracts/app-appearance";

/** `color-mix` of one palette color into transparency, as the base palettes use translucent ink. */
function clear(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function mix(color: string, other: string, percent: number): string {
  return `color-mix(in srgb, ${color}, ${other} ${percent}%)`;
}

/**
 * The tokens that a palette sets, over the light or dark palette that its scheme names. A palette
 * gives twelve colors; the other tokens of each family come from them, as the base palettes make
 * their hover, soft and strong steps from one color. Tokens not listed here keep the base value:
 * illustrations, provider logos, charts and the file colors stay as they are in each scheme.
 *
 * Cards, sheets and controls are a step above the canvas: lighter than it in both base palettes. A
 * dark palette gives that step as `surface`. A light theme has no color lighter than its background
 * (Catppuccin Latte's `surface` is darker), so a light palette makes the step from its canvas and
 * white, as the base light palette is white over a grey canvas, and uses `surface` for the tab bar.
 */
function paletteTokens({ scheme, colors }: AppThemePalette): Record<string, string> {
  const raised = scheme === "light" ? mix(colors.canvas, "#ffffff", 70) : colors.surface;
  const tabsBar = scheme === "light" ? mix(colors.canvas, colors.surface, 30) : colors.surface;
  return {
    "--estack-bg-canvas": colors.canvas,
    "--estack-bg-canvas-clear": clear(colors.canvas, 0),
    "--estack-bg-frame": colors.frame,
    "--estack-bg-sidebar": colors.sidebar,
    "--estack-bg-native-sidebar": colors.sidebar,
    "--estack-bg-sheet": raised,
    "--estack-bg-sheet-inset": colors.frame,
    "--estack-bg-grouped": raised,
    "--estack-bg-surface": raised,
    "--estack-bg-surface-raised": mix(raised, colors.text, 3),
    "--estack-bg-control": raised,
    "--estack-bg-control-hover": mix(raised, colors.text, 4),
    "--estack-bg-control-active": mix(raised, colors.text, 8),
    "--estack-tabs-bar-bg": tabsBar,
    "--estack-tabs-pill-bg": scheme === "light" ? raised : mix(colors.surface, colors.text, 8),
    "--estack-marketplace-detail-bg": colors.frame,
    "--estack-bg-overlay": clear(colors.canvas, 92),
    "--estack-bg-glass": clear(raised, 76),
    "--estack-scroll-edge-overlay": clear(colors.canvas, 72),

    "--estack-border": clear(colors.border, 35),
    "--estack-border-strong": clear(colors.border, 50),
    "--estack-border-grouped": colors.border,
    "--estack-dialog-ring": clear(colors.border, 70),
    "--estack-image-outline": clear(colors.border, 60),
    "--estack-hover": clear(colors.text, 5),

    "--estack-text-primary": colors.text,
    "--estack-text-secondary": mix(colors.text, colors.textMuted, 25),
    "--estack-text-muted": colors.textMuted,
    "--estack-text-dim": mix(colors.textMuted, colors.canvas, 30),
    "--estack-text-placeholder": colors.textMuted,
    "--estack-text-readable": colors.textMuted,
    "--estack-text-grouped-secondary": colors.textMuted,
    "--estack-settings-text-muted": colors.textMuted,

    // The inverted element (the default button, a checked switch, the user's bubble) is the text
    // color on the canvas, as it is in both base palettes.
    "--estack-surface-light": colors.text,
    "--estack-text-on-light": colors.canvas,
    "--estack-text-muted-on-light": clear(colors.canvas, 64),
    "--estack-text-dim-on-light": clear(colors.canvas, 40),
    "--estack-border-on-light": clear(colors.canvas, 16),

    "--estack-accent": colors.accent,
    "--estack-accent-hover": mix(colors.accent, colors.text, 15),
    "--estack-accent-text": colors.accent,
    "--estack-accent-soft": clear(colors.accent, 16),
    "--estack-accent-strong": clear(colors.accent, 34),
    "--estack-text-on-accent": colors.accentForeground,

    "--estack-success": colors.success,
    "--estack-success-text": colors.success,
    "--estack-success-soft": clear(colors.success, 14),
    "--estack-success-wash": clear(colors.success, 6),
    "--estack-warning": colors.warning,
    "--estack-warning-text": colors.warning,
    "--estack-warning-soft": clear(colors.warning, 14),
    "--estack-danger": colors.danger,
    "--estack-danger-hover": mix(colors.danger, colors.text, 15),
    "--estack-danger-text": colors.danger,
    "--estack-danger-soft": clear(colors.danger, 14),
    "--estack-danger-soft-hover": clear(colors.danger, 22),
    "--estack-danger-focus": clear(colors.danger, 36),
    "--estack-danger-border": clear(colors.danger, 45),
  };
}

let applied: string[] = [];

/**
 * Sets the palette tokens on the root element, or removes them for null. Inline properties on the
 * root win over `tokens.css` and `tokens-light.css`, so the base palette shows again once they go.
 * The preload let only hex colors through, so each value is a color or a `color-mix` of colors.
 */
export function applyThemePalette(palette: AppThemePalette | null): void {
  const style = document.documentElement.style;
  for (const name of applied) style.removeProperty(name);
  applied = [];
  if (palette === null) return;
  for (const [name, value] of Object.entries(paletteTokens(palette))) {
    style.setProperty(name, value);
    applied.push(name);
  }
}
