/**
 * Regional community board — PRD G-03.
 *
 * PRD G-04 is a constraint rather than a feature: this is a passive
 * information and coordination surface, and no shipment-pooling is built on
 * top of it. The backend returns that note with every response and it is shown
 * here, so the boundary stays visible to whoever picks the screen up next.
 */

import { useState } from "react";
import { View } from "react-native";

import {
  Badge,
  Button,
  Card,
  ListItem,
  QueryState,
  Screen,
  SectionHeader,
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

  const papan = usePapanKomunitas(pencarian || undefined);
  const buatPos = useBuatPos();

  const kirimPos = async () => {
    if (isiPos.trim().length < 3) return;
    await buatPos.mutateAsync({
      wilayah: (wilayah || pengguna?.alamat_umum || "Umum").trim(),
      isi: isiPos.trim(),
    });
    setIsiPos("");
  };

  return (
    <Screen
      title="Komunitas"
      subtitle="Lihat apa yang sedang terjadi di sekitar Anda."
      onRefresh={() => void papan.refetch()}
      refreshing={papan.isRefetching}
    >
      <View className="mt-gutter">
        <TextField
          label="Cari wilayah"
          value={pencarian}
          onChangeText={setPencarian}
          placeholder="mis. Lembang"
          autoCapitalize="words"
          helper="Kosongkan untuk melihat semua wilayah."
        />
      </View>

      <SectionHeader
        title="Penawaran aktif"
        description="Lokasi ditampilkan secara umum, bukan titik persis."
        className="mt-section"
      />

      <View className="mt-gutter">
        <QueryState
          isLoading={papan.isLoading}
          error={papan.error}
          onRetry={() => void papan.refetch()}
          isEmpty={(papan.data?.penawaran_aktif?.length ?? 0) === 0}
          empty={{
            title: "Belum ada penawaran aktif",
            description: "Coba hapus filter wilayah.",
            icon: "leaf-outline",
          }}
        >
          <Stack gap="snug">
            {(papan.data?.penawaran_aktif ?? []).map((p) => (
              <ListItem
                key={p.id_penawaran}
                title={`${LABEL_KOMODITAS[p.komoditas]} · ${kilogram(p.volume_kg)}`}
                subtitle={p.kondisi}
                meta={p.lokasi_umum}
                badges={
                  <>
                    {p.mendesak ? <UrgencyBadge className="mr-snug" /> : null}
                    {p.dilaporkan_sendiri ? (
                      <Badge label="Dilaporkan sendiri" tone="warning" />
                    ) : (
                      <Badge label="Terverifikasi foto" tone="info" />
                    )}
                  </>
                }
              />
            ))}
          </Stack>
        </QueryState>
      </View>

      <SectionHeader title="Diskusi" className="mt-section" />

      <Card className="mt-gutter">
        <Stack gap="snug">
          <TextField
            label="Wilayah"
            value={wilayah}
            onChangeText={setWilayah}
            placeholder={pengguna?.alamat_umum ?? "mis. Lembang, Bandung Barat"}
          />
          <TextField
            label="Tulis sesuatu"
            value={isiPos}
            onChangeText={setIsiPos}
            placeholder="Kabar panen, harga pasar, atau kontak yang bisa dibagi…"
            multiline
          />
          <Button
            label="Kirim"
            variant="secondary"
            disabled={isiPos.trim().length < 3}
            loading={buatPos.isPending}
            onPress={() => void kirimPos()}
          />
        </Stack>
      </Card>

      <View className="mt-gutter">
        <Stack gap="snug">
          {(papan.data?.pos ?? []).map((pos) => (
            <ListItem
              key={pos.id_pos}
              title={pos.nama_penulis ?? "Anggota"}
              subtitle={pos.isi}
              meta={`${pos.wilayah} · ${waktuRelatif(pos.waktu_dibuat)}`}
            />
          ))}
        </Stack>
      </View>

      {papan.data?.catatan ? (
        <Text variant="caption" tone="muted" className="mt-section">
          {papan.data.catatan}
        </Text>
      ) : null}
    </Screen>
  );
}
