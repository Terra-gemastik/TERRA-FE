/**
 * Typography primitive.
 *
 * The ONLY place in the app allowed to name a font size or a text colour.
 * Screens say <Text variant="heading-md" tone="secondary">, never
 * className="text-lg text-gray-500".
 *
 * TO RESKIN: change the class strings in the two maps below, or the values
 * behind them in tailwind.config.js. Keep the variant/tone key names — screens
 * reference those.
 */

import { Text as RNText, type TextProps as RNTextProps } from "react-native";

export type VarianTeks =
  | "display"
  | "heading-lg"
  | "heading-md"
  | "heading-sm"
  | "body-lg"
  | "body"
  | "body-sm"
  | "label"
  | "caption"
  | "numeric";

export type NadaTeks =
  | "primary"
  | "secondary"
  | "muted"
  | "disabled"
  | "inverse"
  | "brand"
  | "danger"
  | "warning"
  | "success"
  | "info"
  | "on-brand";

const VARIAN: Record<VarianTeks, string> = {
  display: "text-display",
  "heading-lg": "text-heading-lg",
  "heading-md": "text-heading-md",
  "heading-sm": "text-heading-sm",
  "body-lg": "text-body-lg",
  body: "text-body",
  "body-sm": "text-body-sm",
  label: "text-label",
  caption: "text-caption",
  numeric: "text-numeric",
};

const NADA: Record<NadaTeks, string> = {
  primary: "text-ink-primary",
  secondary: "text-ink-secondary",
  muted: "text-ink-muted",
  disabled: "text-ink-disabled",
  inverse: "text-ink-inverse",
  brand: "text-brand-primary",
  danger: "text-danger-ink",
  warning: "text-warning-ink",
  success: "text-success-ink",
  info: "text-info-ink",
  "on-brand": "text-ink-on-brand",
};

export type TextProps = RNTextProps & {
  variant?: VarianTeks;
  tone?: NadaTeks;
  className?: string;
};

export function Text({
  variant = "body",
  tone = "primary",
  className = "",
  ...props
}: TextProps) {
  return (
    <RNText
      className={`font-primary ${VARIAN[variant]} ${NADA[tone]} ${className}`}
      {...props}
    />
  );
}
