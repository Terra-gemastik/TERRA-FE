/**
 * Raw token values, for the few APIs that cannot take a className.
 *
 * React Navigation's theme, `ActivityIndicator color`, `Ionicons color` and
 * `placeholderTextColor` all want a literal string. Rather than scatter hex
 * codes through the components, they all read from here.
 *
 * ⚠️ KEEP IN SYNC WITH tailwind.config.js. This is the one unavoidable
 * duplication in the design system — Tailwind's config is not readable from
 * app code at runtime without pulling the whole compiler in. If you reskin,
 * change both files. `npm run lint:tokens` cannot catch a mismatch here,
 * because these are legitimate literals in an exempt directory.
 */

export const WARNA = {
  brandPrimary: "#4A5D6E",
  brandStrong: "#37474F",
  brandMuted: "#E3E8EB",

  surface: "#FFFFFF",
  surfaceSunken: "#F4F5F6",

  inkPrimary: "#1B1F23",
  inkSecondary: "#5A6169",
  inkMuted: "#8B949C",
  inkDisabled: "#A8AEB4",
  inkInverse: "#FFFFFF",

  outline: "#D3D7DB",
  outlineSubtle: "#E8EAEC",

  danger: "#B3261E",
  dangerInk: "#8C1D18",
  warningInk: "#6B4B11",
  successInk: "#175134",
  infoInk: "#1F4568",
} as const;

/** Navigation theme, so headers and tab bars follow the same tokens. */
export const temaNavigasi = {
  dark: false,
  colors: {
    primary: WARNA.brandPrimary,
    background: WARNA.surfaceSunken,
    card: WARNA.surface,
    text: WARNA.inkPrimary,
    border: WARNA.outlineSubtle,
    notification: WARNA.danger,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" as const },
    medium: { fontFamily: "System", fontWeight: "500" as const },
    bold: { fontFamily: "System", fontWeight: "700" as const },
    heavy: { fontFamily: "System", fontWeight: "800" as const },
  },
};
