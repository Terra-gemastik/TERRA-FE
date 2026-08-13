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
  brandPrimary: "#ABC270",
  brandStrong: "#8A9F5A",
  brandMuted: "#E8EDE0",
  accentYellow: "#FEC868",
  accentCoral: "#FDA769",

  surface: "#FFFCF9",
  surfaceSunken: "#FAFBF8",

  inkPrimary: "#463C33",
  inkSecondary: "#6B5E52",
  inkMuted: "#8A7F78",
  inkDisabled: "#B5AEA7",
  inkInverse: "#FFFEF8",

  outline: "#D9D4CE",
  outlineSubtle: "#EBE5DE",

  danger: "#DA5A50",
  dangerInk: "#6E231D",
  warningInk: "#654511",
  successInk: "#314C38",
  infoInk: "#463C33",
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
    regular: { fontFamily: "Hanken Grotesk", fontWeight: "400" as const },
    medium: { fontFamily: "Hanken Grotesk", fontWeight: "500" as const },
    bold: { fontFamily: "Hanken Grotesk", fontWeight: "700" as const },
    heavy: { fontFamily: "Hanken Grotesk", fontWeight: "800" as const },
  },
};
