/**
 * Registration — PRD A-01, A-02, A-03.
 *
 * Role is chosen first because it changes the rest of the form: farmers
 * declare their commodities, buyers declare a business type. The backend
 * returns a token on success, which signs the user straight in — there is no
 * separate login step to bounce through.
 */

import { useState } from "react";
import { View } from "react-native";

import type { JenisUsaha, Komoditas, Peran } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
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
import { useDaftarPembeli, useDaftarPetani } from "@/hooks/useProfile";
import {
  LABEL_JENIS_USAHA,
  LABEL_KOMODITAS,
  OPSI_JENIS_USAHA,
  OPSI_KOMODITAS,
} from "@/lib/domain";
import { lokasiSaatIni } from "@/lib/media";

/** Lembang — matches the backend's seeded demo cluster, so matching works immediately. */
const KOORDINAT_AWAL = { latitude: -6.8118, longitude: 107.6175 };

export function RegisterScreen() {
  const { masuk } = useAuth();
  const daftarPetani = useDaftarPetani();
  const daftarPembeli = useDaftarPembeli();

  const [peran, setPeran] = useState<Peran>("petani");
  const [nama, setNama] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [jenisUsaha, setJenisUsaha] = useState<JenisUsaha | null>(null);
  const [namaUsaha, setNamaUsaha] = useState("");
  const [koordinat, setKoordinat] = useState(KOORDINAT_AWAL);
  const [mengambilLokasi, setMengambilLokasi] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);

  const sedangKirim = daftarPetani.isPending || daftarPembeli.isPending;

  const ambilLokasi = async () => {
    setMengambilLokasi(true);
    const posisi = await lokasiSaatIni();
    if (posisi) setKoordinat(posisi);
    setMengambilLokasi(false);
  };

  const kirim = async () => {
    setGalat(null);

    if (nama.trim().length < 2) {
      setGalat(new Error("Nama minimal 2 karakter."));
      return;
    }
    if (peran === "pembeli" && !jenisUsaha) {
      setGalat(new Error("Pilih jenis usaha terlebih dahulu."));
      return;
    }

    try {
      const hasil =
        peran === "petani"
          ? await daftarPetani.mutateAsync({
              nama: nama.trim(),
              koordinat,
              komoditas_utama: komoditas,
              alamat_umum: alamat.trim() || null,
              nomor_whatsapp: whatsapp.trim() || null,
            })
          : await daftarPembeli.mutateAsync({
              nama: nama.trim(),
              jenis_usaha: jenisUsaha!,
              nama_usaha: namaUsaha.trim() || null,
              koordinat,
              alamat_umum: alamat.trim() || null,
              nomor_whatsapp: whatsapp.trim() || null,
            });

      // Registration is also the only token source, so sign in with it.
      await masuk(hasil.token_akses);
    } catch (e) {
      setGalat(e);
    }
  };

  return (
    <Screen title="Buat akun" subtitle="Tiga langkah, langsung bisa dipakai.">
      <Stack className="mt-gutter">
        <Select<Peran>
          label="Saya adalah"
          value={peran}
          onChange={setPeran}
          options={[
            { value: "petani", label: "Petani", description: "Punya hasil panen" },
            { value: "pembeli", label: "Pembeli", description: "Butuh bahan baku" },
          ]}
        />

        <TextField
          label="Nama"
          value={nama}
          onChangeText={setNama}
          placeholder="Nama lengkap"
        />

        <TextField
          label="Nomor WhatsApp"
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="6281234567890"
          keyboardType="phone-pad"
          helper="Dipakai pihak lain untuk menghubungi Anda."
        />

        <TextField
          label="Lokasi umum"
          value={alamat}
          onChangeText={setAlamat}
          placeholder="mis. Lembang, Bandung Barat"
          helper="Ditampilkan di kartu penawaran, bukan titik persisnya."
        />

        {peran === "petani" ? (
          <MultiSelect<Komoditas>
            label="Komoditas utama"
            values={komoditas}
            onChange={setKomoditas}
            options={OPSI_KOMODITAS.map((k) => ({
              value: k,
              label: LABEL_KOMODITAS[k],
            }))}
            helper="Boleh lebih dari satu."
          />
        ) : (
          <>
            <Select<JenisUsaha>
              label="Jenis usaha"
              value={jenisUsaha}
              onChange={setJenisUsaha}
              options={OPSI_JENIS_USAHA.map((j) => ({
                value: j,
                label: LABEL_JENIS_USAHA[j],
              }))}
              helper="Menentukan rekomendasi mana yang mengarah ke Anda."
            />
            <TextField
              label="Nama usaha"
              value={namaUsaha}
              onChangeText={setNamaUsaha}
              placeholder="mis. CV Saus Lembang"
            />
          </>
        )}

        <Card
          title="Titik lokasi"
          subtitle={`${koordinat.latitude.toFixed(4)}, ${koordinat.longitude.toFixed(4)}`}
        >
          <Text variant="caption" tone="muted" className="mt-snug">
            Dipakai untuk menghitung jarak ke pihak lain (Haversine). Tanpa GPS,
            titik contoh di Lembang akan dipakai.
          </Text>
          <View className="mt-gutter">
            <Button
              label="Gunakan lokasi saya"
              variant="secondary"
              icon="location-outline"
              loading={mengambilLokasi}
              onPress={() => void ambilLokasi()}
            />
          </View>
        </Card>

        {galat ? <ErrorState error={galat} title="Pendaftaran gagal" /> : null}

        <Button
          label="Daftar dan masuk"
          onPress={() => void kirim()}
          loading={sedangKirim}
        />
      </Stack>
    </Screen>
  );
}
