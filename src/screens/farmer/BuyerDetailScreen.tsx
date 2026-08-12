/**
 * Buyer detail and contact — PRD D-05, D-06, F-07.
 *
 * Shows the buyer's reputation BEFORE contact is initiated (F-07), the full
 * score breakdown behind their ranking (NF-06), and the WhatsApp deep link
 * that keeps the farmer in the channel they already use (D-06, Epic G).
 *
 * Recording a transaction here is what feeds both reputation directions and
 * the impact dashboard. It records an agreement; it moves no money — payment
 * is out of scope (PRD §3.2).
 */

import { useRoute, type RouteProp } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Linking, View } from "react-native";

import {
  Badge,
  Button,
  Card,
  ErrorState,
  KeyValue,
  LoadingSpinner,
  Screen,
  SectionHeader,
  Stack,
  Text,
  TextField,
} from "@/components/ui";
import { useCariPembeli } from "@/hooks/useMatches";
import { usePenawaran } from "@/hooks/useOffers";
import { useProfilPengguna } from "@/hooks/useProfile";
import { useBuatTransaksi } from "@/hooks/useTrust";
import { LABEL_JENIS_USAHA } from "@/lib/domain";
import { kilogram, kilometer, persen, rentangRupiah } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function BuyerDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, "DetailPembeli">>();

  const pencocokan = useCariPembeli(params.idPenawaran);
  const penawaran = usePenawaran(params.idPenawaran);
  const profil = useProfilPengguna(params.idPembeli);
  const buatTransaksi = useBuatTransaksi();

  const [volume, setVolume] = useState("");
  const [nilai, setNilai] = useState("");
  const [galat, setGalat] = useState<unknown>(null);
  const [tercatat, setTercatat] = useState(false);

  const pembeli = pencocokan.data?.pembeli?.find(
    (b) => b.id_permintaan === params.idPermintaan,
  );

  if (pencocokan.isLoading || profil.isLoading) {
    return (
      <Screen>
        <LoadingSpinner label="Memuat detail pembeli…" />
      </Screen>
    );
  }

  if (!pembeli) {
    return (
      <Screen>
        <ErrorState
          error={new Error("Pembeli ini sudah tidak ada dalam daftar cocok.")}
          onRetry={() => void pencocokan.refetch()}
        />
      </Screen>
    );
  }

  const hubungiWhatsapp = async () => {
    if (!pembeli.tautan_whatsapp) return;
    const bisa = await Linking.canOpenURL(pembeli.tautan_whatsapp);
    if (!bisa) {
      Alert.alert("WhatsApp tidak tersedia", "Tidak ada aplikasi yang bisa membuka tautan ini.");
      return;
    }
    await Linking.openURL(pembeli.tautan_whatsapp);
  };

  const catatTransaksi = async () => {
    setGalat(null);
    const volumeAngka = Number(volume.replace(",", "."));
    const nilaiAngka = Number(nilai.replace(/[^\d]/g, ""));

    if (!Number.isFinite(volumeAngka) || volumeAngka <= 0) {
      setGalat(new Error("Volume harus lebih dari 0."));
      return;
    }

    try {
      await buatTransaksi.mutateAsync({
        id_penawaran: params.idPenawaran,
        id_pembeli: params.idPembeli,
        volume: volumeAngka,
        nilai_total: Number.isFinite(nilaiAngka) ? nilaiAngka : 0,
      });
      setTercatat(true);
    } catch (e) {
      setGalat(e);
    }
  };

  const komponen = (pembeli.alasan?.komponen ?? {}) as Record<string, number>;

  return (
    <Screen>
      <Card
        title={pembeli.nama_usaha ?? pembeli.nama}
        subtitle={`${LABEL_JENIS_USAHA[pembeli.jenis_usaha]} · ${
          pembeli.alamat_umum ?? "lokasi umum tidak diisi"
        }`}
        aside={<Badge label="Buyer cocok" tone="brand" icon="people-outline" />}
        className="mt-gutter"
      >
        <Text variant="label" tone="secondary" className="mt-gutter">
          Harga penawaran
        </Text>
        <Text variant="numeric" className="mt-tight">
          {rentangRupiah(
            pembeli.rentang_harga.min,
            pembeli.rentang_harga.max,
          )}
        </Text>
        <Text variant="caption" tone="muted" className="mt-tight">
          Nilai produk, belum termasuk ongkos angkut.
        </Text>

        <View className="mt-gutter">
          <KeyValue
            label="Volume diterima"
            value={kilogram(pembeli.volume_dibutuhkan)}
          />
          <KeyValue label="Jarak" value={kilometer(pembeli.jarak_km)} />
          <KeyValue
            label="Volume minimum"
            value={kilogram(pembeli.volume_minimum)}
          />
          <KeyValue label="Estimasi logistik" value="Ongkos angkut belum dihitung TERRA" />
        </View>
      </Card>

      {/* PRD F-07 — reputation is visible before contact. */}
      <Card
        title="Reputasi pembeli"
        subtitle={pembeli.reputasi?.ringkasan_teks ?? "Belum ada riwayat transaksi."}
        tone={
          (pembeli.reputasi?.jumlah_pembatalan_sepihak ?? 0) > 0
            ? "warning"
            : "default"
        }
        className="mt-gutter"
      >
        {pembeli.reputasi ? (
          <View className="mt-gutter">
            <KeyValue
              label="Transaksi selesai"
              value={String(pembeli.reputasi.jumlah_transaksi ?? 0)}
            />
            <KeyValue
              label="Pembatalan sepihak"
              value={String(pembeli.reputasi.jumlah_pembatalan_sepihak ?? 0)}
              tone={
                (pembeli.reputasi.jumlah_pembatalan_sepihak ?? 0) > 0
                  ? "danger"
                  : "primary"
              }
            />
            <KeyValue
              label="Keandalan"
              value={persen(pembeli.reputasi.tingkat_akurasi_deskripsi)}
            />
            <KeyValue
              label="Rata-rata penilaian"
              value={
                pembeli.reputasi.skor_rata_rata
                  ? `${pembeli.reputasi.skor_rata_rata}/5`
                  : "—"
              }
            />
          </View>
        ) : null}
      </Card>

      {/* NF-06 — why this buyer ranked where it did. */}
      <Card
        title="Dasar peringkat"
        subtitle={(pembeli.alasan?.penjelasan as string) ?? undefined}
        className="mt-gutter"
      >
        <View className="mt-snug flex-row flex-wrap">
          {Object.entries(komponen).map(([nama, nilaiKomponen]) => (
            <Badge
              key={nama}
              label={`${nama.replace(/_/g, " ")}: ${nilaiKomponen}`}
              tone="neutral"
              className="mr-snug"
            />
          ))}
        </View>
        <Text variant="caption" tone="muted" className="mt-snug">
          {(pembeli.alasan?.catatan_lingkup as string) ?? ""}
        </Text>
      </Card>

      <Stack className="mt-section">
        <Button
          label="Hubungi via WhatsApp"
          icon="logo-whatsapp"
          disabled={!pembeli.tautan_whatsapp}
          onPress={() => void hubungiWhatsapp()}
        />
        {!pembeli.tautan_whatsapp ? (
          <Text variant="caption" tone="muted">
            Pembeli ini belum mencantumkan nomor WhatsApp.
          </Text>
        ) : null}
      </Stack>

      <SectionHeader
        title="Catat kesepakatan"
        description="Setelah sepakat, catat di sini agar reputasi dan dampak terhitung."
        className="mt-section"
      />

      {tercatat ? (
        <Card tone="success" className="mt-gutter">
          <Text variant="body-sm" tone="success">
            Transaksi tercatat. Selesaikan dan beri penilaian lewat menu
            Transaksi di halaman Profil.
          </Text>
        </Card>
      ) : (
        <Stack className="mt-gutter">
          <TextField
            label="Volume disepakati"
            value={volume}
            onChangeText={setVolume}
            keyboardType="numeric"
            placeholder={String(penawaran.data?.volume ?? "")}
            suffix="kg"
          />
          <TextField
            label="Nilai total"
            value={nilai}
            onChangeText={setNilai}
            keyboardType="numeric"
            placeholder="300000"
            suffix="Rp"
            helper="Nilai produk saja, tanpa ongkos angkut."
          />
          {galat ? <ErrorState error={galat} title="Gagal mencatat" /> : null}
          <Button
            label="Catat transaksi"
            variant="secondary"
            loading={buatTransaksi.isPending}
            onPress={() => void catatTransaksi()}
          />
        </Stack>
      )}
    </Screen>
  );
}
