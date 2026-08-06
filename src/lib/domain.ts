/**
 * Human-readable labels for the backend's domain enums.
 *
 * TEXT ONLY — no colours, sizes, or anything visual. Which tone a condition
 * badge uses is a design decision and lives in src/components/ui/, so a
 * reskin never has to come here.
 *
 * Enum VALUES stay Indonesian and match the backend exactly (context.md,
 * "Naming Convention"). These maps only add the wording a user reads.
 */

import type {
  JenisUsaha,
  Komoditas,
  KondisiKode,
  KondisiPenyimpanan,
  MetodeKlasifikasi,
  Pemicu,
  Peran,
  StatusLaporan,
  StatusPenawaran,
  StatusPermintaan,
  StatusTransaksi,
  TingkatKeparahan,
  TingkatUpaya,
} from "@/api/types";

export const LABEL_KOMODITAS: Record<Komoditas, string> = {
  tomat: "Tomat",
  kentang: "Kentang",
  wortel: "Wortel",
  jagung: "Jagung",
  daun: "Sayuran daun",
};

export const LABEL_PEMICU: Record<Pemicu, string> = {
  cacat_mutu: "Cacat mutu",
  kelebihan_pasokan: "Kelebihan pasokan",
};

export const KETERANGAN_PEMICU: Record<Pemicu, string> = {
  cacat_mutu: "Panen ditolak karena tampilan atau kerusakan fisik.",
  kelebihan_pasokan: "Panen bagus, tapi pesanan dibatalkan atau pasar jenuh.",
};

/** PRD §11 condition taxonomy. */
export const LABEL_KONDISI: Record<KondisiKode, string> = {
  K0: "Mulus, tanpa cacat",
  K1: "Bentuk atau ukuran tidak seragam",
  K2: "Memar atau lecet",
  K3: "Busuk sebagian",
  K4: "Terlalu matang",
  K5: "Bekas serangan hama",
  K6: "Layu atau menguning",
};

export const LABEL_KEPARAHAN: Record<TingkatKeparahan, string> = {
  tidak_ada: "Tidak ada kerusakan",
  ringan: "Ringan",
  sedang: "Sedang",
  berat: "Berat",
};

export const LABEL_PENYIMPANAN: Record<KondisiPenyimpanan, string> = {
  terbuka: "Terbuka",
  tertutup: "Tertutup",
  berpendingin: "Berpendingin",
};

export const LABEL_JENIS_USAHA: Record<JenisUsaha, string> = {
  pengolah_pangan: "Pengolah pangan",
  peternak: "Peternak",
  produsen_kompos: "Produsen kompos",
  lainnya: "Lainnya",
};

export const LABEL_UPAYA: Record<TingkatUpaya, string> = {
  rendah: "Upaya rendah",
  sedang: "Upaya sedang",
  tinggi: "Upaya tinggi",
};

export const LABEL_STATUS_PENAWARAN: Record<StatusPenawaran, string> = {
  baru: "Baru",
  dicocokkan: "Dicocokkan",
  tersalurkan: "Tersalurkan",
  kedaluwarsa: "Kedaluwarsa",
};

export const LABEL_STATUS_PERMINTAAN: Record<StatusPermintaan, string> = {
  aktif: "Aktif",
  terpenuhi: "Terpenuhi",
  kedaluwarsa: "Kedaluwarsa",
};

export const LABEL_STATUS_TRANSAKSI: Record<StatusTransaksi, string> = {
  disepakati: "Disepakati",
  selesai: "Selesai",
  dibatalkan_pembeli: "Dibatalkan pembeli",
  dibatalkan_petani: "Dibatalkan petani",
};

export const LABEL_STATUS_LAPORAN: Record<StatusLaporan, string> = {
  menunggu: "Menunggu peninjauan",
  terkonfirmasi: "Terkonfirmasi",
  ditolak: "Ditolak",
};

export const LABEL_METODE: Record<MetodeKlasifikasi, string> = {
  otomatis: "Terverifikasi foto",
  manual_dilaporkan_sendiri: "Dilaporkan sendiri",
};

export const LABEL_PERAN: Record<Peran, string> = {
  petani: "Petani",
  pembeli: "Pembeli",
};

/** Option lists for pickers, in the order they should be shown. */
export const OPSI_KOMODITAS = Object.keys(LABEL_KOMODITAS) as Komoditas[];
export const OPSI_PEMICU = Object.keys(LABEL_PEMICU) as Pemicu[];
export const OPSI_KONDISI = Object.keys(LABEL_KONDISI) as KondisiKode[];
export const OPSI_KEPARAHAN = Object.keys(LABEL_KEPARAHAN) as TingkatKeparahan[];
export const OPSI_PENYIMPANAN = Object.keys(LABEL_PENYIMPANAN) as KondisiPenyimpanan[];
export const OPSI_JENIS_USAHA = Object.keys(LABEL_JENIS_USAHA) as JenisUsaha[];

/**
 * Which condition codes apply to which commodity.
 *
 * Mirrors the backend's KONDISI_PER_KOMODITAS so the manual-classification
 * picker does not offer combinations that will be rejected. THE BACKEND IS
 * AUTHORITATIVE — it validates and returns 422 regardless. This copy only
 * spares the user a pointless round trip.
 */
export const KONDISI_PER_KOMODITAS: Record<Komoditas, KondisiKode[]> = {
  tomat: ["K0", "K1", "K2", "K3", "K4"],
  kentang: ["K0", "K1", "K2", "K3", "K5"],
  wortel: ["K0", "K1", "K2", "K3"],
  jagung: ["K0", "K1", "K3", "K5"],
  daun: ["K0", "K6"],
};

/**
 * PRD B-03: leafy greens are supported for the oversupply path only — they
 * spoil in 3-4 days, too tight a window for the defect-sorting flow.
 */
export function kombinasiValid(komoditas: Komoditas, pemicu: Pemicu): boolean {
  return !(komoditas === "daun" && pemicu === "cacat_mutu");
}

export const ALASAN_KOMBINASI_TIDAK_VALID =
  "Sayuran daun hanya didukung untuk skenario kelebihan pasokan, bukan cacat mutu.";
