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
  brandPrimary: "#ABC3C9",
  brandStrong: "#5F7F87",
  brandMuted: "#E7F0F1",
  accentBeige: "#CCBE9F",
  accentBeigeMuted: "#E9DDBE",

  surface: "#FFFCF6",
  surfaceSunken: "#FAF6EC",

  inkPrimary: "#382119",
  inkSecondary: "#6E5B4B",
  inkMuted: "#8A7B6B",
  inkDisabled: "#A99F92",
  inkInverse: "#FFFDF8",

  outline: "#D6CDBB",
  outlineSubtle: "#ECE5D8",

  danger: "#9D3B32",
  dangerInk: "#6E231D",
  warningInk: "#654511",
  successInk: "#314C38",
  infoInk: "#314F56",
} as const;

/** Navigation theme, so headers and tab bars follow the same tokens. */
export const temaNavigasi = {
  dark: false,
  colors: {
    primary: WARNA.brandStrong,
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
