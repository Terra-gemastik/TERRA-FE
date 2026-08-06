/**
 * Impact dashboard — PRD I-01, I-02.
 *
 * Aggregated from the signed-in user's own transaction history only. No
 * platform-wide totals and nothing extrapolated — the figures are as small or
 * as large as that user's real record.
 */

import { View } from "react-native";

import {
  Card,
  KeyValue,
  QueryState,
  Screen,
  SectionHeader,
  Stack,
  StatTile,
  Text,
} from "@/components/ui";
import { useDampakSaya } from "@/hooks/useImpact";
import { LABEL_KOMODITAS } from "@/lib/domain";
import { kilogram, persen, rupiah } from "@/lib/format";

export function ImpactScreen() {
  const dampak = useDampakSaya();

  return (
    <Screen
      onRefresh={() => void dampak.refetch()}
      refreshing={dampak.isRefetching}
    >
      <QueryState
        isLoading={dampak.isLoading}
        error={dampak.error}
        onRetry={() => void dampak.refetch()}
      >
        {dampak.data ? (
          <>
            <Stack gap="snug" className="mt-gutter">
              <StatTile
                label="Nilai terpulihkan"
                value={rupiah(dampak.data.nilai_terpulihkan)}
                hint="Nilai produk kotor, tanpa potongan ongkos angkut."
              />
              <StatTile
                label="Volume dialihkan dari pembuangan"
                value={kilogram(dampak.data.volume_dialihkan_kg)}
              />
              <StatTile
                label="Koneksi berhasil"
                value={String(dampak.data.jumlah_koneksi_berhasil)}
                hint="Transaksi yang berstatus selesai."
              />
            </Stack>

            <Card title="Rincian" className="mt-section">
              <View className="mt-snug">
                <KeyValue
                  label="Penawaran dibuat"
                  value={String(dampak.data.jumlah_penawaran_dibuat)}
                />
                <KeyValue
                  label="Penawaran tersalurkan"
                  value={String(dampak.data.jumlah_penawaran_tersalurkan)}
                />
                <KeyValue
                  label="Tingkat penyaluran"
                  value={persen(dampak.data.tingkat_penyaluran)}
                />
                <KeyValue
                  label="Transaksi dibatalkan"
                  value={String(dampak.data.transaksi_dibatalkan)}
                  tone={dampak.data.transaksi_dibatalkan > 0 ? "danger" : "primary"}
                />
              </View>
            </Card>

            {(dampak.data.rincian_komoditas?.length ?? 0) > 0 ? (
              <>
                <SectionHeader title="Per komoditas" className="mt-section" />
                <Card className="mt-gutter">
                  <View className="mt-snug">
                    {(dampak.data.rincian_komoditas ?? []).map((r) => (
                      <KeyValue
                        key={r.komoditas}
                        label={`${LABEL_KOMODITAS[r.komoditas]} (${r.jumlah_transaksi} transaksi)`}
                        value={`${kilogram(r.volume_kg)} · ${rupiah(r.nilai_rupiah)}`}
                      />
                    ))}
                  </View>
                </Card>
              </>
            ) : null}

            <Text variant="caption" tone="muted" className="mt-section">
              {dampak.data.catatan}
            </Text>
          </>
        ) : null}
      </QueryState>
    </Screen>
  );
}
