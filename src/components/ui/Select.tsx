/**
 * Chip-style option pickers.
 *
 * Chips rather than a native dropdown: every option list in TERRA is short and
 * closed (5 commodities, 2 triggers, 4 severities), and mid-to-low-end Android
 * handles a row of pressables far more predictably than a modal picker
 * (PRD NF-05).
 */

import { Pressable, View } from "react-native";

import { Text } from "./Text";

export type OpsiPilihan<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

function Chip({
  label,
  description,
  terpilih,
  onPress,
}: {
  label: string;
  description?: string;
  terpilih: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: terpilih }}
      onPress={onPress}
      className={[
        "mb-snug mr-snug rounded-control border-hairline px-gutter py-2",
        terpilih
          ? "border-brand-primary bg-brand-muted"
          : "border-outline bg-surface",
      ].join(" ")}
    >
      <Text variant="body-sm" tone={terpilih ? "brand" : "primary"}>
        {label}
      </Text>
      {description ? (
        <Text variant="caption" tone="muted" className="mt-tight">
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Bingkai({
  label,
  helper,
  error,
  children,
  className = "",
}: {
  label: string;
  helper?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={className}>
      <Text variant="label" tone="secondary">
        {label}
      </Text>
      <View className="mt-tight flex-row flex-wrap">{children}</View>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="muted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

export function Select<T extends string>({
  label,
  options,
  value,
  onChange,
  helper,
  error,
  className,
}: {
  label: string;
  options: OpsiPilihan<T>[];
  value: T | null;
  onChange: (nilai: T) => void;
  helper?: string;
  error?: string | null;
  className?: string;
}) {
  return (
    <Bingkai label={label} helper={helper} error={error} className={className}>
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          description={o.description}
          terpilih={value === o.value}
          onPress={() => onChange(o.value)}
        />
      ))}
    </Bingkai>
  );
}

export function MultiSelect<T extends string>({
  label,
  options,
  values,
  onChange,
  helper,
  error,
  className,
}: {
  label: string;
  options: OpsiPilihan<T>[];
  values: T[];
  onChange: (nilai: T[]) => void;
  helper?: string;
  error?: string | null;
  className?: string;
}) {
  const toggle = (v: T) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <Bingkai label={label} helper={helper} error={error} className={className}>
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          description={o.description}
          terpilih={values.includes(o.value)}
          onPress={() => toggle(o.value)}
        />
      ))}
    </Bingkai>
  );
}
