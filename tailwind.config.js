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
 * Warm, agricultural, mobile-first palette based on the TERRA visual direction.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /** Modern TERRA color scheme - sage green, golden yellow, coral, and dark brown */
        brand: {
          DEFAULT: "#ABC270",
          primary: "#ABC270",
          strong: "#8A9F5A",
          muted: "#E8EDE0",
          on: "#463C33", // text/icon colour on top of brand
        },

        /** Backgrounds - white to cream-ish */
        surface: {
          DEFAULT: "#FFFCF9",
          sunken: "#F5F3EE",
          raised: "#FFFFFF",
          inverse: "#463C33",
          disabled: "#EBE8E5",
        },

        /** Foreground / text - dark brown primary */
        ink: {
          DEFAULT: "#463C33",
          primary: "#463C33",
          secondary: "#6B5E52",
          muted: "#8A7F78",
          inverse: "#FFFEF8",
          disabled: "#B5AEA7",
          "on-brand": "#463C33",
        },

        /** Borders and dividers - minimal, subtle */
        outline: {
          DEFAULT: "#D9D4CE",
          subtle: "#EBE5DE",
          strong: "#C5BBB0",
          focus: "#ABC270",
        },

        /** Accents - golden yellow and coral */
        accent: {
          yellow: "#FEC868",
          coral: "#FDA769",
        },

        /** Status. Each has a fill, a tinted background, and a readable text tone. */
        danger: { DEFAULT: "#DA5A50", surface: "#F8E8E6", ink: "#6E231D" },
        warning: { DEFAULT: "#FEC868", surface: "#FEF5E8", ink: "#654511" },
        success: { DEFAULT: "#7CA86F", surface: "#E8EFE7", ink: "#314C38" },
        info: { DEFAULT: "#ABC270", surface: "#E8EDE0", ink: "#463C33" },
      },

      fontFamily: {
        primary: ["Hanken Grotesk", "system-ui", "sans-serif"],
      },

      /** Type scale. Used as text-heading-lg, text-body, text-label … */
      fontSize: {
        display: ["26px", { lineHeight: "32px", fontWeight: "800" }],
        "heading-lg": ["23px", { lineHeight: "29px", fontWeight: "700" }],
        "heading-md": ["19px", { lineHeight: "25px", fontWeight: "700" }],
        "heading-sm": ["16px", { lineHeight: "22px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        label: ["13px", { lineHeight: "18px", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
        numeric: ["26px", { lineHeight: "32px", fontWeight: "800" }],
      },

      /** Semantic spacing. Numeric utilities (p-4, gap-2) stay available for layout. */
      spacing: {
        tight: "4px",
        snug: "8px",
        gutter: "16px",
        section: "24px",
        page: "18px",
      },

      borderRadius: {
        control: "8px", // buttons, inputs
        card: "8px",
        sheet: "12px",
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
