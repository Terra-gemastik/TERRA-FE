/** Buyer's own demands — PRD E-01, E-04. */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";

import {
  Badge,
  Button,
  ListItem,
  QueryState,
  Screen,
  Stack,
} from "@/components/ui";
import { usePermintaanSaya, useTutupPermintaan } from "@/hooks/useDemands";
import {
  LABEL_KEPARAHAN,
  LABEL_KOMODITAS,
  LABEL_STATUS_PERMINTAAN,
} from "@/lib/domain";
import { kilogram, rentangRupiah } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function MyDemandsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const permintaan = usePermintaanSaya();
  const tutup = useTutupPermintaan();

  const daftar = permintaan.data ?? [];

  return (
    <Screen
      title="Permintaan saya"
      subtitle="Permintaan aktif akan dicocokkan otomatis dengan pasokan baru."
      onRefresh={() => void permintaan.refetch()}
      refreshing={permintaan.isRefetching}
    >
      <View className="mt-gutter">
        <Button
          label="Pasang permintaan baru"
          icon="add-circle-outline"
          onPress={() => navigation.navigate("PasangPermintaan")}
        />
      </View>

      <View className="mt-section">
        <QueryState
          isLoading={permintaan.isLoading}
          error={permintaan.error}
          onRetry={() => void permintaan.refetch()}
          isEmpty={daftar.length === 0}
          empty={{
            title: "Belum ada permintaan",
            description:
              "Pasang satu permintaan agar petani dengan pasokan cocok bisa menemukan Anda.",
            icon: "clipboard-outline",
          }}
        >
          <Stack gap="snug">
            {daftar.map((p) => (
              <ListItem
                key={p.id_permintaan}
                title={p.komoditas_dicari
                  .map((k) => LABEL_KOMODITAS[k])
                  .join(", ")}
                subtitle={`Butuh ${kilogram(p.volume_dibutuhkan)} · min ${kilogram(
                  p.volume_minimum,
                )} · radius ${p.radius_maksimal} km`}
                meta={`Maks keparahan ${LABEL_KEPARAHAN[
                  p.keparahan_maksimal
                ].toLowerCase()} · ${rentangRupiah(
                  p.rentang_harga.min,
                  p.rentang_harga.max,
                )}`}
                badges={
                  <>
                    <Badge
                      label={LABEL_STATUS_PERMINTAAN[p.status]}
                      tone={p.status === "aktif" ? "success" : "neutral"}
                      className="mr-snug"
                    />
                    <Badge
                      label={`${p.kondisi_diterima.length} kondisi diterima`}
                      tone="neutral"
                    />
                  </>
                }
                right={
                  p.status === "aktif" ? (
                    <Button
                      label="Tutup"
                      variant="ghost"
                      size="sm"
                      fullWidth={false}
                      loading={
                        tutup.isPending && tutup.variables === p.id_permintaan
                      }
                      onPress={() => tutup.mutate(p.id_permintaan)}
                    />
                  ) : undefined
                }
              />
            ))}
          </Stack>
        </QueryState>
      </View>
    </Screen>
  );
}
