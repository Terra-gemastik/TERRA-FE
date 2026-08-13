/**
 * Page container. Owns the screen background, safe area, and scroll behaviour
 * so no screen has to decide any of them.
 */

import type { ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { Text } from "./Text";

export type ScreenProps = {
  children: ReactNode;
  /** Scrollable by default; turn off for screens that manage their own list. */
  scroll?: boolean;
  /** Horizontal page padding. Off for full-bleed lists. */
  padded?: boolean;
  title?: string;
  subtitle?: string;
  /** Pull-to-refresh, wired to a TanStack Query refetch. */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Pinned to the bottom, outside the scroll area — for primary actions. */
  footer?: ReactNode;
  edges?: readonly Edge[];
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  title,
  subtitle,
  onRefresh,
  refreshing = false,
  footer,
  edges = ["top"],
}: ScreenProps) {
  const isiPadding = padded ? "px-page" : "";

  const kepala =
    title || subtitle ? (
      <View className={`pt-gutter pb-snug ${padded ? "" : "px-page"}`}>
        {title ? <Text variant="heading-lg">{title}</Text> : null}
        {subtitle ? (
          <Text variant="body-sm" tone="secondary" className="mt-tight">
            {subtitle}
          </Text>
        ) : null}
      </View>
    ) : null;

  const isi = (
    <>
      {kepala}
      {children}
    </>
  );

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-surface-sunken">
      {scroll ? (
        <ScrollView
          className={`flex-1 ${isiPadding}`}
          contentContainerClassName="pb-section"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {isi}
        </ScrollView>
      ) : (
        <View className={`flex-1 ${isiPadding}`}>{isi}</View>
      )}

      {footer ? (
        <View className="bg-surface px-page py-gutter">
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
