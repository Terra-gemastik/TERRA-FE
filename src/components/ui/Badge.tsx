/**
 * Small status chip.
 *
 * PRD NF-03: status is never conveyed by colour alone. Every badge carries a
 * text label, and the optional icon is a second non-colour channel — so the
 * component stays readable under deuteranopia/protanopia. Keep that property
 * when reskinning: change the colours freely, do not drop the label.
 */

import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { Text, type NadaTeks } from "./Text";
import { WARNA } from "./tokens";

export type NadaBadge =
  | "neutral"
  | "brand"
  | "danger"
  | "warning"
  | "success"
  | "info";

const WADAH: Record<NadaBadge, string> = {
  neutral: "bg-surface-sunken border-outline",
  brand: "bg-brand-muted border-brand-primary",
  danger: "bg-danger-surface border-danger",
  warning: "bg-warning-surface border-warning",
  success: "bg-success-surface border-success",
  info: "bg-info-surface border-info",
};

const NADA_TEKS: Record<NadaBadge, NadaTeks> = {
  neutral: "secondary",
  brand: "brand",
  danger: "danger",
  warning: "warning",
  success: "success",
  info: "info",
};

const WARNA_IKON: Record<NadaBadge, string> = {
  neutral: WARNA.inkSecondary,
  brand: WARNA.brandPrimary,
  danger: WARNA.dangerInk,
  warning: WARNA.warningInk,
  success: WARNA.successInk,
  info: WARNA.infoInk,
};

export type BadgeProps = {
  label: string;
  tone?: NadaBadge;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
};

export function Badge({
  label,
  tone = "neutral",
  icon,
  className = "",
}: BadgeProps) {
  return (
    <View
      className={[
        "flex-row items-center self-start rounded-pill border-hairline px-snug py-tight",
        WADAH[tone],
        className,
      ].join(" ")}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={11}
          color={WARNA_IKON[tone]}
          style={{ marginRight: 4 }}
        />
      ) : null}
      <Text variant="caption" tone={NADA_TEKS[tone]}>
        {label}
      </Text>
    </View>
  );
}
