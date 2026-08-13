/**
 * Nearby places to take a harvest — the answer to "no buyer is registered
 * near me, now what?".
 *
 * DELIBERATELY A SEPARATE SCREEN FROM `MatchesScreen`. That one lists buyers
 * who posted a demand: someone who said they want this. This one lists places
 * that merely exist, taken from OpenStreetMap. Nobody here has agreed to buy
 * anything, so there is no price, no reputation, no contact and no "hubungi"
 * button — and every row says it is unverified. Blending the two would let a
 * building on a map pass for a buyer.
 *
 * LICENCE: the data is OpenStreetMap under ODbL, which makes attribution
 * mandatory wherever it is displayed. The backend returns `atribusi` in the
 * payload precisely so this screen cannot forget it. Do not remove the footer.
 */

import { useRoute, type RouteProp } from "@react-navigation/native";
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
import { useTempatPenyaluran } from "@/hooks/useMatches";
import { LABEL_JENIS_USAHA } from "@/lib/domain";
import { kilometer } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function VenuesScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, "TempatPenyaluran">>();

  const tempatPenyaluran = useTempatPenyaluran(params.idPenawaran);
  const tempat = tempatPenyaluran.data?.tempat ?? [];

  return (
    <Screen
      onRefresh={() => void tempatPenyaluran.refetch()}
      refreshing={tempatPenyaluran.isRefetching}
    >
      {tempatPenyaluran.data ? (
        <Card
          tone={tempat.length > 0 ? "info" : "warning"}
          title={`${tempatPenyaluran.data.jumlah} tempat dalam ${tempatPenyaluran.data.radius_km} km`}
          subtitle={tempatPenyaluran.data.pesan}
          className="mt-gutter"
        />
      ) : null}

      <SectionHeader
        title="Tempat terdekat"
        description="Bukan pembeli terdaftar. Belum ada yang menyatakan mau membeli."
        className="mt-section"
      />

      <View className="mt-gutter">
        <QueryState
          isLoading={tempatPenyaluran.isLoading}
          error={tempatPenyaluran.error}
          onRetry={() => void tempatPenyaluran.refetch()}
          isEmpty={tempat.length === 0}
          empty={{
            title: "Belum ada tempat tercatat di sekitar",
            description:
              "Coba bagikan kartu penawaran ke grup WhatsApp atau Facebook sebagai alternatif.",
            icon: "map-outline",
          }}
        >
          <Stack gap="snug">
            {tempat.map((t) => (
              <ListItem
                key={t.id}
                title={t.nama}
                subtitle={t.keterangan}
                badges={
                  <>
                    <Badge
                      label={kilometer(t.jarak_km)}
                      tone="info"
                      icon="navigate-outline"
                      className="mr-snug"
                    />
                    <Badge
                      label={LABEL_JENIS_USAHA[t.jenis_usaha]}
                      tone="neutral"
                      className="mr-snug"
                    />
                    {t.status_verifikasi === "dari_sumber_terbuka" ? (
                      <Badge
                        label="Belum diverifikasi"
                        tone="warning"
                        icon="alert-circle-outline"
                      />
                    ) : null}
                  </>
                }
              />
            ))}
          </Stack>
        </QueryState>
      </View>

      {/* ODbL attribution — required whenever the rows above are shown. */}
      {tempatPenyaluran.data ? (
        <Text variant="caption" tone="muted" className="mt-section">
          Sumber data: {tempatPenyaluran.data.atribusi} ({tempatPenyaluran.data.lisensi}).
          Daftar ini belum diverifikasi tim TERRA — hubungi atau datangi dulu
          sebelum mengangkut hasil panen.
        </Text>
      ) : null}
    </Screen>
  );
}
