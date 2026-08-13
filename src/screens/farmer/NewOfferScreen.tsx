/**
 * New offer — PRD B-01 … B-04, B-09.
 *
 * Collects commodity, trigger, 1-3 in-app photos and the optional storage
 * inputs, then runs classification. The offer itself is created on the next
 * screen, once the farmer has seen and accepted the condition read (B-06).
 */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";

import type { FotoUnggah, Komoditas, KondisiPenyimpanan, Pemicu } from "@/api/types";
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Screen,
  Select,
  Stack,
  Text,
  TextField,
} from "@/components/ui";
import { useKlasifikasiOtomatis } from "@/hooks/useClassification";
import {
  ALASAN_KOMBINASI_TIDAK_VALID,
  KETERANGAN_PEMICU,
  LABEL_KOMODITAS,
  LABEL_PEMICU,
  LABEL_PENYIMPANAN,
  OPSI_KOMODITAS,
  OPSI_PEMICU,
  OPSI_PENYIMPANAN,
  kombinasiValid,
} from "@/lib/domain";
import {
  GaleriDitolak,
  KameraDitolak,
  TangkapanDibatalkan,
  pilihDariGaleri,
  tangkapFoto,
  type HasilTangkapan,
} from "@/lib/media";
import type { RootStackParamList } from "@/navigation/types";

const MAKS_FOTO = 3; // PRD B-01

type FotoTertangkap = HasilTangkapan;

export function NewOfferScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const klasifikasi = useKlasifikasiOtomatis();

  const [komoditas, setKomoditas] = useState<Komoditas | null>(null);
  const [pemicu, setPemicu] = useState<Pemicu | null>(null);
  const [foto, setFoto] = useState<FotoTertangkap[]>([]);
  const [volume, setVolume] = useState("");
  const [lamaPanen, setLamaPanen] = useState("");
  const [penyimpanan, setPenyimpanan] = useState<KondisiPenyimpanan | null>(null);
  const [galat, setGalat] = useState<unknown>(null);
  const [peringatan, setPeringatan] = useState<string | null>(null);

  const kombinasiSalah =
    komoditas && pemicu ? !kombinasiValid(komoditas, pemicu) : false;

  const tambah = async (ambil: () => Promise<HasilTangkapan[]>) => {
    setGalat(null);
    try {
      const baru = await ambil();
      setFoto((sebelum) => [...sebelum, ...baru].slice(0, MAKS_FOTO));
      setPeringatan(baru.find((b) => b.peringatanLokasi)?.peringatanLokasi ?? null);
    } catch (e) {
      // Cancelling is a normal choice, not an error worth showing.
      if (e instanceof TangkapanDibatalkan) return;
      setGalat(e); // KameraDitolak / GaleriDitolak carry their own message
    }
  };

  const ambilFoto = () => tambah(async () => [await tangkapFoto()]);
  const ambilDariGaleri = () => tambah(() => pilihDariGaleri(MAKS_FOTO - foto.length));

  const volumeAngka = Number(volume.replace(",", "."));
  const bolehLanjut =
    Boolean(komoditas) &&
    Boolean(pemicu) &&
    !kombinasiSalah &&
    foto.length > 0 &&
    Number.isFinite(volumeAngka) &&
    volumeAngka > 0;

  const lanjut = async () => {
    if (!komoditas || !pemicu) return;
    setGalat(null);

    try {
      // Mixed sources are allowed, so pick the strongest metadata rather than
      // whichever photo happens to be first: a camera capture is the most
      // trustworthy, then any photo that still carries coordinates.
      const utama =
        foto.find((f) => f.sumber === "kamera" && f.latitude !== undefined) ??
        foto.find((f) => f.latitude !== undefined) ??
        foto.find((f) => f.waktuAmbil) ??
        foto[0];
      const hasil = await klasifikasi.mutateAsync({
        komoditas,
        pemicu,
        foto: foto.map((f) => f.foto),
        waktuAmbil: utama.waktuAmbil,
        latitude: utama.latitude,
        longitude: utama.longitude,
      });

      navigation.navigate("HasilKlasifikasi", {
        hasil,
        draf: {
          volume: volumeAngka,
          lama_sejak_panen: lamaPanen ? Number(lamaPanen) : null,
          kondisi_penyimpanan: penyimpanan,
        },
      });
    } catch (e) {
      setGalat(e);
    }
  };

  return (
    <Screen>
      <Stack className="mt-gutter">
        <Card
          title="Informasi hasil panen"
          subtitle="Pilih komoditas dan alasan panen perlu disalurkan."
        >
          <Stack gap="gutter" className="mt-gutter">
            <Select<Komoditas>
              label="Komoditas"
              value={komoditas}
              onChange={setKomoditas}
              options={OPSI_KOMODITAS.map((k) => ({
                value: k,
                label: LABEL_KOMODITAS[k],
              }))}
            />

            <Select<Pemicu>
              label="Apa yang terjadi?"
              value={pemicu}
              onChange={setPemicu}
              options={OPSI_PEMICU.map((p) => ({
                value: p,
                label: LABEL_PEMICU[p],
                description: KETERANGAN_PEMICU[p],
              }))}
              error={kombinasiSalah ? ALASAN_KOMBINASI_TIDAK_VALID : null}
            />
          </Stack>
        </Card>

        <Card
          title="Foto panen"
          subtitle={`${foto.length}/${MAKS_FOTO} foto. Bisa dari kamera atau galeri.`}
        >
          <Text variant="caption" tone="muted" className="mt-snug">
            Foto dari kamera otomatis membawa waktu dan lokasi, sehingga kondisi
            panen bisa diverifikasi pembeli. Foto dari galeri hanya terverifikasi
            bila berkasnya masih menyimpan data lokasi.
          </Text>

          {foto.length > 0 ? (
            <View className="mt-gutter flex-row flex-wrap">
              {foto.map((f, indeks) => (
                <Pressable
                  key={f.foto.uri}
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus foto ${indeks + 1}`}
                  onPress={() =>
                    setFoto((sebelum) => sebelum.filter((_, i) => i !== indeks))
                  }
                  className="mb-snug mr-snug"
                >
                  <Image
                    source={{ uri: f.foto.uri }}
                    className="h-20 w-20 rounded-control"
                  />
                  {/*
                    Provenance is shown per photo, not summarised, because a
                    farmer mixing one camera shot with two gallery images
                    should be able to see which of them carries the location
                    the buyer will be told about.
                  */}
                  <Badge
                    label={
                      f.sumber === "kamera"
                        ? "Kamera"
                        : f.latitude !== undefined
                          ? "Galeri · berlokasi"
                          : "Galeri · tanpa lokasi"
                    }
                    tone={
                      f.sumber === "kamera"
                        ? "success"
                        : f.latitude !== undefined
                          ? "info"
                          : "warning"
                    }
                    className="mt-tight"
                  />
                  <Text variant="caption" tone="muted" className="mt-tight">
                    Ketuk untuk hapus
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {peringatan ? (
            <Badge label={peringatan} tone="warning" className="mt-snug" />
          ) : null}

          <View className="mt-gutter flex-row">
            <View className="mr-snug flex-1">
              <Button
                label={foto.length === 0 ? "Ambil foto" : "Tambah foto"}
                variant="secondary"
                icon="camera-outline"
                disabled={foto.length >= MAKS_FOTO}
                onPress={() => void ambilFoto()}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Dari galeri"
                variant="secondary"
                icon="images-outline"
                disabled={foto.length >= MAKS_FOTO}
                onPress={() => void ambilDariGaleri()}
              />
            </View>
          </View>
        </Card>

        <Card title="Informasi penjualan" subtitle="Volume wajib diisi agar pembeli bisa menghitung kebutuhan.">
          <TextField
            label="Perkiraan volume"
            value={volume}
            onChangeText={setVolume}
            placeholder="120"
            keyboardType="numeric"
            suffix="kg"
            className="mt-gutter"
          />
        </Card>

        <Card
          title="Informasi penyimpanan"
          subtitle="Opsional, dipakai untuk memperkirakan sisa umur simpan."
        >
          <Stack gap="gutter" className="mt-gutter">
            <TextField
              label="Sudah berapa hari sejak panen? (opsional)"
              value={lamaPanen}
              onChangeText={setLamaPanen}
              placeholder="1"
              keyboardType="numeric"
              suffix="hari"
              helper="Dipakai untuk memperkirakan sisa umur simpan."
            />

            <Select<KondisiPenyimpanan>
              label="Kondisi penyimpanan (opsional)"
              value={penyimpanan}
              onChange={setPenyimpanan}
              options={OPSI_PENYIMPANAN.map((k) => ({
                value: k,
                label: LABEL_PENYIMPANAN[k],
              }))}
              helper="Bersama lama sejak panen, ini menentukan penanda mendesak."
            />
          </Stack>
        </Card>

        {galat ? <ErrorState error={galat} title="Klasifikasi gagal" /> : null}

        <Button
          label="Periksa kondisi panen"
          icon="scan-outline"
          disabled={!bolehLanjut}
          loading={klasifikasi.isPending}
          onPress={() => void lanjut()}
        />

        {!bolehLanjut ? (
          <Text variant="caption" tone="muted">
            Lengkapi komoditas, pemicu, minimal satu foto, dan volume.
          </Text>
        ) : null}
      </Stack>
    </Screen>
  );
}
