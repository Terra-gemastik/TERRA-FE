/**
 * Edit the registered location — PRD A-02.
 *
 * Location is not cosmetic. Every distance in the product is measured from
 * this point: the radius filter that decides which buyers a farmer sees
 * (D-01), the nearby-venue list, and the geotag check that flags a photo taken
 * far from where the farmer says they are (F-02). Registering with a wrong pin
 * and being unable to correct it quietly breaks all three.
 *
 * WHY THIS IS ITS OWN SCREEN
 *   It could have lived inside ProfileScreen, but that file is being redesigned
 *   and a shared edit would collide. Keeping it standalone means the only
 *   change needed elsewhere is one navigation button — see HANDOFF.md.
 *
 * Both inputs are optional on the API side, but sending a coordinate is the
 * point of the screen, so the save button stays disabled until there is one.
 */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { View } from "react-native";

import {
  Button,
  Card,
  ErrorState,
  KeyValue,
  QueryState,
  Screen,
  Stack,
  Text,
  TextField,
} from "@/components/ui";
import { usePerbaruiLokasi, useProfilSaya } from "@/hooks/useProfile";
import { lokasiSaatIni } from "@/lib/media";
import type { RootStackParamList } from "@/navigation/types";

export function EditLocationScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const profil = useProfilSaya();
  const perbarui = usePerbaruiLokasi();

  const [alamat, setAlamat] = useState<string | null>(null);
  const [koordinat, setKoordinat] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mengambil, setMengambil] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);
  const [selesai, setSelesai] = useState(false);

  // The field starts from the saved value but is only "dirty" once edited, so
  // saving without touching it does not blank out an existing address.
  const alamatSekarang = alamat ?? profil.data?.alamat_umum ?? "";
  const titik = koordinat ?? profil.data?.koordinat ?? null;

  const ambilLokasi = async () => {
    setGalat(null);
    setMengambil(true);
    const posisi = await lokasiSaatIni();
    setMengambil(false);
    if (!posisi) {
      setGalat(
        new Error(
          "Izin lokasi ditolak. Aktifkan izin lokasi, atau simpan hanya alamat umum.",
        ),
      );
      return;
    }
    setKoordinat(posisi);
  };

  const simpan = async () => {
    if (!titik) return;
    setGalat(null);
    try {
      await perbarui.mutateAsync({
        koordinat: titik,
        alamat_umum: alamatSekarang.trim() || null,
      });
      setSelesai(true);
    } catch (e) {
      setGalat(e);
    }
  };

  return (
    <Screen
      onRefresh={() => void profil.refetch()}
      refreshing={profil.isRefetching}
    >
      <QueryState
        isLoading={profil.isLoading}
        error={profil.error}
        onRetry={() => void profil.refetch()}
      >
        <Card
          title="Lokasi terdaftar"
          subtitle="Dipakai untuk mengukur jarak ke pembeli dan tempat penyaluran."
          className="mt-gutter"
        >
          <View className="mt-gutter">
            <KeyValue
              label="Titik saat ini"
              value={
                titik
                  ? `${titik.latitude.toFixed(4)}, ${titik.longitude.toFixed(4)}`
                  : "belum diisi"
              }
            />
            <KeyValue
              label="Alamat umum"
              value={alamatSekarang || "belum diisi"}
            />
          </View>
        </Card>

        <Stack className="mt-section">
          <TextField
            label="Alamat umum"
            value={alamatSekarang}
            onChangeText={setAlamat}
            placeholder="mis. Lembang, Bandung Barat"
            helper="Ditampilkan di kartu penawaran. Bukan titik persis lahan Anda."
          />

          <Button
            label="Gunakan lokasi saya sekarang"
            variant="secondary"
            icon="location-outline"
            loading={mengambil}
            onPress={() => void ambilLokasi()}
          />

          {koordinat ? (
            <Card
              tone="info"
              title="Titik baru siap disimpan"
              subtitle={`${koordinat.latitude.toFixed(4)}, ${koordinat.longitude.toFixed(4)}`}
            />
          ) : null}

          {galat ? <ErrorState error={galat} title="Gagal memperbarui" /> : null}

          {selesai ? (
            <Card
              tone="success"
              title="Lokasi diperbarui"
              subtitle="Pencocokan berikutnya memakai titik ini."
            />
          ) : null}

          <Button
            label="Simpan lokasi"
            icon="save-outline"
            disabled={!titik}
            loading={perbarui.isPending}
            onPress={() => void simpan()}
          />

          {selesai ? (
            <Button
              label="Kembali ke profil"
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
          ) : null}
        </Stack>

        <Text variant="caption" tone="muted" className="mt-section">
          Mengubah lokasi tidak mengubah penawaran yang sudah terbit. Titik ini
          dipakai untuk penawaran berikutnya.
        </Text>
      </QueryState>
    </Screen>
  );
}
