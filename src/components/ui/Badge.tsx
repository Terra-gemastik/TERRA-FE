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
  neutral: "bg-surface-sunken",
  brand: "bg-brand-muted",
  danger: "bg-danger-surface",
  warning: "bg-warning-surface",
  success: "bg-success-surface",
  info: "bg-info-surface",
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
  brand: WARNA.brandStrong,
  danger: WARNA.dangerInk,
  warning: WARNA.warningInk,
  success: WARNA.successInk,
  info: WARNA.infoInk,
};

const IKON_DEFAULT: Partial<Record<NadaBadge, keyof typeof Ionicons.glyphMap>> = {
  brand: "checkmark-circle-outline",
  danger: "alert-circle-outline",
  warning: "warning-outline",
  success: "checkmark-circle-outline",
  info: "information-circle-outline",
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
  const ikon = icon ?? IKON_DEFAULT[tone];

  return (
    <View
      className={[
        "flex-row items-center self-start rounded-pill px-snug py-tight",
        WADAH[tone],
        className,
      ].join(" ")}
    >
      {ikon ? (
        <Ionicons
          name={ikon}
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
