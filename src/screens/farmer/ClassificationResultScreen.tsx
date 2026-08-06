/**
 * Classification result — PRD B-05 … B-08, F-01/F-02/F-03.
 *
 * Two paths out of this screen:
 *
 *   confidence OK      → publish the offer
 *   confidence LOW     → PRD B-06 forbids proceeding silently. The farmer
 *                        retakes the photo or sets the condition manually.
 *                        The backend enforces this too (it rejects an offer
 *                        built on a low-confidence classification), so this is
 *                        a real gate, not a UI suggestion.
 */

import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { View } from "react-native";

import type { KlasifikasiResponse, KondisiKode, TingkatKeparahan } from "@/api/types";
import {
  Badge,
  Button,
  Card,
  ConditionBadge,
  ErrorState,
  KeyValue,
  Screen,
  Select,
  SeverityBadge,
  Stack,
  Text,
  VerificationBadge,
} from "@/components/ui";
import { useKlasifikasiManual } from "@/hooks/useClassification";
import { useBuatPenawaran } from "@/hooks/useOffers";
import {
  KONDISI_PER_KOMODITAS,
  LABEL_KEPARAHAN,
  LABEL_KOMODITAS,
  LABEL_KONDISI,
  OPSI_KEPARAHAN,
} from "@/lib/domain";
import { persen } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function ClassificationResultScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, "HasilKlasifikasi">>();

  const [hasil, setHasil] = useState<KlasifikasiResponse>(params.hasil);
  const [manualKondisi, setManualKondisi] = useState<KondisiKode | null>(null);
  const [manualKeparahan, setManualKeparahan] = useState<TingkatKeparahan | null>(
    null,
  );
  const [galat, setGalat] = useState<unknown>(null);

  const buatPenawaran = useBuatPenawaran();
  const klasifikasiManual = useKlasifikasiManual();

  const perluManual = hasil.butuh_konfirmasi_manual;

  const terbitkan = async () => {
    setGalat(null);
    try {
      const penawaran = await buatPenawaran.mutateAsync({
        id_klasifikasi: hasil.id_klasifikasi,
        volume: params.draf.volume,
        lama_sejak_panen: params.draf.lama_sejak_panen,
        kondisi_penyimpanan: params.draf.kondisi_penyimpanan,
        citra: hasil.citra ?? [],
      });

      navigation.replace("Rekomendasi", { idPenawaran: penawaran.id_penawaran });
    } catch (e) {
      setGalat(e);
    }
  };

  const tetapkanManual = async () => {
    if (!manualKondisi || !manualKeparahan) return;
    setGalat(null);
    try {
      const baru = await klasifikasiManual.mutateAsync({
        komoditas: hasil.komoditas,
        pemicu: hasil.pemicu,
        jenis_kondisi: [manualKondisi],
        tingkat_keparahan: manualKeparahan,
        citra: hasil.citra ?? [],
        koordinat_ambil: null,
      });
      setHasil(baru);
    } catch (e) {
      setGalat(e);
    }
  };

  return (
    <Screen>
      <Card
        tone={perluManual ? "warning" : "default"}
        title={hasil.label_bahasa}
        subtitle={hasil.penjelasan}
        aside={
          <VerificationBadge
            dilaporkanSendiri={
              hasil.metode_klasifikasi === "manual_dilaporkan_sendiri"
            }
          />
        }
        className="mt-gutter"
      >
        <View className="mt-gutter flex-row flex-wrap">
          {hasil.jenis_kondisi.map((k) => (
            <ConditionBadge key={k} kode={k} showCode className="mr-snug" />
          ))}
          <SeverityBadge keparahan={hasil.tingkat_keparahan} />
        </View>

        <View className="mt-gutter">
          <KeyValue
            label="Tingkat keyakinan"
            value={
              hasil.skor_keyakinan === null || hasil.skor_keyakinan === undefined
                ? "Tidak berlaku (dilaporkan sendiri)"
                : persen(hasil.skor_keyakinan)
            }
          />
          <KeyValue
            label="Komoditas"
            value={LABEL_KOMODITAS[hasil.komoditas]}
          />
          <KeyValue label="Tindakan" value={hasil.tindakan_disarankan} />
        </View>
      </Card>

      {/* PRD F-01/F-02 — capture metadata check, reported not hidden. */}
      <Card
        title="Verifikasi foto"
        subtitle={hasil.verifikasi.catatan}
        tone={hasil.verifikasi.geotag_mencurigakan ? "warning" : "default"}
        className="mt-gutter"
      >
        <View className="mt-snug flex-row flex-wrap">
          <Badge
            label={
              hasil.verifikasi.metadata_lengkap
                ? "Metadata lengkap"
                : "Metadata tidak lengkap"
            }
            tone={hasil.verifikasi.metadata_lengkap ? "success" : "warning"}
            className="mr-snug"
          />
          {hasil.verifikasi.jarak_dari_lokasi_terdaftar_km !== null &&
          hasil.verifikasi.jarak_dari_lokasi_terdaftar_km !== undefined ? (
            <Badge
              label={`${hasil.verifikasi.jarak_dari_lokasi_terdaftar_km} km dari lokasi terdaftar`}
              tone={hasil.verifikasi.geotag_mencurigakan ? "danger" : "neutral"}
            />
          ) : null}
        </View>
      </Card>

      {hasil.sumber_placeholder ? (
        <Card tone="info" className="mt-gutter">
          <Text variant="body-sm" tone="info">
            Hasil ini berasal dari pengklasifikasi tiruan di backend, bukan model
            YOLO terlatih. Bentuk datanya sudah final — yang berubah nanti hanya
            isinya.
          </Text>
        </Card>
      ) : null}

      {perluManual ? (
        <Card
          tone="warning"
          title="Keyakinan terlalu rendah"
          subtitle="Penawaran belum bisa dibuat dari hasil ini. Ambil ulang foto, atau tetapkan kondisi sendiri."
          className="mt-gutter"
        >
          <Stack gap="snug" className="mt-gutter">
            <Select<KondisiKode>
              label="Kondisi menurut Anda"
              value={manualKondisi}
              onChange={setManualKondisi}
              options={KONDISI_PER_KOMODITAS[hasil.komoditas].map((k) => ({
                value: k,
                label: LABEL_KONDISI[k],
              }))}
            />
            <Select<TingkatKeparahan>
              label="Tingkat keparahan"
              value={manualKeparahan}
              onChange={setManualKeparahan}
              options={OPSI_KEPARAHAN.map((k) => ({
                value: k,
                label: LABEL_KEPARAHAN[k],
              }))}
            />
            <Button
              label="Tetapkan kondisi ini"
              variant="secondary"
              disabled={!manualKondisi || !manualKeparahan}
              loading={klasifikasiManual.isPending}
              onPress={() => void tetapkanManual()}
            />
            <Text variant="caption" tone="muted">
              Penawaran akan ditandai “dilaporkan sendiri” saat dilihat pembeli.
            </Text>
            <Button
              label="Ambil ulang foto"
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
          </Stack>
        </Card>
      ) : null}

      {galat ? (
        <View className="mt-gutter">
          <ErrorState error={galat} title="Gagal membuat penawaran" />
        </View>
      ) : null}

      <View className="mt-section">
        <Button
          label="Terbitkan penawaran"
          icon="checkmark-circle-outline"
          disabled={perluManual}
          loading={buatPenawaran.isPending}
          onPress={() => void terbitkan()}
        />
      </View>
    </Screen>
  );
}
