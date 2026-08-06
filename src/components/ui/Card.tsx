/** Surface container. Optionally pressable, optionally with a header row. */

import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Text } from "./Text";

export type CardProps = {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  /** Rendered at the top-right — usually a Badge. */
  aside?: ReactNode;
  onPress?: () => void;
  /** Tinted variants for callouts. */
  tone?: "default" | "danger" | "warning" | "success" | "info" | "brand";
  className?: string;
};

const NADA_WADAH: Record<NonNullable<CardProps["tone"]>, string> = {
  default: "bg-surface-raised border-outline-subtle",
  danger: "bg-danger-surface border-danger",
  warning: "bg-warning-surface border-warning",
  success: "bg-success-surface border-success",
  info: "bg-info-surface border-info",
  brand: "bg-brand-muted border-brand-primary",
};

export function Card({
  children,
  title,
  subtitle,
  aside,
  onPress,
  tone = "default",
  className = "",
}: CardProps) {
  const isi = (
    <>
      {title || aside ? (
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-snug">
            {title ? <Text variant="heading-sm">{title}</Text> : null}
            {subtitle ? (
              <Text variant="body-sm" tone="secondary" className="mt-tight">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {aside}
        </View>
      ) : null}
      {children}
    </>
  );

  const kelas = [
    "rounded-card border-hairline p-gutter",
    NADA_WADAH[tone],
    className,
  ].join(" ");

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} className={kelas}>
        {isi}
      </Pressable>
    );
  }

  return <View className={kelas}>{isi}</View>;
}
