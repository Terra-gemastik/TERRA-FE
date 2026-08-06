/**
 * Share card — PRD G-01, G-02.
 *
 * The backend returns the card as DATA; this screen renders it and hands the
 * text to the OS share sheet. That covers "share to the WhatsApp/Facebook
 * group I already use" without the product growing a web surface.
 *
 * NOT COVERED, deliberately: PRD §6.7's acceptance criterion about the card
 * appearing as a WhatsApp *link preview*. A link preview needs a public HTML
 * page serving OG tags, and this product has no web frontend by decision. What
 * ships is the image URL, the facts, and a deep link back into the app.
 */

import { useRoute, type RouteProp } from "@react-navigation/native";
import { Image, Share, View } from "react-native";

import {
  Badge,
  Button,
  Card,
  KeyValue,
  QueryState,
  Screen,
  Stack,
  Text,
  UrgencyBadge,
} from "@/components/ui";
import { useCatatBerbagi, useKartuBerbagi } from "@/hooks/useCommunity";
import { LABEL_KOMODITAS } from "@/lib/domain";
import { kilogram } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

export function ShareCardScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, "KartuBerbagi">>();
  const kartu = useKartuBerbagi(params.idPenawaran);
  const catatBerbagi = useCatatBerbagi();

  const bagikan = async () => {
    if (!kartu.data) return;

    const hasil = await Share.share({
      message: kartu.data.teks_siap_bagikan,
      title: kartu.data.judul,
    });

    // PRD §12 `card_shared` — only recorded when the sheet actually completed.
    if (hasil.action === Share.sharedAction) {
      catatBerbagi.mutate({
        idPenawaran: params.idPenawaran,
        kanal: hasil.activityType ?? "lainnya",
      });
    }
  };

  return (
    <Screen>
      <QueryState
        isLoading={kartu.isLoading}
        error={kartu.error}
        onRetry={() => void kartu.refetch()}
      >
        {kartu.data ? (
          <>
            <Card title={kartu.data.judul} subtitle={kartu.data.ringkasan} className="mt-gutter">
              {kartu.data.url_foto ? (
                <Image
                  source={{ uri: kartu.data.url_foto }}
                  className="mt-gutter h-40 w-full rounded-control"
                  resizeMode="cover"
                />
              ) : null}

              <View className="mt-gutter flex-row flex-wrap">
                <Badge
                  label={kartu.data.label_verifikasi}
                  tone={
                    kartu.data.metode_klasifikasi === "manual_dilaporkan_sendiri"
                      ? "warning"
                      : "info"
                  }
                  className="mr-snug"
                />
                {kartu.data.mendesak ? <UrgencyBadge /> : null}
              </View>

              <View className="mt-gutter">
                <KeyValue
                  label="Komoditas"
                  value={LABEL_KOMODITAS[kartu.data.komoditas]}
                />
                <KeyValue label="Volume" value={kilogram(kartu.data.volume_kg)} />
                <KeyValue
                  label="Kondisi"
                  value={kartu.data.kondisi_terverifikasi}
                />
                <KeyValue label="Lokasi" value={kartu.data.lokasi_umum} />
                {kartu.data.sisa_jendela_hari !== null &&
                kartu.data.sisa_jendela_hari !== undefined ? (
                  <KeyValue
                    label="Sisa waktu"
                    value={`± ${kartu.data.sisa_jendela_hari} hari`}
                  />
                ) : null}
              </View>
            </Card>

            <Card title="Teks yang akan dibagikan" className="mt-gutter">
              <Text variant="body-sm" tone="secondary" className="mt-snug">
                {kartu.data.teks_siap_bagikan}
              </Text>
            </Card>

            <Stack className="mt-section">
              <Button
                label="Bagikan"
                icon="share-social-outline"
                onPress={() => void bagikan()}
              />
              <Text variant="caption" tone="muted">
                Lokasi yang dibagikan hanya area umum, bukan titik persis lahan
                Anda.
              </Text>
            </Stack>
          </>
        ) : null}
      </QueryState>
    </Screen>
  );
}
