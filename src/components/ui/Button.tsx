/**
 * Button. Four intents, two sizes, a loading state.
 *
 * TO RESKIN: edit the class maps below. Every screen's buttons follow.
 */

import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";

import { MotionPressable } from "./MotionPressable";
import { Text, type NadaTeks } from "./Text";
import { WARNA } from "./tokens";

export type VarianTombol = "primary" | "secondary" | "ghost" | "danger";
export type UkuranTombol = "md" | "sm";

const WADAH: Record<VarianTombol, string> = {
  primary: "bg-surface-inverse border-thick border-surface-inverse",
  secondary: "bg-surface border-hairline border-outline",
  ghost: "bg-transparent border-hairline border-transparent",
  danger: "bg-danger border-hairline border-danger",
};

const WADAH_NONAKTIF: Record<VarianTombol, string> = {
  primary: "bg-surface-disabled border-hairline border-outline-subtle",
  secondary: "bg-surface-disabled border-hairline border-outline-subtle",
  ghost: "bg-transparent border-hairline border-transparent",
  danger: "bg-surface-disabled border-hairline border-outline-subtle",
};

const NADA_LABEL: Record<VarianTombol, NadaTeks> = {
  primary: "inverse",
  secondary: "primary",
  ghost: "brand",
  danger: "inverse",
};

/** Icons take a colour prop, not a className — values come from tokens.ts. */
const WARNA_IKON: Record<VarianTombol, string> = {
  primary: WARNA.inkInverse,
  secondary: WARNA.inkPrimary,
  ghost: WARNA.brandStrong,
  danger: WARNA.inkInverse,
};

const UKURAN: Record<UkuranTombol, string> = {
  md: "px-gutter py-3",
  sm: "px-snug py-2",
};

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: VarianTombol;
  size?: UkuranTombol;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  className = "",
}: ButtonProps) {
  const mati = disabled || loading;

  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: mati, busy: loading }}
      accessibilityLabel={label}
      disabled={mati}
      onPress={onPress}
      className={[
        "min-h-12 flex-row items-center justify-center rounded-control",
        UKURAN[size],
        mati ? WADAH_NONAKTIF[variant] : WADAH[variant],
        fullWidth ? "w-full" : "self-start",
        className,
      ].join(" ")}
    >
      {loading ? (
        <ActivityIndicator size="small" color={WARNA_IKON[variant]} accessibilityLabel="Memuat" />
      ) : (
        <View className="flex-row items-center">
          {icon ? (
            <Ionicons
              name={icon}
              size={size === "sm" ? 14 : 16}
              color={mati ? WARNA.inkDisabled : WARNA_IKON[variant]}
            />
          ) : null}
          <Text
            variant={size === "sm" ? "label" : "heading-sm"}
            tone={mati ? "disabled" : NADA_LABEL[variant]}
            className={icon ? "ml-snug" : ""}
          >
            {label}
          </Text>
        </View>
      )}
    </MotionPressable>
  );
}
