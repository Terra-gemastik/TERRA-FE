/**
 * Convenience aliases over the generated schema.
 *
 * `schema.d.ts` is generated from openapi.json and must never be hand-edited.
 * This file only gives its types shorter names so screens read well. If the
 * backend renames a field, regeneration changes `schema.d.ts` and every
 * consumer of these aliases fails to compile — which is the point.
 *
 * Domain names stay Indonesian, matching the backend and the PRD exactly
 * (context.md, "Naming Convention"). No translation layer means no drift.
 */

import type { components } from "./schema";

type S = components["schemas"];

// -- enums ------------------------------------------------------------------
export type Peran = S["Peran"];
export type Komoditas = S["Komoditas"];
export type Pemicu = S["Pemicu"];
export type KondisiKode = S["KondisiKode"];
export type TingkatKeparahan = S["TingkatKeparahan"];
export type KondisiPenyimpanan = S["KondisiPenyimpanan"];
export type MetodeKlasifikasi = S["MetodeKlasifikasi"];
export type JenisUsaha = S["JenisUsaha"];
export type TingkatUpaya = S["TingkatUpaya"];
export type StatusPenawaran = S["StatusPenawaran"];
export type StatusPermintaan = S["StatusPermintaan"];
export type StatusTransaksi = S["StatusTransaksi"];
export type StatusLaporan = S["StatusLaporan"];

// -- shared value objects ---------------------------------------------------
export type Koordinat = S["Koordinat"];
export type Citra = S["Citra"];
export type RentangHarga = S["RentangHarga"];
export type NilaiEstimasi = S["NilaiEstimasi"];
export type KetersediaanPembeli = S["KetersediaanPembeli"];

// -- onboarding (Epic A) ----------------------------------------------------
export type ProfilResponse = S["ProfilResponse"];
export type PendaftaranResponse = S["PendaftaranResponse"];
export type DaftarPetaniRequest = S["DaftarPetaniRequest"];
export type DaftarPembeliRequest = S["DaftarPembeliRequest"];
export type PerbaruiLokasiRequest = S["PerbaruiLokasiRequest"];
export type RingkasanPengguna = S["RingkasanPengguna"];

// -- classification (Epic B) ------------------------------------------------
export type KlasifikasiResponse = S["KlasifikasiResponse"];
export type KlasifikasiManualRequest = S["KlasifikasiManualRequest"];
export type RingkasanKlasifikasi = S["RingkasanKlasifikasi"];
export type VerifikasiCitra = S["VerifikasiCitra"];
export type Deteksi = S["Deteksi"];

// -- listings (§8) ----------------------------------------------------------
export type PenawaranResponse = S["PenawaranResponse"];
export type BuatPenawaranRequest = S["BuatPenawaranRequest"];
export type PermintaanResponse = S["PermintaanResponse"];
export type BuatPermintaanRequest = S["BuatPermintaanRequest"];

// -- recommendation (Epic C) ------------------------------------------------
export type RekomendasiResponse = S["RekomendasiResponse"];
export type OpsiRekomendasi = S["OpsiRekomendasi"];

// -- matching (Epics D/E) ---------------------------------------------------
export type HasilPencocokanResponse = S["HasilPencocokanResponse"];
export type PembeliCocok = S["PembeliCocok"];
export type KecocokanTercatat = S["KecocokanTercatat"];

// -- trust (Epic F) ---------------------------------------------------------
export type RingkasanReputasi = S["RingkasanReputasi"];
export type RingkasanTransaksi = S["RingkasanTransaksi"];
export type BuatTransaksiRequest = S["BuatTransaksiRequest"];
export type SelesaikanTransaksiRequest = S["SelesaikanTransaksiRequest"];
export type BuatLaporanRequest = S["BuatLaporanRequest"];
export type LaporanResponse = S["LaporanResponse"];
export type TinjauLaporanRequest = S["TinjauLaporanRequest"];

// -- notifications (Epic H) -------------------------------------------------
export type NotifikasiResponse = S["NotifikasiResponse"];

// -- community (Epic G) -----------------------------------------------------
export type KartuBerbagi = S["KartuBerbagi"];
export type PapanKomunitasResponse = S["PapanKomunitasResponse"];
export type PosKomunitas = S["PosKomunitas"];
export type BuatPosRequest = S["BuatPosRequest"];
export type PenawaranRingkasPapan = S["PenawaranRingkasPapan"];

// -- dashboard (Epic I) -----------------------------------------------------
export type DampakResponse = S["DampakResponse"];
export type RincianKomoditas = S["RincianKomoditas"];

/**
 * One photo ready for multipart upload.
 *
 * The backend's POST /klasifikasi takes `foto` as an array of file parts plus
 * flat form fields — never base64 in JSON. See `endpoints.klasifikasiOtomatis`.
 */
export type FotoUnggah = {
  uri: string;
  nama: string;
  tipe: string;
};
