/**
 * Regional community board — PRD G-03.
 *
 * Community is a passive coordination surface.
 * Backend/API behavior is preserved.
 */

import { useState } from "react";
import { Pressable, View } from "react-native";

import {
  Badge,
  Button,
  ListItem,
  QueryState,
  Screen,
  Stack,
  Text,
  TextField,
  UrgencyBadge,
} from "@/components/ui";
import { useAuth } from "@/auth/AuthContext";
import { useBuatPos, usePapanKomunitas } from "@/hooks/useCommunity";
import { LABEL_KOMODITAS } from "@/lib/domain";
import { kilogram, waktuRelatif } from "@/lib/format";

export function CommunityScreen() {
  const { pengguna } = useAuth();

  const [wilayah, setWilayah] = useState("");
  const [pencarian, setPencarian] = useState("");
  const [isiPos, setIsiPos] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  const papan = usePapanKomunitas(pencarian || undefined);
  const buatPos = useBuatPos();

  const kirimPos = async () => {
    if (isiPos.trim().length < 3) return;

    await buatPos.mutateAsync({
      wilayah: (wilayah || pengguna?.alamat_umum || "Umum").trim(),
      isi: isiPos.trim(),
    });

    setIsiPos("");
    setShowComposer(false);
  };

  return (
    <Screen
      title="Komunitas"
      subtitle="Temukan kabar panen dan kebutuhan di sekitar Anda."
      onRefresh={() => void papan.refetch()}
      refreshing={papan.isRefetching}
    >
      {/* SEARCH */}
      <View className="mt-snug">
        <TextField
          value={pencarian}
          onChangeText={setPencarian}
          placeholder="Cari wilayah, mis. Lembang"
          autoCapitalize="words"
        />

        {pencarian.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            className="mt-tight min-h-[44px] self-start justify-center"
            onPress={() => setPencarian("")}
          >
            <Text variant="label" tone="secondary">
              Lihat semua wilayah
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* ACTIVE LISTINGS */}
      <View className="mt-section">
        <View className="flex-row items-end justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-[#4E4138]">
              Penawaran di sekitar
            </Text>

            <Text className="mt-1 text-[#75685E]">
              Lokasi ditampilkan secara umum.
            </Text>
          </View>

          {(papan.data?.penawaran_aktif?.length ?? 0) > 0 ? (
            <Text className="ml-3 font-medium text-[#75685E]">
              {papan.data?.penawaran_aktif.length}
            </Text>
          ) : null}
        </View>

        <View className="mt-gutter">
          <QueryState
            isLoading={papan.isLoading}
            error={papan.error}
            onRetry={() => void papan.refetch()}
            isEmpty={(papan.data?.penawaran_aktif?.length ?? 0) === 0}
            empty={{
              title: "Belum ada penawaran",
              description: "Coba lihat wilayah lain.",
              icon: "leaf-outline",
            }}
          >
            <Stack gap="snug">
              {(papan.data?.penawaran_aktif ?? []).map((p) => (
                <View
                  key={p.id_penawaran}
                  className="rounded-2xl bg-[#FCFAF7] px-5 py-4"
                >
                  <View className="flex-row items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-[#4E4138]">
                        {LABEL_KOMODITAS[p.komoditas]}
                      </Text>

                      <Text className="mt-1 text-lg font-semibold text-[#4E4138]">
                        {kilogram(p.volume_kg)}
                      </Text>
                    </View>

                    {p.mendesak ? <UrgencyBadge /> : null}
                  </View>

                  <Text className="mt-3 text-[#5F544B]">
                    {p.kondisi}
                  </Text>

                  <View className="mt-3 flex-row flex-wrap items-center">
                    <Text className="mr-3 text-[#75685E]">
                      {p.lokasi_umum}
                    </Text>

                    {p.dilaporkan_sendiri ? (
                      <Badge
                        label="Laporan mandiri"
                        tone="warning"
                      />
                    ) : (
                      <Badge
                        label="Foto terverifikasi"
                        tone="brand"
                      />
                    )}
                  </View>
                </View>
              ))}
            </Stack>
          </QueryState>
        </View>
      </View>

      {/* DISCUSSION */}
      <View className="mt-section">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-semibold text-[#4E4138]">
              Diskusi
            </Text>

            <Text className="mt-1 text-[#75685E]">
              Kabar dari komunitas sekitar.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            className="
              min-h-[44px]
              justify-center
              rounded-full
              bg-[#FCFAF7]
              px-4
            "
            onPress={() =>
              setShowComposer((current) => !current)
            }
          >
            <Text className="font-medium text-[#4E4138]">
              {showComposer ? "Tutup" : "+ Buat posting"}
            </Text>
          </Pressable>
        </View>

        {/* COMPOSER */}
        {showComposer ? (
          <View className="mt-gutter rounded-2xl bg-[#FCFAF7] p-4">
            <Stack gap="snug">
              <TextField
                label="Wilayah"
                value={wilayah}
                onChangeText={setWilayah}
                placeholder={
                  pengguna?.alamat_umum ??
                  "mis. Lembang, Bandung Barat"
                }
              />

              <TextField
                label="Tulis sesuatu"
                value={isiPos}
                onChangeText={setIsiPos}
                placeholder="Bagikan kabar panen, harga, atau kebutuhan di sekitar Anda."
                multiline
              />

              <Button
                label="Kirim posting"
                variant="secondary"
                disabled={isiPos.trim().length < 3}
                loading={buatPos.isPending}
                onPress={() => void kirimPos()}
              />
            </Stack>
          </View>
        ) : null}

        {/* FEED */}
        <View className="mt-gutter">
          <Stack gap="snug">
            {(papan.data?.pos ?? []).map((pos) => {
              const initials =
                pos.nama_penulis
                  ?.trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((name) => name.charAt(0).toUpperCase())
                  .join("") ?? "?";

              return (
                <View
                  key={pos.id_pos}
                  className="rounded-2xl bg-[#FCFAF7] px-5 py-4"
                >
                  <View className="flex-row items-center">
                    <View
                      className="
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                      "
                    >
                      <Text className="font-semibold text-[#4E4138]">
                        {initials}
                      </Text>
                    </View>

                    <View className="ml-3 flex-1">
                      <Text className="font-semibold text-[#4E4138]">
                        {pos.nama_penulis ?? "Anggota"}
                      </Text>

                      <Text className="mt-0.5 text-[#75685E]">
                        {pos.wilayah} ·{" "}
                        {waktuRelatif(pos.waktu_dibuat)}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-4 leading-6 text-[#4E4138]">
                    {pos.isi}
                  </Text>
                </View>
              );
            })}
          </Stack>
        </View>
      </View>

      <Text
        variant="caption"
        tone="muted"
        className="mb-section mt-section text-center"
      >
        Komunitas membantu berbagi informasi dan menemukan peluang di sekitar.
      </Text>
    </Screen>
  );
}