/** Farmer home — own offers, urgent first. Entry point to the §10.1 flow. */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import {
  Button,
  Card,
  QueryState,
  SectionHeader,
  Screen,
  Stack,
  Text,
  UrgencyBadge,
  VerificationBadge,
  Badge,
  ListItem,
} from "@/components/ui";
import { usePenawaranSaya } from "@/hooks/useOffers";
import { LABEL_KOMODITAS, LABEL_STATUS_PENAWARAN } from "@/lib/domain";
import { kilogram } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function FarmerHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { pengguna } = useAuth();
  const penawaran = usePenawaranSaya();

  const daftar = penawaran.data ?? [];
  const mendesak = daftar.filter((p) => p.mendesak && p.status !== "tersalurkan");

  return (
    <Screen
      title={`Halo, ${pengguna?.nama ?? "Petani"}`}
      subtitle="Punya panen yang tidak terserap? Mulai dari foto."
      onRefresh={() => void penawaran.refetch()}
      refreshing={penawaran.isRefetching}
    >
      <Card
        tone="brand"
        title="Analisis kondisi panen"
        subtitle="Ambil foto, lengkapi data singkat, lalu lihat rekomendasi penyaluran."
        className="mt-gutter"
      >
        <View className="mt-gutter">
          <Button
            label="Tambah hasil panen"
            icon="camera-outline"
            onPress={() => navigation.navigate("PenawaranBaru")}
          />
        </View>
      </Card>

      <View className="mt-gutter flex-row">
        <View className="mr-snug flex-1">
          <Button
            label="Lihat transaksi"
            variant="secondary"
            icon="receipt-outline"
            onPress={() => navigation.navigate("Transaksi")}
          />
        </View>
        <View className="flex-1">
          <Button
            label="Komunitas"
            variant="secondary"
            icon="people-outline"
            onPress={() =>
              navigation.navigate("RootPetani", { screen: "KomunitasPetani" })
            }
          />
        </View>
      </View>

      {mendesak.length > 0 ? (
        <Card
          tone="danger"
          title={`${mendesak.length} penawaran mendesak`}
          subtitle="Sisa umur simpan pendek — prioritaskan yang ini."
          className="mt-gutter"
        />
      ) : null}

      <SectionHeader
        title="Penawaran saya"
        description="Ketuk untuk melihat opsi penyaluran dan pembeli."
        className="mt-section"
      />

      <View className="mt-gutter">
        <QueryState
          isLoading={penawaran.isLoading}
          error={penawaran.error}
          onRetry={() => void penawaran.refetch()}
          isEmpty={daftar.length === 0}
          empty={{
            title: "Belum ada penawaran",
            description:
              "Foto hasil panen Anda, sistem akan membaca kondisinya dan mencarikan pembeli terdekat.",
            icon: "leaf-outline",
          }}
        >
          <Stack gap="snug">
            {daftar.map((p) => (
              <ListItem
                key={p.id_penawaran}
                title={`${LABEL_KOMODITAS[p.komoditas]} · ${kilogram(p.volume)}`}
                subtitle={p.keterangan_jendela}
                meta={`Status: ${LABEL_STATUS_PENAWARAN[p.status]}`}
                highlighted={p.mendesak}
                onPress={() =>
                  navigation.navigate("Rekomendasi", {
                    idPenawaran: p.id_penawaran,
                  })
                }
                badges={
                  <>
                    <VerificationBadge
                      dilaporkanSendiri={p.dilaporkan_sendiri}
                      className="mr-snug"
                    />
                    {p.mendesak ? <UrgencyBadge className="mr-snug" /> : null}
                    {p.jumlah_permintaan_cocok > 0 ? (
                      <Badge
                        label={`${p.jumlah_permintaan_cocok} permintaan cocok`}
                        tone="success"
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
        Foto membantu pembeli memahami kondisi panen sebelum menghubungi Anda.
      </Text>
    </Screen>
  );
}
