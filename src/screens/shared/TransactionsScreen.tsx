/**
 * Transaction history — the entry point for the trust actions.
 *
 * PRD §10.1 step 8 (both parties rate each other), F-06 (cancellation is
 * recorded against whoever cancelled), and F-04 (mismatch reports hang off a
 * transaction, which is why they are reached from here rather than from a tab
 * of their own).
 */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, View } from "react-native";

import type { RingkasanTransaksi } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import {
  Badge,
  Button,
  Card,
  ErrorState,
  KeyValue,
  QueryState,
  Screen,
  Select,
  Stack,
  Text,
} from "@/components/ui";
import {
  useBatalkanTransaksi,
  useSelesaikanTransaksi,
  useTransaksiSaya,
} from "@/hooks/useTrust";
import { LABEL_KOMODITAS, LABEL_STATUS_TRANSAKSI } from "@/lib/domain";
import { kilogram, rupiah, tanggal } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

const NILAI_RATING = ["1", "2", "3", "4", "5"] as const;
type NilaiRating = (typeof NILAI_RATING)[number];

export function TransactionsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { pengguna } = useAuth();

  const transaksi = useTransaksiSaya();
  const selesaikan = useSelesaikanTransaksi();
  const batalkan = useBatalkanTransaksi();

  const [rating, setRating] = useState<Record<string, NilaiRating>>({});
  const [galat, setGalat] = useState<unknown>(null);

  const sayaPetani = pengguna?.peran === "petani";

  const selesai = async (t: RingkasanTransaksi) => {
    setGalat(null);
    const nilai = rating[t.id_transaksi];
    if (!nilai) {
      setGalat(new Error("Beri penilaian untuk pihak lain terlebih dahulu."));
      return;
    }

    try {
      await selesaikan.mutateAsync({
        idTransaksi: t.id_transaksi,
        body: sayaPetani
          ? { rating_untuk_pembeli: Number(nilai), rating_untuk_petani: null, nilai_total: null }
          : { rating_untuk_petani: Number(nilai), rating_untuk_pembeli: null, nilai_total: null },
      });
    } catch (e) {
      setGalat(e);
    }
  };

  const konfirmasiBatal = (t: RingkasanTransaksi) => {
    Alert.alert(
      "Batalkan transaksi?",
      "Pembatalan setelah kesepakatan tercatat pada reputasi Anda dan terlihat oleh pihak lain.",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Batalkan",
          style: "destructive",
          onPress: () => batalkan.mutate({ idTransaksi: t.id_transaksi }),
        },
      ],
    );
  };

  const daftar = transaksi.data ?? [];

  return (
    <Screen
      onRefresh={() => void transaksi.refetch()}
      refreshing={transaksi.isRefetching}
    >
      {galat ? (
        <View className="mt-gutter">
          <ErrorState error={galat} />
        </View>
      ) : null}

      <View className="mt-gutter">
        <QueryState
          isLoading={transaksi.isLoading}
          error={transaksi.error}
          onRetry={() => void transaksi.refetch()}
          isEmpty={daftar.length === 0}
          empty={{
            title: "Belum ada transaksi",
            description:
              "Transaksi tercatat setelah Anda sepakat dengan pihak lain.",
            icon: "receipt-outline",
          }}
        >
          <Stack gap="snug">
            {daftar.map((t) => (
              <Card
                key={t.id_transaksi}
                title={`${LABEL_KOMODITAS[t.komoditas]} · ${kilogram(t.volume)}`}
                subtitle={`${rupiah(t.nilai_total)} · ${tanggal(t.waktu_selesai)}`}
                aside={
                  <Badge
                    label={LABEL_STATUS_TRANSAKSI[t.status]}
                    tone={
                      t.status === "selesai"
                        ? "success"
                        : t.status === "disepakati"
                          ? "info"
                          : "danger"
                    }
                  />
                }
              >
                <View className="mt-gutter">
                  <KeyValue label="ID" value={t.id_transaksi} />
                  <KeyValue
                    label={sayaPetani ? "Pembeli" : "Petani"}
                    value={sayaPetani ? t.id_pembeli : t.id_petani}
                  />
                </View>

                {t.status === "disepakati" ? (
                  <Stack gap="snug" className="mt-gutter">
                    <Select<NilaiRating>
                      label={`Penilaian untuk ${sayaPetani ? "pembeli" : "petani"}`}
                      value={rating[t.id_transaksi] ?? null}
                      onChange={(nilai) =>
                        setRating((s) => ({ ...s, [t.id_transaksi]: nilai }))
                      }
                      options={NILAI_RATING.map((n) => ({
                        value: n,
                        label: `${n} ★`,
                      }))}
                    />
                    <Button
                      label="Selesaikan transaksi"
                      variant="secondary"
                      loading={selesaikan.isPending}
                      onPress={() => void selesai(t)}
                    />
                    <Button
                      label="Batalkan"
                      variant="ghost"
                      onPress={() => konfirmasiBatal(t)}
                    />
                  </Stack>
                ) : null}

                {t.status === "selesai" && !sayaPetani ? (
                  <View className="mt-gutter">
                    <Button
                      label="Laporkan ketidaksesuaian"
                      variant="ghost"
                      icon="flag-outline"
                      onPress={() =>
                        navigation.navigate("LaporanKetidaksesuaian", {
                          idTransaksi: t.id_transaksi,
                        })
                      }
                    />
                  </View>
                ) : null}
              </Card>
            ))}
          </Stack>
        </QueryState>
      </View>

      <Text variant="caption" tone="muted" className="mt-section">
        TERRA mencatat kesepakatan, bukan memproses pembayaran. Nilai transaksi
        adalah nilai produk tanpa potongan ongkos angkut.
      </Text>
    </Screen>
  );
}
