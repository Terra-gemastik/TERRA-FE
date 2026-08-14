/**
 * Profile — PRD A-02, A-03, A-04, F-05, F-06.
 *
 * Clean marketplace-style profile overview.
 * Backend/API behavior is preserved. Detailed report information is still
 * available through progressive disclosure instead of being shown by default.
 */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
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

  const [showReports, setShowReports] = useState(false);

  const reputasi = profil.data?.reputasi;

  const daftarLaporan = laporan.data ?? [];

  const laporanMenunggu = daftarLaporan.filter(
    (item) => item.status === "menunggu",
  ).length;

  const initials =
    profil.data?.nama
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") ?? "?";

  const rating =
    reputasi?.skor_rata_rata && reputasi.skor_rata_rata > 0
      ? reputasi.skor_rata_rata.toFixed(1)
      : "—";

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
            {/* ============================================================
                PROFILE IDENTITY
               ============================================================ */}
            <View className="mt-gutter">
              <Card>
                <View className="flex-row items-center">
                  {/* Avatar */}
                  <View
                    className="
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-primary/10
                    "
                  >
                    <Text className="text-xl font-semibold">
                      {initials}
                    </Text>
                  </View>

                  {/* Identity */}
                  <View className="ml-gutter flex-1">
                    <View className="flex-row flex-wrap items-center">
                      <Text className="mr-2 text-lg font-semibold">
                        {profil.data.nama}
                      </Text>

                      <Badge
                        label={LABEL_PERAN[profil.data.peran]}
                        tone="brand"
                      />
                    </View>

                    <Text className="mt-1 opacity-70">
                      {profil.data.alamat_umum ??
                        "Lokasi umum belum diisi"}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* ============================================================
                REPUTATION
               ============================================================ */}
            <View className="mt-section">
              <Text className="text-lg font-semibold">
                Reputasi
              </Text>

              <Text className="mt-1 opacity-60">
                Ringkasan aktivitas dan kepercayaan akun.
              </Text>

              <Card className="mt-gutter">
                {reputasi ? (
                  <View className="flex-row">
                    {/* Rating */}
                    <View className="flex-1 items-center px-1 py-2">
                      <Text className="text-xl font-semibold">
                        {rating}
                      </Text>

                      <Text className="mt-1 text-center opacity-60">
                        Rating
                      </Text>
                    </View>

                    {/* Transactions */}
                    <View className="flex-1 items-center px-1 py-2">
                      <Text className="text-xl font-semibold">
                        {reputasi.jumlah_transaksi ?? 0}
                      </Text>

                      <Text className="mt-1 text-center opacity-60">
                        Transaksi selesai
                      </Text>
                    </View>

                    {/* Accuracy / Reliability */}
                    <View className="flex-1 items-center px-1 py-2">
                      <Text className="text-xl font-semibold">
                        {persen(
                          reputasi.tingkat_akurasi_deskripsi,
                        )}
                      </Text>

                      <Text className="mt-1 text-center opacity-60">
                        {profil.data.peran === "petani"
                          ? "Akurasi deskripsi"
                          : "Keandalan"}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text className="opacity-60">
                    Belum ada riwayat transaksi.
                  </Text>
                )}
              </Card>
            </View>

            {/* ============================================================
                INFORMATION
               ============================================================ */}
            <View className="mt-section">
              <Text className="text-lg font-semibold">
                Informasi
              </Text>

              <Card className="mt-gutter">
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
                            .map(
                              (komoditas) =>
                                LABEL_KOMODITAS[komoditas],
                            )
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
                          ? LABEL_JENIS_USAHA[
                              profil.data.jenis_usaha
                            ]
                          : "—"
                      }
                    />

                    <KeyValue
                      label="Nama usaha"
                      value={profil.data.nama_usaha ?? "—"}
                    />
                  </>
                )}
              </Card>
            </View>

            {/* ============================================================
                REPORTS
               ============================================================ */}
            <View className="mt-section">
              <Text className="text-lg font-semibold">
                Keamanan akun
              </Text>

              <Card className="mt-gutter">
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="font-medium">
                      Laporan
                    </Text>

                    {laporan.isLoading ? (
                      <Text className="mt-1 opacity-60">
                        Memuat laporan...
                      </Text>
                    ) : laporanMenunggu > 0 ? (
                      <Text className="mt-1 opacity-60">
                        {laporanMenunggu} menunggu peninjauan
                      </Text>
                    ) : (
                      <Text className="mt-1 opacity-60">
                        Tidak ada laporan yang menunggu
                      </Text>
                    )}
                  </View>

                  {laporanMenunggu > 0 ? (
                    <Badge
                      label={`${laporanMenunggu} pending`}
                      tone="warning"
                    />
                  ) : (
                    <Badge
                      label="Aman"
                      tone="brand"
                    />
                  )}
                </View>

                {daftarLaporan.length > 0 ? (
                  <View className="mt-gutter">
                    <Button
                      label={
                        showReports
                          ? "Sembunyikan detail"
                          : "Lihat laporan"
                      }
                      variant="secondary"
                      onPress={() =>
                        setShowReports((current) => !current)
                      }
                    />
                  </View>
                ) : null}
              </Card>

              {/* Progressive disclosure.
                  Data tetap ada, tetapi tidak memenuhi profile overview. */}
              {showReports ? (
                <View className="mt-gutter">
                  <QueryState
                    isLoading={laporan.isLoading}
                    error={laporan.error}
                    isEmpty={daftarLaporan.length === 0}
                    empty={{
                      title: "Tidak ada laporan",
                      description: "Tidak ada laporan pada akun ini.",
                      icon: "shield-checkmark-outline",
                    }}
                  >
                    <Stack gap="snug">
                      {daftarLaporan.map((item) => (
                        <ListItem
                          key={item.id_laporan}
                          title={item.keterangan_dampak}
                          subtitle={item.catatan ?? undefined}
                          meta={`Diklaim ${item.kondisi_diklaim.join(
                            ", ",
                          )} · ditemukan ${item.kondisi_ditemukan.join(
                            ", ",
                          )} · ${tanggal(item.waktu_dibuat)}`}
                          badges={
                            <Badge
                              label={
                                LABEL_STATUS_LAPORAN[item.status]
                              }
                              tone={
                                item.status === "terkonfirmasi"
                                  ? "danger"
                                  : item.status === "ditolak"
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
              ) : null}
            </View>

            {/* ============================================================
                SECONDARY ACTIONS
               ============================================================ */}
            <View className="mt-section">
              <Text className="text-lg font-semibold">
                Aktivitas
              </Text>

              <Stack className="mt-gutter" gap="snug">
                {/*
                  PRD A-02. Location drives every distance in the product —
                  matching radius, nearby venues, the photo geotag check — so a
                  wrong pin at signup quietly breaks all three. The editor is a
                  standalone screen (EditLocationScreen); this is the only entry
                  point to it.
                */}
                <Button
                  label="Ubah lokasi"
                  variant="secondary"
                  icon="location-outline"
                  onPress={() => navigation.navigate("UbahLokasi")}
                />

                <Button
                  label="Riwayat transaksi"
                  variant="secondary"
                  icon="receipt-outline"
                  onPress={() =>
                    navigation.navigate("Transaksi")
                  }
                />

                <Button
                  label="Dampak saya"
                  variant="secondary"
                  icon="stats-chart-outline"
                  onPress={() =>
                    navigation.navigate("Dampak")
                  }
                />
              </Stack>
            </View>

            {/* ============================================================
                ACCOUNT
               ============================================================ */}
            <View className="mt-section">
              <Button
                label="Keluar"
                variant="ghost"
                icon="log-out-outline"
                onPress={() => void keluar()}
              />
            </View>
          </>
        ) : null}
      </QueryState>
    </Screen>
  );
}