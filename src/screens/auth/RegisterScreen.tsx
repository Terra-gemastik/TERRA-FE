/**
 * Registration — PRD A-01, A-02, A-03.
 *
 * Role is chosen first because it changes the rest of the form: farmers
 * declare their commodities, buyers declare a business type. The backend
 * returns a token on success, which signs the user straight in.
 */

import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { JenisUsaha, Komoditas, Peran } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import {
  Button,
  ErrorState,
  MultiSelect,
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

/**
 * Default fallback location.
 * Matches the seeded demo cluster so matching works immediately.
 */
const KOORDINAT_AWAL = {
  latitude: -6.8118,
  longitude: 107.6175,
};

export function RegisterScreen() {
  const { masuk } = useAuth();

  const daftarPetani = useDaftarPetani();
  const daftarPembeli = useDaftarPembeli();

  const [peran, setPeran] = useState<Peran>("petani");

  const [nama, setNama] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [alamat, setAlamat] = useState("");

  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);

  const [jenisUsaha, setJenisUsaha] = useState<JenisUsaha | null>(
    null,
  );

  const [namaUsaha, setNamaUsaha] = useState("");

  const [koordinat, setKoordinat] = useState(KOORDINAT_AWAL);

  const [lokasiAktif, setLokasiAktif] = useState(false);

  const [mengambilLokasi, setMengambilLokasi] = useState(false);

  const [galat, setGalat] = useState<unknown>(null);

  const sedangKirim =
    daftarPetani.isPending || daftarPembeli.isPending;

  const ambilLokasi = async () => {
    setMengambilLokasi(true);

    try {
      const posisi = await lokasiSaatIni();

      if (posisi) {
        setKoordinat(posisi);
        setLokasiAktif(true);
      }
    } finally {
      setMengambilLokasi(false);
    }
  };

  const kirim = async () => {
    setGalat(null);

    if (nama.trim().length < 2) {
      setGalat(new Error("Nama minimal 2 karakter."));
      return;
    }

    if (peran === "pembeli" && !jenisUsaha) {
      setGalat(
        new Error("Pilih jenis usaha terlebih dahulu."),
      );
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

      await masuk(hasil.token_akses);
    } catch (error) {
      setGalat(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-sunken">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-page pb-section">
            {/* HEADER */}
            <View className="pt-section">
              <Text variant="display">
                Buat akun
              </Text>

              <Text
                variant="body-lg"
                tone="secondary"
                className="mt-snug"
              >
                Lengkapi profil Anda untuk mulai menggunakan TERRA.
              </Text>
            </View>

            {/* ROLE */}
            <View className="mt-section">
              <Text variant="heading-sm">
                Pilih peran
              </Text>

              <Text
                variant="body-sm"
                tone="secondary"
                className="mt-tight"
              >
                Bagaimana Anda akan menggunakan TERRA?
              </Text>

              <View className="mt-gutter">
                <Select<Peran>
                  label="Peran"
                  value={peran}
                  onChange={setPeran}
                  options={[
                    {
                      value: "petani",
                      label: "Petani",
                      description:
                        "Menyalurkan hasil panen dan menemukan pemanfaatan yang sesuai.",
                    },
                    {
                      value: "pembeli",
                      label: "Pembeli / Mitra",
                      description:
                        "Mencari hasil panen sesuai kebutuhan usaha.",
                    },
                  ]}
                />
              </View>
            </View>

            {/* BASIC INFORMATION */}
            <View className="mt-section">
              <Text variant="heading-sm">
                Informasi dasar
              </Text>

              <Text
                variant="body-sm"
                tone="secondary"
                className="mt-tight"
              >
                Informasi yang membantu pengguna lain mengenali Anda.
              </Text>

              <Stack
                className="mt-gutter"
                gap="gutter"
              >
                <TextField
                  label="Nama"
                  value={nama}
                  onChangeText={setNama}
                  placeholder="Nama lengkap"
                  autoCapitalize="words"
                />

                <TextField
                  label="Nomor WhatsApp"
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  placeholder="6281234567890"
                  keyboardType="phone-pad"
                  helper="Digunakan untuk komunikasi dengan petani atau mitra."
                />

                <TextField
                  label="Lokasi umum"
                  value={alamat}
                  onChangeText={setAlamat}
                  placeholder="mis. Lembang, Bandung Barat"
                  autoCapitalize="words"
                  helper="Hanya area umum yang ditampilkan kepada pengguna lain."
                />
              </Stack>
            </View>

            {/* ROLE-SPECIFIC INFORMATION */}
            <View className="mt-section">
              <Text variant="heading-sm">
                {peran === "petani"
                  ? "Hasil pertanian"
                  : "Informasi usaha"}
              </Text>

              <Text
                variant="body-sm"
                tone="secondary"
                className="mt-tight"
              >
                {peran === "petani"
                  ? "Pilih komoditas yang biasa Anda hasilkan."
                  : "Beritahu kami jenis kebutuhan usaha Anda."}
              </Text>

              <View className="mt-gutter">
                {peran === "petani" ? (
                  <MultiSelect<Komoditas>
                    label="Komoditas utama"
                    values={komoditas}
                    onChange={setKomoditas}
                    options={OPSI_KOMODITAS.map(
                      (komoditasItem) => ({
                        value: komoditasItem,
                        label:
                          LABEL_KOMODITAS[
                            komoditasItem
                          ],
                      }),
                    )}
                    helper="Anda dapat memilih lebih dari satu."
                  />
                ) : (
                  <Stack gap="gutter">
                    <Select<JenisUsaha>
                      label="Jenis usaha"
                      value={jenisUsaha}
                      onChange={setJenisUsaha}
                      options={OPSI_JENIS_USAHA.map(
                        (usaha) => ({
                          value: usaha,
                          label:
                            LABEL_JENIS_USAHA[
                              usaha
                            ],
                        }),
                      )}
                      helper="Digunakan untuk membantu menemukan pasokan yang relevan."
                    />

                    <TextField
                      label="Nama usaha"
                      value={namaUsaha}
                      onChangeText={setNamaUsaha}
                      placeholder="mis. CV Saus Lembang"
                      autoCapitalize="words"
                    />
                  </Stack>
                )}
              </View>
            </View>

            {/* MATCHING LOCATION */}
            <View className="mt-section">
              <Text variant="heading-sm">
                Lokasi pencocokan
              </Text>

              <Text
                variant="body-sm"
                tone="secondary"
                className="mt-tight"
              >
                Membantu TERRA menemukan pihak yang relevan di sekitar Anda.
              </Text>

              <View className="mt-gutter">
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <Text variant="label">
                      Lokasi perangkat
                    </Text>

                    <Text
                      variant="body-sm"
                      tone="secondary"
                      className="mt-tight"
                    >
                      {lokasiAktif
                        ? "Lokasi berhasil digunakan untuk pencocokan."
                        : "Aktifkan lokasi untuk mendapatkan hasil pencocokan yang lebih relevan."}
                    </Text>
                  </View>

                  {lokasiAktif ? (
                    <View className="ml-gutter rounded-pill bg-success-surface px-snug py-tight">
                      <Text variant="caption">
                        Aktif
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View className="mt-gutter">
                  <Button
                    label={
                      lokasiAktif
                        ? "Perbarui lokasi"
                        : "Gunakan lokasi saya"
                    }
                    variant="secondary"
                    icon="location-outline"
                    loading={mengambilLokasi}
                    onPress={() =>
                      void ambilLokasi()
                    }
                  />
                </View>

                {!lokasiAktif ? (
                  <Text
                    variant="caption"
                    tone="muted"
                    className="mt-snug"
                  >
                    Jika tidak diaktifkan, area Lembang digunakan sebagai
                    titik awal.
                  </Text>
                ) : null}
              </View>
            </View>

            {/* ERROR */}
            {galat ? (
              <View className="mt-section">
                <ErrorState
                  error={galat}
                  title="Pendaftaran gagal"
                />
              </View>
            ) : null}

            {/* SUBMIT */}
            <View className="mt-section">
              <Button
                label="Buat akun"
                onPress={() => void kirim()}
                loading={sedangKirim}
              />

              <Text
                variant="caption"
                tone="muted"
                className="mt-snug text-center"
              >
                Profil digunakan untuk membantu pencocokan petani dan mitra
                di TERRA.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}