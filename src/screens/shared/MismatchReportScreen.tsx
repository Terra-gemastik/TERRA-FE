/**
 * Mismatch report — PRD F-04, F-05.
 *
 * The buyer states what they actually received, with comparison photos taken
 * in-app. A confirmed report lowers the farmer's description-accuracy score;
 * a pending one is visible on their profile but does not move the number.
 *
 * NOTE: the backend's review endpoint has no moderator role yet, so anyone
 * signed in can confirm a report. That gap is the backend's to close — this
 * screen only files them.
 */

import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";

import type { Citra, KondisiKode } from "@/api/types";
import {
  Button,
  Card,
  ErrorState,
  MultiSelect,
  Screen,
  Stack,
  Text,
  TextField,
} from "@/components/ui";
import { useBuatLaporan } from "@/hooks/useTrust";
import { LABEL_KONDISI, OPSI_KONDISI } from "@/lib/domain";
import { KameraDitolak, TangkapanDibatalkan, tangkapFoto } from "@/lib/media";
import type { RootStackParamList } from "@/navigation/types";

export function MismatchReportScreen() {
  const navigation = useNavigation();
  const { params } =
    useRoute<RouteProp<RootStackParamList, "LaporanKetidaksesuaian">>();

  const buatLaporan = useBuatLaporan();

  const [kondisi, setKondisi] = useState<KondisiKode[]>([]);
  const [catatan, setCatatan] = useState("");
  const [foto, setFoto] = useState<Citra[]>([]);
  const [galat, setGalat] = useState<unknown>(null);

  const ambilFoto = async () => {
    setGalat(null);
    try {
      const hasil = await tangkapFoto();
      // The report stores photo metadata, not the binary — the backend's
      // comparison-photo field is a list of Citra records.
      setFoto((sebelum) => [
        ...sebelum,
        {
          url: hasil.foto.uri,
          waktu_ambil: hasil.waktuAmbil,
          latitude: hasil.latitude ?? null,
          longitude: hasil.longitude ?? null,
        },
      ]);
    } catch (e) {
      if (e instanceof TangkapanDibatalkan) return;
      if (e instanceof KameraDitolak) {
        setGalat(e);
        return;
      }
      setGalat(e);
    }
  };

  const kirim = async () => {
    setGalat(null);
    if (kondisi.length === 0) {
      setGalat(new Error("Pilih minimal satu kondisi yang Anda temukan."));
      return;
    }

    try {
      await buatLaporan.mutateAsync({
        id_transaksi: params.idTransaksi,
        kondisi_ditemukan: kondisi,
        catatan: catatan.trim() || null,
        foto_pembanding: foto,
      });
      navigation.goBack();
    } catch (e) {
      setGalat(e);
    }
  };

  return (
    <Screen>
      <Card
        tone="warning"
        title="Laporkan kondisi yang tidak sesuai"
        subtitle="Laporan yang terkonfirmasi akan menurunkan skor akurasi deskripsi penjual."
        className="mt-gutter"
      />

      <Stack className="mt-gutter">
        <MultiSelect<KondisiKode>
          label="Kondisi yang Anda temukan"
          values={kondisi}
          onChange={setKondisi}
          options={OPSI_KONDISI.map((k) => ({
            value: k,
            label: `${k} · ${LABEL_KONDISI[k]}`,
          }))}
          helper="Pilih semua yang berlaku saat barang diterima."
        />

        <TextField
          label="Catatan"
          value={catatan}
          onChangeText={setCatatan}
          placeholder="Jelaskan bedanya dengan yang dijanjikan…"
          multiline
        />

        <Card
          title="Foto pembanding"
          subtitle={`${foto.length} foto. Diambil langsung lewat kamera.`}
        >
          {foto.length > 0 ? (
            <View className="mt-gutter flex-row flex-wrap">
              {foto.map((f, indeks) => (
                <Pressable
                  key={f.url}
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus foto ${indeks + 1}`}
                  onPress={() =>
                    setFoto((sebelum) => sebelum.filter((_, i) => i !== indeks))
                  }
                  className="mb-snug mr-snug"
                >
                  <Image source={{ uri: f.url }} className="h-20 w-20 rounded-control" />
                </Pressable>
              ))}
            </View>
          ) : null}

          <View className="mt-gutter">
            <Button
              label="Ambil foto pembanding"
              variant="secondary"
              icon="camera-outline"
              onPress={() => void ambilFoto()}
            />
          </View>
        </Card>

        {galat ? <ErrorState error={galat} title="Gagal mengirim laporan" /> : null}

        <Button
          label="Kirim laporan"
          disabled={kondisi.length === 0}
          loading={buatLaporan.isPending}
          onPress={() => void kirim()}
        />

        <Text variant="caption" tone="muted">
          Laporan masuk berstatus “menunggu peninjauan”. Skor pihak terlapor baru
          berubah setelah laporan dikonfirmasi.
        </Text>
      </Stack>
    </Screen>
  );
}
