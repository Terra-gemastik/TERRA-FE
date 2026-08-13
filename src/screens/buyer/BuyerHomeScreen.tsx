/**
 * Buyer home — incoming supply, PRD E-02/E-03.
 *
 * These matches arrive without the buyer searching: publishing a farmer offer
 * runs it against every active demand server-side, and whatever matched lands
 * here. That is the "two-sided" claim the proposal rests on, so the screen
 * shows where each match came from rather than presenting a generic feed.
 */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import {
  Badge,
  Button,
  Card,
  ListItem,
  QueryState,
  Screen,
  SectionHeader,
  Stack,
  Text,
  UrgencyBadge,
  VerificationBadge,
} from "@/components/ui";
import { useKecocokanSaya } from "@/hooks/useMatches";
import { usePermintaanSaya } from "@/hooks/useDemands";
import { LABEL_KOMODITAS } from "@/lib/domain";
import { kilogram, kilometer, waktuRelatif } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function BuyerHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { pengguna } = useAuth();

  const { kecocokan, penawaranPerId, isLoading, error, refetch } =
    useKecocokanSaya();
  const permintaan = usePermintaanSaya();

  const daftar = kecocokan.data ?? [];
  const permintaanAktif =
    permintaan.data?.filter((p) => p.status === "aktif").length ?? 0;

  return (
    <Screen
      title={`Halo, ${pengguna?.nama ?? "Pembeli"}`}
      subtitle="Pasokan yang cocok dengan permintaan Anda."
      onRefresh={refetch}
      refreshing={kecocokan.isRefetching}
    >
      <Card
        tone={permintaanAktif > 0 ? "brand" : "warning"}
        title={`${permintaanAktif} permintaan aktif`}
        subtitle={
          permintaanAktif > 0
            ? "Petani dengan pasokan cocok akan otomatis muncul di sini."
            : "Tanpa permintaan aktif, tidak ada pasokan yang bisa dicocokkan."
        }
        className="mt-gutter"
      >
        <View className="mt-gutter">
          <Button
            label="Pasang permintaan baru"
            icon="add-circle-outline"
            onPress={() => navigation.navigate("PasangPermintaan")}
          />
        </View>
      </Card>

      <View className="mt-gutter flex-row">
        <View className="mr-snug flex-1">
          <Button
            label="Permintaan saya"
            variant="secondary"
            icon="clipboard-outline"
            onPress={() =>
              navigation.navigate("RootPembeli", { screen: "PermintaanSaya" })
            }
          />
        </View>
        <View className="flex-1">
          <Button
            label="Transaksi"
            variant="secondary"
            icon="receipt-outline"
            onPress={() => navigation.navigate("Transaksi")}
          />
        </View>
      </View>

      {/*
        The pull path. Everything above this point only shows supply that
        matched a demand the buyer posted, so a buyer with no active demand
        (or too tight a radius) sees an empty screen and cannot tell whether
        there is genuinely no supply. This is how they find out.
      */}
      <View className="mt-gutter">
        <Button
          label="Jelajahi semua pasokan"
          variant="secondary"
          icon="search-outline"
          onPress={() => navigation.navigate("JelajahPenawaran")}
        />
      </View>

      <SectionHeader
        title="Pasokan masuk"
        description="Tercatat otomatis saat petani memublikasikan panen yang cocok."
        className="mt-section"
      />

      <View className="mt-gutter">
        <QueryState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={daftar.length === 0}
          empty={{
            title: "Belum ada pasokan cocok",
            description:
              "Pastikan ada permintaan aktif dengan radius dan kondisi yang cukup longgar.",
            icon: "leaf-outline",
          }}
        >
          <Stack gap="snug">
            {daftar.map((k) => {
              const p = penawaranPerId[k.id_penawaran];
              return (
                <ListItem
                  key={k.id_kecocokan}
                  title={
                    p
                      ? `${LABEL_KOMODITAS[p.komoditas]} · ${kilogram(p.volume)}`
                      : k.id_penawaran
                  }
                  subtitle={p?.keterangan_jendela}
                  meta={`${waktuRelatif(k.waktu_dibuat)} · relevansi ${k.skor_relevansi.toFixed(
                    2,
                  )}`}
                  highlighted={Boolean(p?.mendesak)}
                  badges={
                    <>
                      <Badge
                        label={kilometer(k.jarak_km)}
                        tone="info"
                        icon="navigate-outline"
                        className="mr-snug"
                      />
                      {p ? (
                        <VerificationBadge
                          dilaporkanSendiri={p.dilaporkan_sendiri}
                          className="mr-snug"
                        />
                      ) : null}
                      {p?.mendesak ? <UrgencyBadge /> : null}
                    </>
                  }
                />
              );
            })}
          </Stack>
        </QueryState>
      </View>

      <Text variant="caption" tone="muted" className="mt-section">
        Pasokan baru akan muncul saat ada panen yang sesuai dengan permintaan Anda.
      </Text>
    </Screen>
  );
}
