/**
 * Buyer match list — PRD D-01 … D-05.
 *
 * Ranked by condition relevance then proximity. When the list is empty the
 * backend explains which filter removed each candidate (D acceptance
 * criteria), and that explanation is shown instead of a bare "no results".
 *
 * Distance is shown because it is a filter and a ranking input. It is never
 * turned into a cost — transport economics are out of scope (PRD §3.2).
 */

import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";

import {
  Badge,
  Card,
  ListItem,
  QueryState,
  Screen,
  SectionHeader,
  Stack,
  Text,
} from "@/components/ui";
import { useCariPembeli } from "@/hooks/useMatches";
import { LABEL_JENIS_USAHA } from "@/lib/domain";
import { kilogram, kilometer, rentangRupiah } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function MatchesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, "Pencocokan">>();

  const pencocokan = useCariPembeli(params.idPenawaran);
  const pembeli = pencocokan.data?.pembeli ?? [];
  const penyaringan = pencocokan.data?.ringkasan_penyaringan ?? {};

  return (
    <Screen
      onRefresh={() => void pencocokan.refetch()}
      refreshing={pencocokan.isRefetching}
    >
      {pencocokan.data ? (
        <Card
          tone={pembeli.length > 0 ? "default" : "warning"}
          title={`${pencocokan.data.jumlah_cocok} pembeli cocok`}
          subtitle={pencocokan.data.pesan}
          className="mt-gutter"
        >
          {Object.keys(penyaringan).length > 0 ? (
            <View className="mt-gutter">
              <Text variant="label" tone="secondary">
                Tersaring karena
              </Text>
              <View className="mt-tight flex-row flex-wrap">
                {Object.entries(penyaringan).map(([alasan, jumlah]) => (
                  <Badge
                    key={alasan}
                    label={`${jumlah}× ${alasan}`}
                    tone="neutral"
                    className="mr-snug"
                  />
                ))}
              </View>
            </View>
          ) : null}
        </Card>
      ) : null}

      <SectionHeader
        title="Urutan pembeli"
        description="Relevansi kondisi lebih dulu, lalu jarak."
        className="mt-section"
      />

      <View className="mt-gutter">
        <QueryState
          isLoading={pencocokan.isLoading}
          error={pencocokan.error}
          onRetry={() => void pencocokan.refetch()}
          isEmpty={pembeli.length === 0}
          empty={{
            title: "Tidak ada pembeli cocok",
            description:
              "Coba bagikan kartu penawaran ke grup WhatsApp atau Facebook sebagai alternatif.",
            icon: "search-outline",
          }}
        >
          <Stack gap="snug">
            {pembeli.map((b) => (
              <ListItem
                key={b.id_permintaan}
                title={b.nama_usaha ?? b.nama}
                subtitle={`${LABEL_JENIS_USAHA[b.jenis_usaha]} · ${
                  b.alamat_umum ?? "lokasi umum tidak diisi"
                }`}
                meta={`Butuh ${kilogram(b.volume_dibutuhkan)} · ${rentangRupiah(
                  b.rentang_harga.min,
                  b.rentang_harga.max,
                )}`}
                onPress={() =>
                  navigation.navigate("DetailPembeli", {
                    idPenawaran: params.idPenawaran,
                    idPembeli: b.id_pembeli,
                    idPermintaan: b.id_permintaan,
                  })
                }
                badges={
                  <>
                    <Badge
                      label={kilometer(b.jarak_km)}
                      tone="info"
                      icon="navigate-outline"
                      className="mr-snug"
                    />
                    <Badge
                      label={`Relevansi ${b.skor_relevansi.toFixed(2)}`}
                      tone="neutral"
                      className="mr-snug"
                    />
                    {b.reputasi?.tingkat_akurasi_deskripsi !== null &&
                    b.reputasi?.tingkat_akurasi_deskripsi !== undefined ? (
                      <Badge
                        label={`Keandalan ${Math.round(
                          b.reputasi.tingkat_akurasi_deskripsi * 100,
                        )}%`}
                        tone={
                          b.reputasi.tingkat_akurasi_deskripsi >= 0.8
                            ? "success"
                            : "warning"
                        }
                      />
                    ) : null}
                  </>
                }
              />
            ))}
          </Stack>
        </QueryState>
      </View>

      <Text variant="caption" tone="muted" className="mt-section">
        Jarak dipakai untuk menyaring radius dan mengurutkan kedekatan saja.
        TERRA tidak menghitung ongkos angkut.
      </Text>
    </Screen>
  );
}
