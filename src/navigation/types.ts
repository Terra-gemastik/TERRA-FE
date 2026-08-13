/**
 * Navigation route map.
 *
 * One root stack. Which tab navigator it opens on is decided from the signed-in
 * user's role; the detail screens after that are shared, because a screen like
 * Transactions or MismatchReport is reached by both sides of a deal.
 */

import type { NavigatorScreenParams } from "@react-navigation/native";

import type { KlasifikasiResponse } from "@/api/types";

/** Offer fields collected before classification runs, carried through to creation. */
export type DrafPenawaran = {
  volume: number;
  lama_sejak_panen: number | null;
  kondisi_penyimpanan: "terbuka" | "tertutup" | "berpendingin" | null;
};

export type TabPetaniParamList = {
  BerandaPetani: undefined;
  KomunitasPetani: undefined;
  NotifikasiPetani: undefined;
  ProfilPetani: undefined;
};

export type TabPembeliParamList = {
  BerandaPembeli: undefined;
  PermintaanSaya: undefined;
  KomunitasPembeli: undefined;
  NotifikasiPembeli: undefined;
  ProfilPembeli: undefined;
};

export type RootStackParamList = {
  // -- unauthenticated
  Masuk: undefined;
  Daftar: undefined;
  Welcome: undefined;

  // -- role roots
  RootPetani: NavigatorScreenParams<TabPetaniParamList>;
  RootPembeli: NavigatorScreenParams<TabPembeliParamList>;

  /** Buyer's pull path: all open supply, not just what matched their demand. */
  JelajahPenawaran: undefined;

  // -- farmer flow (PRD §10.1)
  PenawaranBaru: undefined;
  HasilKlasifikasi: { hasil: KlasifikasiResponse; draf: DrafPenawaran };
  Rekomendasi: { idPenawaran: string };
  Pencocokan: { idPenawaran: string };
  /** Open-data venues near an offer. Not buyers — see VenuesScreen. */
  TempatPenyaluran: { idPenawaran: string };
  DetailPembeli: { idPenawaran: string; idPembeli: string; idPermintaan: string };
  KartuBerbagi: { idPenawaran: string };

  // -- buyer flow (PRD §10.2)
  PasangPermintaan: undefined;

  // -- shared
  Transaksi: undefined;
  LaporanKetidaksesuaian: { idTransaksi: string };
  Dampak: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
