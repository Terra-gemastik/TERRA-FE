/**
 * Browse all open supply — the buyer's pull path.
 *
 * WHY THIS EXISTS ALONGSIDE BuyerHomeScreen
 *   The home screen is the PUSH path: offers that matched a demand the buyer
 *   already posted (PRD E-02/E-03). It only ever shows supply the buyer's own
 *   filters let through, which means a buyer with no active demand — or with a
 *   tight radius — sees nothing and has no way to tell whether that is because
 *   there is no supply or because their demand is too narrow.
 *
 *   This screen answers that: everything currently on offer, filterable by
 *   commodity, regardless of whether it matched anything.
 *
 * NOT A CHECKOUT. Terra records agreements, it does not process payment
 * (PRD §3.2). There is no cart and no price here — contact happens through the
 * farmer's own channel once a buyer decides to pursue an offer.
 */

import { useState } from "react";
import { View } from "react-native";

import type { Komoditas } from "@/api/types";
import {
  Badge,
  Card,
  ConditionBadge,
  QueryState,
  Screen,
  SectionHeader,
  Select,
  Stack,
  Text,
  UrgencyBadge,
  VerificationBadge,
} from "@/components/ui";
import { useDaftarPenawaran } from "@/hooks/useOffers";
import { LABEL_KOMODITAS, OPSI_KOMODITAS } from "@/lib/domain";
import { kilogram } from "@/lib/format";

/** `Select` is generic over string, so "no filter" needs a sentinel value. */
const SEMUA = "semua";
type SaringanKomoditas = Komoditas | typeof SEMUA;

export function BrowseOffersScreen() {
  const [komoditas, setKomoditas] = useState<SaringanKomoditas>(SEMUA);

  // `status: "baru"` keeps already-distributed harvest out of the list -- an
  // offer that is gone is noise, not supply.
  const penawaran = useDaftarPenawaran({
    komoditas: komoditas === SEMUA ? undefined : komoditas,
    status: "baru",
  });

  const daftar = penawaran.data ?? [];

  return (
    <Screen
      onRefresh={() => void penawaran.refetch()}
      refreshing={penawaran.isRefetching}
    >
      <Card
        title="Semua pasokan terbuka"
        subtitle="Termasuk yang belum cocok dengan permintaan Anda."
        className="mt-gutter"
      >
        <View className="mt-gutter">
          <Select<SaringanKomoditas>
            label="Saring komoditas"
            value={komoditas}
            onChange={setKomoditas}
            options={[
              { value: SEMUA, label: "Semua" },
              ...OPSI_KOMODITAS.map((k) => ({
                value: k as SaringanKomoditas,
                label: LABEL_KOMODITAS[k],
              })),
            ]}
          />
        </View>
      </Card>

      <SectionHeader
        title={`${daftar.length} penawaran tersedia`}
        description="Diurutkan dari yang terbaru."
        className="mt-section"
      />

      <View className="mt-gutter">
        <QueryState
          isLoading={penawaran.isLoading}
          error={penawaran.error}
          onRetry={() => void penawaran.refetch()}
          isEmpty={daftar.length === 0}
          empty={{
            title: "Belum ada pasokan terbuka",
            description: komoditas
              ? "Coba pilih komoditas lain atau lihat semua."
              : "Belum ada petani yang memublikasikan panen saat ini.",
            icon: "leaf-outline",
          }}
        >
          <Stack gap="snug">
            {daftar.map((p) => (
              <Card
                key={p.id_penawaran}
                title={`${LABEL_KOMODITAS[p.komoditas]} · ${kilogram(p.volume)}`}
                subtitle={p.keterangan_jendela}
                tone={p.mendesak ? "warning" : "default"}
              >
                <View className="mt-gutter flex-row flex-wrap">
                  {p.jenis_kondisi.map((k) => (
                    <ConditionBadge key={k} kode={k} className="mb-tight mr-snug" />
                  ))}
                  <VerificationBadge
                    dilaporkanSendiri={p.dilaporkan_sendiri}
                    className="mb-tight mr-snug"
                  />
                  {p.mendesak ? <UrgencyBadge className="mb-tight mr-snug" /> : null}
                  {p.jumlah_permintaan_cocok > 0 ? (
                    <Badge
                      label={`${p.jumlah_permintaan_cocok} permintaan cocok`}
                      tone="info"
                      className="mb-tight"
                    />
                  ) : null}
                </View>
              </Card>
            ))}
          </Stack>
        </QueryState>
      </View>

      <Text variant="caption" tone="muted" className="mt-section">
        Daftar ini tidak disaring oleh radius atau kondisi permintaan Anda.
        Pasang permintaan agar pasokan yang cocok muncul otomatis di beranda.
      </Text>
    </Screen>
  );
}
