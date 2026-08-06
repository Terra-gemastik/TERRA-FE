/**
 * Profile — PRD A-02, A-03, A-04, F-05, F-06.
 *
 * The reputation block is the visible end of the trust layer. It shows the
 * counts the score derives from alongside the score itself, because PRD F-06
 * explicitly rejects a bare star rating disconnected from logged events.
 */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import {
  Badge,
  Button,
  Card,
  KeyValue,
  ListItem,
  QueryState,
  Screen,
  SectionHeader,
  Stack,
  Text,
} from "@/components/ui";
import { useProfilSaya } from "@/hooks/useProfile";
import { useLaporanTerhadap } from "@/hooks/useTrust";
import {
  LABEL_JENIS_USAHA,
  LABEL_KOMODITAS,
  LABEL_PERAN,
  LABEL_STATUS_LAPORAN,
} from "@/lib/domain";
import { persen, tanggal } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { keluar } = useAuth();
  const profil = useProfilSaya();
  const laporan = useLaporanTerhadap(profil.data?.id_pengguna);

  const reputasi = profil.data?.reputasi;

  return (
    <Screen
      title="Profil"
      onRefresh={() => void profil.refetch()}
      refreshing={profil.isRefetching}
    >
      <QueryState
        isLoading={profil.isLoading}
        error={profil.error}
        onRetry={() => void profil.refetch()}
      >
        {profil.data ? (
          <>
            <Card
              title={profil.data.nama}
              subtitle={profil.data.alamat_umum ?? "Lokasi umum belum diisi"}
              aside={<Badge label={LABEL_PERAN[profil.data.peran]} tone="brand" />}
              className="mt-gutter"
            >
              <View className="mt-gutter">
                <KeyValue
                  label="WhatsApp"
                  value={profil.data.nomor_whatsapp ?? "—"}
                />
                {profil.data.peran === "petani" ? (
                  <KeyValue
                    label="Komoditas utama"
                    value={
                      profil.data.komoditas_utama?.length
                        ? profil.data.komoditas_utama
                            .map((k) => LABEL_KOMODITAS[k])
                            .join(", ")
                        : "—"
                    }
                  />
                ) : (
                  <>
                    <KeyValue
                      label="Jenis usaha"
                      value={
                        profil.data.jenis_usaha
                          ? LABEL_JENIS_USAHA[profil.data.jenis_usaha]
                          : "—"
                      }
                    />
                    <KeyValue
                      label="Nama usaha"
                      value={profil.data.nama_usaha ?? "—"}
                    />
                  </>
                )}
                <KeyValue
                  label="Koordinat"
                  value={`${profil.data.koordinat.latitude.toFixed(
                    4,
                  )}, ${profil.data.koordinat.longitude.toFixed(4)}`}
                />
              </View>
            </Card>

            {/* PRD A-04 / F-05 / F-06 */}
            <Card
              title="Reputasi"
              subtitle={reputasi?.ringkasan_teks ?? "Belum ada riwayat transaksi."}
              className="mt-gutter"
            >
              {reputasi ? (
                <View className="mt-gutter">
                  <KeyValue
                    label="Transaksi selesai"
                    value={String(reputasi.jumlah_transaksi ?? 0)}
                  />
                  <KeyValue
                    label="Rata-rata penilaian"
                    value={
                      reputasi.skor_rata_rata ? `${reputasi.skor_rata_rata}/5` : "—"
                    }
                  />
                  {profil.data.peran === "petani" ? (
                    <>
                      <KeyValue
                        label="Akurasi deskripsi"
                        value={persen(reputasi.tingkat_akurasi_deskripsi)}
                      />
                      <KeyValue
                        label="Laporan terkonfirmasi"
                        value={String(
                          reputasi.jumlah_laporan_ketidaksesuaian ?? 0,
                        )}
                        tone={
                          (reputasi.jumlah_laporan_ketidaksesuaian ?? 0) > 0
                            ? "danger"
                            : "primary"
                        }
                      />
                    </>
                  ) : (
                    <>
                      <KeyValue
                        label="Keandalan"
                        value={persen(reputasi.tingkat_akurasi_deskripsi)}
                      />
                      <KeyValue
                        label="Pembatalan sepihak"
                        value={String(reputasi.jumlah_pembatalan_sepihak ?? 0)}
                        tone={
                          (reputasi.jumlah_pembatalan_sepihak ?? 0) > 0
                            ? "danger"
                            : "primary"
                        }
                      />
                    </>
                  )}
                </View>
              ) : null}
            </Card>

            <SectionHeader
              title="Laporan terhadap saya"
              description="Hanya laporan terkonfirmasi yang memengaruhi skor."
              className="mt-section"
            />

            <View className="mt-gutter">
              <QueryState
                isLoading={laporan.isLoading}
                error={laporan.error}
                isEmpty={(laporan.data?.length ?? 0) === 0}
                empty={{
                  title: "Tidak ada laporan",
                  description: "Rekam jejak Anda bersih.",
                  icon: "shield-checkmark-outline",
                }}
              >
                <Stack gap="snug">
                  {(laporan.data ?? []).map((l) => (
                    <ListItem
                      key={l.id_laporan}
                      title={l.keterangan_dampak}
                      subtitle={l.catatan ?? undefined}
                      meta={`Diklaim ${l.kondisi_diklaim.join(
                        ", ",
                      )} · ditemukan ${l.kondisi_ditemukan.join(", ")} · ${tanggal(
                        l.waktu_dibuat,
                      )}`}
                      badges={
                        <Badge
                          label={LABEL_STATUS_LAPORAN[l.status]}
                          tone={
                            l.status === "terkonfirmasi"
                              ? "danger"
                              : l.status === "ditolak"
                                ? "neutral"
                                : "warning"
                          }
                        />
                      }
                    />
                  ))}
                </Stack>
              </QueryState>
            </View>

            <Stack className="mt-section">
              <Button
                label="Riwayat transaksi"
                variant="secondary"
                icon="receipt-outline"
                onPress={() => navigation.navigate("Transaksi")}
              />
              <Button
                label="Dampak saya"
                variant="secondary"
                icon="stats-chart-outline"
                onPress={() => navigation.navigate("Dampak")}
              />
              <Button
                label="Keluar"
                variant="ghost"
                icon="log-out-outline"
                onPress={() => void keluar()}
              />
            </Stack>

            <Text variant="caption" tone="muted" className="mt-gutter">
              ID pengguna: {profil.data.id_pengguna}
            </Text>
          </>
        ) : null}
      </QueryState>
    </Screen>
  );
}
