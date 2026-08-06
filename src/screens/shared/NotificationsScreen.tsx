/**
 * Notifications — PRD H-01, H-02.
 *
 * ⚠️ The backend composes, prioritises and stores notifications, but does not
 * deliver them to devices — push is a placeholder there (`status_kirim:
 * "tercatat"`). This screen polls instead, which is why a reverse match shows
 * up here without any push infrastructure existing. The status is displayed
 * rather than hidden, so nobody demos this believing a push was sent.
 */

import { View } from "react-native";

import {
  Badge,
  Card,
  ListItem,
  QueryState,
  Screen,
  Stack,
  Text,
  UrgencyBadge,
} from "@/components/ui";
import { useNotifikasiSaya, useTandaiDibaca } from "@/hooks/useNotifications";
import { waktuRelatif } from "@/lib/format";

export function NotificationsScreen() {
  const notifikasi = useNotifikasiSaya();
  const tandaiDibaca = useTandaiDibaca();

  const daftar = notifikasi.data ?? [];

  return (
    <Screen
      title="Notifikasi"
      subtitle="Yang mendesak ditampilkan lebih dulu."
      onRefresh={() => void notifikasi.refetch()}
      refreshing={notifikasi.isRefetching}
    >
      <Card tone="info" className="mt-gutter">
        <Text variant="body-sm" tone="info">
          Pengiriman push belum aktif di backend. Notifikasi tetap dibuat dan
          tersimpan — aplikasi mengambilnya secara berkala.
        </Text>
      </Card>

      <View className="mt-section">
        <QueryState
          isLoading={notifikasi.isLoading}
          error={notifikasi.error}
          onRetry={() => void notifikasi.refetch()}
          isEmpty={daftar.length === 0}
          empty={{
            title: "Belum ada notifikasi",
            description:
              "Notifikasi muncul saat ada pasokan cocok dengan permintaan Anda.",
            icon: "notifications-outline",
          }}
        >
          <Stack gap="snug">
            {daftar.map((n) => (
              <ListItem
                key={n.id_notifikasi}
                title={n.judul}
                subtitle={n.isi}
                meta={waktuRelatif(n.waktu_dibuat)}
                highlighted={!n.waktu_dibaca}
                onPress={
                  n.waktu_dibaca
                    ? undefined
                    : () => tandaiDibaca.mutate(n.id_notifikasi)
                }
                badges={
                  <>
                    {n.mendesak ? <UrgencyBadge className="mr-snug" /> : null}
                    <Badge
                      label={
                        n.status_kirim === "tercatat"
                          ? "Tercatat (belum dikirim)"
                          : n.status_kirim
                      }
                      tone={n.status_kirim === "terkirim" ? "success" : "neutral"}
                      className="mr-snug"
                    />
                    {!n.waktu_dibaca ? (
                      <Badge label="Belum dibaca" tone="brand" />
                    ) : null}
                  </>
                }
              />
            ))}
          </Stack>
        </QueryState>
      </View>
    </Screen>
  );
}
