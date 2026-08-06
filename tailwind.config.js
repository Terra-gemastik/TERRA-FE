/**
 * ============================================================================
 * TERRA — DESIGN TOKENS.  THIS FILE IS THE RESKIN SURFACE.
 * ============================================================================
 *
 * Change the values here and the whole app changes. Nothing under src/screens,
 * src/api, src/navigation or src/hooks needs to be touched to reskin.
 *
 * THE RULE THAT MAKES THAT TRUE
 * -----------------------------
 * No file outside src/components/ui/ may use a raw Tailwind palette class
 * (bg-green-600, text-gray-500, text-lg, rounded-md …). Everything references
 * a SEMANTIC token defined below — bg-surface, text-ink-secondary,
 * text-heading-lg, rounded-card.
 *
 * This is enforced, not just requested:  npm run lint:tokens
 * It greps every file outside ui/ and fails on a single raw palette class.
 *
 * HOW TO RESKIN
 * -------------
 *   1. Replace the hex values in `colors`. Keep the key names.
 *   2. Adjust `fontSize` sizes/weights. Keep the key names.
 *   3. Adjust `borderRadius` / `spacing`. Keep the key names.
 *   4. If you want different component shapes (a pill button, a flatter card),
 *      edit src/components/ui/ — that is the other half of the reskin surface.
 *
 * Keeping the KEY NAMES is what keeps it a two-place edit. Renaming a token
 * means touching every screen that uses it.
 *
 * THE CURRENT PALETTE IS A PLACEHOLDER ON PURPOSE
 * -----------------------------------------------
 * Grey-leaning, one muted slate accent, system fonts, no illustrations. It is
 * meant to look unfinished so nobody grows attached to it before the designer
 * gets here.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /** Accent. One colour, deliberately muted. */
        brand: {
          DEFAULT: "#4A5D6E",
          primary: "#4A5D6E",
          strong: "#37474F",
          muted: "#E3E8EB",
          on: "#FFFFFF", // text/icon colour on top of brand
        },

        /** Backgrounds. */
        surface: {
          DEFAULT: "#FFFFFF",
          sunken: "#F4F5F6", // screen background behind cards
          raised: "#FFFFFF", // cards, sheets
          inverse: "#22282C",
          disabled: "#EDEEF0",
        },

        /** Foreground / text. "ink" rather than "text" so bg-ink-* also reads. */
        ink: {
          DEFAULT: "#1B1F23",
          primary: "#1B1F23",
          secondary: "#5A6169",
          muted: "#8B949C",
          inverse: "#FFFFFF",
          disabled: "#A8AEB4",
          "on-brand": "#FFFFFF",
        },

        /** Borders and dividers. */
        outline: {
          DEFAULT: "#D3D7DB",
          subtle: "#E8EAEC",
          strong: "#A8AEB4",
          focus: "#4A5D6E",
        },

        /** Status. Each has a fill, a tinted background, and a readable text tone. */
        danger: { DEFAULT: "#B3261E", surface: "#FBEAE9", ink: "#8C1D18" },
        warning: { DEFAULT: "#8A6116", surface: "#FCF3E2", ink: "#6B4B11" },
        success: { DEFAULT: "#1F6B45", surface: "#E7F3ED", ink: "#175134" },
        info: { DEFAULT: "#2B5C8A", surface: "#E9F0F7", ink: "#1F4568" },
      },

      /** Type scale. Used as text-heading-lg, text-body, text-label … */
      fontSize: {
        display: ["30px", { lineHeight: "36px", fontWeight: "700" }],
        "heading-lg": ["22px", { lineHeight: "28px", fontWeight: "700" }],
        "heading-md": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "heading-sm": ["15px", { lineHeight: "20px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        label: ["12px", { lineHeight: "16px", fontWeight: "600" }],
        caption: ["11px", { lineHeight: "14px", fontWeight: "400" }],
        numeric: ["26px", { lineHeight: "32px", fontWeight: "700" }],
      },

      /** Semantic spacing. Numeric utilities (p-4, gap-2) stay available for layout. */
      spacing: {
        tight: "4px",
        snug: "8px",
        gutter: "16px",
        section: "24px",
        page: "20px",
      },

      borderRadius: {
        control: "8px", // buttons, inputs
        card: "12px",
        sheet: "16px",
        pill: "999px",
      },

      borderWidth: {
        hairline: "1px",
        thick: "2px",
      },
    },
  },
  plugins: [],
};
