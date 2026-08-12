/**
 * Post standing demand — PRD E-01, the reverse flow.
 *
 * `rentang_harga` is the price the buyer offers per kg OF PRODUCE. It is not a
 * shipping rate and not a net-of-transport figure — transport cost modelling
 * is out of scope (PRD §3.2).
 */

import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { View } from "react-native";

import type { KondisiKode, Komoditas, TingkatKeparahan } from "@/api/types";
import {
  Button,
  Card,
  ErrorState,
  MultiSelect,
  Screen,
  Select,
  Stack,
  Text,
  TextField,
} from "@/components/ui";
import { useBuatPermintaan } from "@/hooks/useDemands";
import {
  LABEL_KEPARAHAN,
  LABEL_KOMODITAS,
  LABEL_KONDISI,
  OPSI_KEPARAHAN,
  OPSI_KOMODITAS,
  OPSI_KONDISI,
} from "@/lib/domain";

export function PostDemandScreen() {
  const navigation = useNavigation();
  const buatPermintaan = useBuatPermintaan();

  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [kondisi, setKondisi] = useState<KondisiKode[]>([]);
  const [keparahan, setKeparahan] = useState<TingkatKeparahan | null>(null);
  const [volumeMin, setVolumeMin] = useState("0");
  const [volumeButuh, setVolumeButuh] = useState("");
  const [radius, setRadius] = useState("50");
  const [hargaMin, setHargaMin] = useState("");
  const [hargaMax, setHargaMax] = useState("");
  const [galat, setGalat] = useState<unknown>(null);

  const angka = (teks: string) => Number(teks.replace(/[^\d.]/g, ""));

  const bolehKirim =
    komoditas.length > 0 &&
    kondisi.length > 0 &&
    Boolean(keparahan) &&
    angka(volumeButuh) > 0 &&
    angka(radius) > 0;

  const kirim = async () => {
    setGalat(null);
    if (!keparahan) return;

    if (angka(volumeMin) > angka(volumeButuh)) {
      setGalat(
        new Error("Volume minimum tidak boleh melebihi volume yang dibutuhkan."),
      );
      return;
    }

    try {
      await buatPermintaan.mutateAsync({
        komoditas_dicari: komoditas,
        kondisi_diterima: kondisi,
        keparahan_maksimal: keparahan,
        volume_minimum: angka(volumeMin) || 0,
        volume_dibutuhkan: angka(volumeButuh),
        radius_maksimal: Math.round(angka(radius)),
        rentang_harga: {
          min: hargaMin ? angka(hargaMin) : null,
          max: hargaMax ? angka(hargaMax) : null,
          satuan: "Rp/kg",
        },
        koordinat: null, // defaults to the buyer's registered location
        berlaku_hingga: null,
      });
      navigation.goBack();
    } catch (e) {
      setGalat(e);
    }
  };

  return (
    <Screen>
      <Stack className="mt-gutter">
        <MultiSelect<Komoditas>
          label="Komoditas dicari"
          values={komoditas}
          onChange={setKomoditas}
          options={OPSI_KOMODITAS.map((k) => ({
            value: k,
            label: LABEL_KOMODITAS[k],
          }))}
        />

        <MultiSelect<KondisiKode>
          label="Kondisi yang diterima"
          values={kondisi}
          onChange={setKondisi}
          options={OPSI_KONDISI.map((k) => ({
            value: k,
            label: `${k} · ${LABEL_KONDISI[k]}`,
          }))}
          helper="Penawaran hanya cocok bila SEMUA kondisinya ada di daftar ini."
        />

        <Select<TingkatKeparahan>
          label="Keparahan maksimal"
          value={keparahan}
          onChange={setKeparahan}
          options={OPSI_KEPARAHAN.map((k) => ({
            value: k,
            label: LABEL_KEPARAHAN[k],
          }))}
        />

        <TextField
          label="Volume dibutuhkan"
          value={volumeButuh}
          onChangeText={setVolumeButuh}
          keyboardType="numeric"
          placeholder="800"
          suffix="kg"
        />

        <TextField
          label="Volume minimum per penawaran"
          value={volumeMin}
          onChangeText={setVolumeMin}
          keyboardType="numeric"
          suffix="kg"
          helper="Penawaran di bawah angka ini tidak akan ditampilkan ke Anda."
        />

        <TextField
          label="Radius maksimal"
          value={radius}
          onChangeText={setRadius}
          keyboardType="numeric"
          suffix="km"
          helper="Jarak diperkirakan dari lokasi Anda."
        />

        <Card title="Harga yang Anda tawarkan" subtitle="Per kg produk.">
          <View className="mt-gutter flex-row">
            <View className="mr-snug flex-1">
              <TextField
                label="Minimum"
                value={hargaMin}
                onChangeText={setHargaMin}
                keyboardType="numeric"
                placeholder="2000"
                suffix="Rp"
              />
            </View>
            <View className="flex-1">
              <TextField
                label="Maksimum"
                value={hargaMax}
                onChangeText={setHargaMax}
                keyboardType="numeric"
                placeholder="3500"
                suffix="Rp"
              />
            </View>
          </View>
          <Text variant="caption" tone="muted" className="mt-snug">
            Harga produk saja. TERRA tidak menghitung atau memotong ongkos angkut.
          </Text>
        </Card>

        {galat ? <ErrorState error={galat} title="Gagal memasang permintaan" /> : null}

        <Button
          label="Pasang permintaan"
          disabled={!bolehKirim}
          loading={buatPermintaan.isPending}
          onPress={() => void kirim()}
        />
      </Stack>
    </Screen>
  );
}
