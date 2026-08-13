/** Labelled text input with helper and error slots. */

import { useState } from "react";
import { TextInput, View, type KeyboardTypeOptions } from "react-native";

import { Text } from "./Text";
import { WARNA } from "./tokens";

// Map fontWeight to Hanken Grotesk font names
const FONT_FAMILY = "Hanken Grotesk";

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (teks: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string | null;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
  editable?: boolean;
  /** Short unit shown at the right edge, e.g. "kg" or "km". */
  suffix?: string;
  className?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  keyboardType,
  multiline = false,
  autoCapitalize = "sentences",
  secureTextEntry = false,
  editable = true,
  suffix,
  className = "",
}: TextFieldProps) {
  const [fokus, setFokus] = useState(false);

  return (
    <View className={className}>
      <Text variant="label" tone="primary">
        {label}
      </Text>

      <View
        className={[
          "mt-tight min-h-12 flex-row items-center rounded-control px-gutter",
          error
            ? "bg-danger-surface"
            : fokus
              ? "bg-brand-muted"
              : "bg-surface-raised",
          editable ? "" : "bg-surface-disabled",
        ].join(" ")}
      >
        <TextInput
          style={{ fontFamily: FONT_FAMILY }}
          className={`flex-1 font-primary py-3 text-body text-ink-primary ${
            multiline ? "h-24" : ""
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={WARNA.inkMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          editable={editable}
          accessibilityLabel={label}
          onFocus={() => setFokus(true)}
          onBlur={() => setFokus(false)}
        />
        {suffix ? (
          <Text variant="body-sm" tone="muted" className="ml-snug">
            {suffix}
          </Text>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" tone="danger" className="mt-tight">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="muted" className="mt-tight">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
