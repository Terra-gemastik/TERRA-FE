/** One row in a list. Optional leading icon, badges, trailing value, chevron. */

import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { View } from "react-native";

import { MotionPressable } from "./MotionPressable";
import { Text } from "./Text";
import { WARNA } from "./tokens";

export type ListItemProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  /** Rendered under the subtitle — usually a row of Badges. */
  badges?: ReactNode;
  /** Rendered at the right edge, e.g. a value or a Button. */
  right?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  /** Emphasises the row without changing its content. */
  highlighted?: boolean;
  className?: string;
};

export function ListItem({
  title,
  subtitle,
  meta,
  badges,
  right,
  icon,
  onPress,
  highlighted = false,
  className = "",
}: ListItemProps) {
  const isi = (
    <View className="flex-row items-start">
      {icon ? (
        <View className="mr-gutter mt-tight h-8 w-8 items-center justify-center rounded-control border-hairline border-outline bg-brand-muted">
          <Ionicons name={icon} size={16} color={WARNA.inkSecondary} />
        </View>
      ) : null}

      <View className="flex-1">
        <Text variant="heading-sm">{title}</Text>
        {subtitle ? (
          <Text variant="body-sm" tone="secondary" className="mt-tight">
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="caption" tone="muted" className="mt-tight">
            {meta}
          </Text>
        ) : null}
        {badges ? <View className="mt-snug flex-row flex-wrap">{badges}</View> : null}
      </View>

      {right ? <View className="ml-snug items-end">{right}</View> : null}
      {onPress && !right ? (
        <Ionicons name="chevron-forward" size={16} color={WARNA.inkDisabled} />
      ) : null}
    </View>
  );

  const kelas = [
    "rounded-card border-hairline p-gutter",
    highlighted
      ? "border-thick border-brand-strong bg-brand-muted"
      : "border-outline-subtle bg-surface",
    className,
  ].join(" ");

  if (onPress) {
    return (
      <MotionPressable
        accessibilityRole="button"
        onPress={onPress}
        pressedScale={0.99}
        className={kelas}
      >
        {isi}
      </MotionPressable>
    );
  }
  return <View className={kelas}>{isi}</View>;
}
