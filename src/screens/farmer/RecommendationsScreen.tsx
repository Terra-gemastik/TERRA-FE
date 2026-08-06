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

import {
  Badge,
  Button,
  Card,
  KeyValue,
  QueryState,
  Screen,
  SectionHeader,
  Stack,
  Text,
} from "@/components/ui";
import { usePenawaran } from "@/hooks/useOffers";
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
              <Card key={`${o.id_aturan}-${o.nama}`} title={o.nama}>
                <View className="mt-snug">
                  <KeyValue
                    label="Perkiraan nilai"
                    value={rentangRupiah(
                      o.nilai_estimasi.min,
                      o.nilai_estimasi.max,
                      `/${o.nilai_estimasi.satuan?.replace("Rp/", "") ?? "kg"}`,
                    )}
                  />
                  <KeyValue label="Upaya" value={LABEL_UPAYA[o.tingkat_upaya]} />
                  <KeyValue
                    label="Ketersediaan pembeli"
                    value={o.keterangan_pembeli}
                    tone={o.ketersediaan_pembeli.ada ? "success" : "secondary"}
                  />
                </View>

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
      </Stack>

      {rekomendasi.data ? (
        <Text variant="caption" tone="muted" className="mt-gutter">
          Basis aturan versi {rekomendasi.data.versi_basis_aturan}. Isinya masih
          berasal dari studi literatur dan belum divalidasi lewat wawancara
          pembeli.
        </Text>
      ) : null}
    </Screen>
  );
}
