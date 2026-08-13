/** Small structural pieces: dividers, section headers, stat tiles, key/value rows. */

import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

export function Divider({ className = "" }: { className?: string }) {
  return <View className={`h-px bg-outline-subtle ${className}`} />;
}

export function SectionHeader({
  title,
  description,
  right,
  className = "",
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <View className={`flex-row items-end justify-between ${className}`}>
      <View className="flex-1 pr-snug">
        <Text variant="heading-md">{title}</Text>
        {description ? (
          <Text variant="body-sm" tone="secondary" className="mt-tight">
            {description}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

/** A single headline number for the impact dashboard. */
export function StatTile({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <View
      className={`rounded-card bg-surface p-gutter ${className}`}
    >
      <Text variant="label" tone="secondary">
        {label}
      </Text>
      <Text variant="numeric" className="mt-tight">
        {value}
      </Text>
      {hint ? (
        <Text variant="caption" tone="muted" className="mt-tight">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Label on the left, value on the right. Used all over detail screens. */
export function KeyValue({
  label,
  value,
  tone = "primary",
  className = "",
}: {
  label: string;
  value: string;
  tone?: "primary" | "secondary" | "danger" | "success";
  className?: string;
}) {
  return (
    <View className={`flex-row items-start justify-between py-tight ${className}`}>
      <Text variant="body-sm" tone="secondary" className="flex-1 pr-gutter">
        {label}
      </Text>
      <Text variant="body-sm" tone={tone} className="flex-1 text-right">
        {value}
      </Text>
    </View>
  );
}

/** Vertical rhythm helper so screens don't hand-tune margins per child. */
export function Stack({
  children,
  gap = "gutter",
  className = "",
}: {
  children: ReactNode;
  gap?: "tight" | "snug" | "gutter" | "section";
  className?: string;
}) {
  const JARAK = {
    tight: "gap-tight",
    snug: "gap-snug",
    gutter: "gap-gutter",
    section: "gap-section",
  } as const;

  return <View className={`${JARAK[gap]} ${className}`}>{children}</View>;
}
