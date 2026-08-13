/**
 * Recommendations — PRD C-01 … C-05.
 *
 * Each option shows the rule id that produced it. That is not debug output:
 * PRD C-01's acceptance criteria and NF-06 require every recommendation to
 * trace to an explicit row in the knowledge base, so the trace is part of the
 * feature.
 */

import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  ErrorState,
  KeyValue,
  QueryState,
  Screen,
  SectionHeader,
  Stack,
  Text,
} from "@/components/ui";
import { usePenawaran, useTandaiTersalurkan } from "@/hooks/useOffers";
import { useRekomendasi } from "@/hooks/useRecommendations";
import { LABEL_KOMODITAS, LABEL_UPAYA } from "@/lib/domain";
import { kilogram, rentangRupiah } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function RecommendationsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, "Rekomendasi">>();

  const penawaran = usePenawaran(params.idPenawaran);
  const rekomendasi = useRekomendasi(params.idPenawaran);
  const tandaiTersalurkan = useTandaiTersalurkan();
  const [galatTandai, setGalatTandai] = useState<unknown>(null);

  /** PRD I-01: closing an offer is what makes it count toward impact. */
  const tandai = async () => {
    setGalatTandai(null);
    try {
      await tandaiTersalurkan.mutateAsync(params.idPenawaran);
    } catch (e) {
      setGalatTandai(e);
    }
  };

  const opsi = rekomendasi.data?.opsi ?? [];

  return (
    <Screen
      onRefresh={() => void rekomendasi.refetch()}
      refreshing={rekomendasi.isRefetching}
    >
      {penawaran.data ? (
        <Card
          title={`${LABEL_KOMODITAS[penawaran.data.komoditas]} · ${kilogram(
            penawaran.data.volume,
          )}`}
          subtitle={penawaran.data.keterangan_jendela}
          className="mt-gutter"
        />
      ) : null}

      <SectionHeader
        title="Opsi penyaluran"
        description="Diambil dari basis pengetahuan, bukan hasil tebakan model."
        className="mt-section"
      />

      <View className="mt-gutter">
        <QueryState
          isLoading={rekomendasi.isLoading}
          error={rekomendasi.error}
          onRetry={() => void rekomendasi.refetch()}
          isEmpty={opsi.length === 0}
          empty={{
            title: "Belum ada aturan yang cocok",
            description:
              rekomendasi.data?.catatan ??
              "Kombinasi komoditas dan kondisi ini belum ada di basis pengetahuan.",
            icon: "book-outline",
          }}
        >
          <Stack gap="snug">
            {opsi.map((o) => (
              <Card
                key={`${o.id_aturan}-${o.nama}`}
                title={o.nama}
                aside={<Badge label="Rekomendasi" tone="brand" icon="sparkles-outline" />}
              >
                <Text variant="label" tone="secondary" className="mt-gutter">
                  Estimasi nilai produk
                </Text>
                <Text variant="numeric" className="mt-tight">
                  {rentangRupiah(
                    o.nilai_estimasi.min,
                    o.nilai_estimasi.max,
                    `/${o.nilai_estimasi.satuan?.replace("Rp/", "") ?? "kg"}`,
                  )}
                </Text>
                <Text variant="caption" tone="muted" className="mt-tight">
                  Belum termasuk ongkos angkut.
                </Text>

                <View className="mt-gutter">
                  <KeyValue label="Upaya" value={LABEL_UPAYA[o.tingkat_upaya]} />
                </View>

                <Badge
                  label={`Pembeli: ${o.keterangan_pembeli}`}
                  tone={o.ketersediaan_pembeli.ada ? "success" : "warning"}
                  icon={
                    o.ketersediaan_pembeli.ada
                      ? "people-outline"
                      : "alert-circle-outline"
                  }
                  className="mt-snug"
                />

                {o.catatan ? (
                  <Text variant="body-sm" tone="secondary" className="mt-snug">
                    {o.catatan}
                  </Text>
                ) : null}

                {o.penyesuaian ? (
                  <Badge
                    label={o.penyesuaian}
                    tone="warning"
                    className="mt-snug"
                  />
                ) : null}

                {/* NF-06: the rule behind the recommendation, on screen. */}
                <Text variant="caption" tone="muted" className="mt-snug">
                  Dasar: {o.dasar_aturan}
                </Text>
              </Card>
            ))}
          </Stack>
        </QueryState>
      </View>

      <Stack className="mt-section">
        <Button
          label="Lihat pembeli terdekat"
          icon="navigate-outline"
          onPress={() =>
            navigation.navigate("Pencocokan", { idPenawaran: params.idPenawaran })
          }
        />
        {/*
          Fallback route when no buyer is registered nearby: places that exist
          on the map. Kept a separate destination from "pembeli terdekat" so a
          venue is never mistaken for someone who agreed to buy.
        */}
        <Button
          label="Tempat penyaluran di sekitar"
          variant="secondary"
          icon="map-outline"
          onPress={() =>
            navigation.navigate("TempatPenyaluran", {
              idPenawaran: params.idPenawaran,
            })
          }
        />
        <Button
          label="Bagikan kartu penawaran"
          variant="secondary"
          icon="share-social-outline"
          onPress={() =>
            navigation.navigate("KartuBerbagi", {
              idPenawaran: params.idPenawaran,
            })
          }
        />

        {/*
          PRD I-01. The impact dashboard reports `tingkat_penyaluran` as
          tersalurkan / dibuat, so until a farmer can actually set that status
          the figure stays at zero no matter how much they sell. This button is
          the only place in the app that closes an offer.

          Shown only while the offer is still open — once it is `tersalurkan`
          the card above replaces it with a confirmation.
        */}
        {penawaran.data && penawaran.data.status !== "tersalurkan" ? (
          <Button
            label="Tandai sudah tersalurkan"
            variant="secondary"
            icon="checkmark-done-outline"
            loading={tandaiTersalurkan.isPending}
            onPress={() => void tandai()}
          />
        ) : null}
      </Stack>

      {penawaran.data?.status === "tersalurkan" ? (
        <Card
          tone="success"
          title="Penawaran sudah tersalurkan"
          subtitle="Panen ini dihitung dalam dasbor dampak Anda."
          className="mt-gutter"
        />
      ) : null}

      {galatTandai ? (
        <ErrorState
          error={galatTandai}
          title="Gagal menandai"
          onRetry={() => void tandai()}
        />
      ) : null}

      {rekomendasi.data ? (
        <Text variant="caption" tone="muted" className="mt-gutter">
          Gunakan pilihan ini sebagai panduan awal, lalu pastikan kembali syarat
          dan harga dengan pembeli.
        </Text>
      ) : null}
    </Screen>
  );
}
