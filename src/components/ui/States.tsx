/**
 * Loading / empty / error states.
 *
 * Every screen routes through these three rather than rolling its own
 * spinner or "no data" text. That is what keeps them reskinnable: change
 * them here and every list, form and detail view in the app follows.
 */

import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { Button } from "./Button";
import { Text } from "./Text";
import { WARNA } from "./tokens";

export function LoadingSpinner({
  label = "Memuat…",
  inline = false,
}: {
  label?: string;
  inline?: boolean;
}) {
  return (
    <View
      className={
        inline ? "flex-row items-center py-gutter" : "items-center py-section"
      }
    >
      <ActivityIndicator color={WARNA.brandPrimary} />
      {label ? (
        <Text
          variant="body-sm"
          tone="muted"
          className={inline ? "ml-snug" : "mt-snug"}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  description,
  icon = "file-tray-outline",
  action,
}: {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View className="items-center rounded-card bg-surface px-gutter py-section">
      <Ionicons name={icon} size={28} color={WARNA.inkDisabled} />
      <Text variant="heading-sm" tone="secondary" className="mt-snug text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="body-sm" tone="muted" className="mt-tight text-center">
          {description}
        </Text>
      ) : null}
      {action ? (
        <View className="mt-gutter w-full">
          <Button label={action.label} onPress={action.onPress} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

/**
 * Error display.
 *
 * `error` is whatever the query threw. TerraApiError already carries a
 * human-readable message from the backend (including its Indonesian domain
 * messages), so it is shown as-is rather than replaced with something generic.
 */
export function ErrorState({
  error,
  onRetry,
  title = "Terjadi kesalahan",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const pesan =
    error instanceof Error ? error.message : "Kesalahan tidak diketahui.";

  return (
    <View className="rounded-card bg-danger-surface p-gutter">
      <View className="flex-row items-center">
        <Ionicons name="alert-circle-outline" size={18} color={WARNA.dangerInk} />
        <Text variant="heading-sm" tone="danger" className="ml-snug">
          {title}
        </Text>
      </View>
      <Text variant="body-sm" tone="danger" className="mt-snug">
        {pesan}
      </Text>
      {onRetry ? (
        <View className="mt-gutter">
          <Button label="Coba lagi" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

/**
 * Wraps the loading → error → empty → content decision so screens stop
 * repeating it. `children` renders only when there is data to show.
 */
export function QueryState({
  isLoading,
  error,
  isEmpty,
  onRetry,
  loadingLabel,
  empty,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingLabel?: string;
  empty?: { title: string; description?: string; icon?: keyof typeof Ionicons.glyphMap };
  children: ReactNode;
}) {
  if (isLoading) return <LoadingSpinner label={loadingLabel} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty && empty) {
    return (
      <EmptyState
        title={empty.title}
        description={empty.description}
        icon={empty.icon}
      />
    );
  }
  return <>{children}</>;
}
