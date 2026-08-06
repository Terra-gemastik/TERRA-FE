/** Labelled text input with helper and error slots. */

import { TextInput, View, type KeyboardTypeOptions } from "react-native";

import { Text } from "./Text";
import { WARNA } from "./tokens";

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
  return (
    <View className={className}>
      <Text variant="label" tone="secondary">
        {label}
      </Text>

      <View
        className={[
          "mt-tight flex-row items-center rounded-control border-hairline px-snug",
          error ? "border-danger bg-danger-surface" : "border-outline bg-surface",
          editable ? "" : "bg-surface-disabled",
        ].join(" ")}
      >
        <TextInput
          className={`flex-1 py-3 text-body text-ink-primary ${
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
