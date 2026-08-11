/**
 * Frontend-facing aliases for the OpenAPI schemas.
 *
 * `schema.d.ts` remains the generated source of truth. These concrete aliases
 * mirror the schema fields the app consumes so React Query can preserve types
 * through hooks and screens under strict TypeScript.
 */

// -- enums ------------------------------------------------------------------
export type Peran = "petani" | "pembeli";
export type Komoditas = "tomat" | "kentang" | "wortel" | "jagung" | "daun";
export type Pemicu = "cacat_mutu" | "kelebihan_pasokan";
export type KondisiKode = "K0" | "K1" | "K2" | "K3" | "K4" | "K5" | "K6";
export type TingkatKeparahan = "tidak_ada" | "ringan" | "sedang" | "berat";
export type KondisiPenyimpanan = "terbuka" | "tertutup" | "berpendingin";
export type MetodeKlasifikasi = "otomatis" | "manual_dilaporkan_sendiri";
export type JenisUsaha =
  | "pengolah_pangan"
  | "peternak"
  | "produsen_kompos"
  | "lainnya";
export type TingkatUpaya = "rendah" | "sedang" | "tinggi";
export type StatusPenawaran = "baru" | "dicocokkan" | "tersalurkan" | "kedaluwarsa";
export type StatusPermintaan = "aktif" | "terpenuhi" | "kedaluwarsa";
export type StatusTransaksi =
  | "disepakati"
  | "selesai"
  | "dibatalkan_pembeli"
  | "dibatalkan_petani";
export type StatusLaporan = "menunggu" | "terkonfirmasi" | "ditolak";

// -- shared value objects ---------------------------------------------------
export type Koordinat = {
  latitude: number;
  longitude: number;
};

export type Citra = {
  url: string;
  waktu_ambil: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type RentangHarga = {
  min?: number | null;
  max?: number | null;
  satuan: string;
};

export type NilaiEstimasi = {
  min: number;
  max: number;
  satuan: string;
};

export type KetersediaanPembeli = {
  ada: boolean;
  jumlah: number;
  jarak_terdekat_km?: number | null;
};

// -- onboarding (Epic A) ----------------------------------------------------
export type RingkasanReputasi = {
  id_pengguna: string;
  peran: Peran;
  jumlah_transaksi: number;
  skor_rata_rata?: number | null;
  jumlah_laporan_ketidaksesuaian: number;
  jumlah_pembatalan_sepihak: number;
  tingkat_akurasi_deskripsi?: number | null;
  ringkasan_teks: string;
};

export type ProfilResponse = {
  id_pengguna: string;
  nama: string;
  peran: Peran;
  koordinat: Koordinat;
  alamat_umum?: string | null;
  nomor_whatsapp?: string | null;
  komoditas_utama?: Komoditas[];
  jenis_usaha?: JenisUsaha | null;
  nama_usaha?: string | null;
  reputasi?: RingkasanReputasi | null;
};

export type PendaftaranResponse = ProfilResponse & {
  token_akses: string;
};

export type DaftarPetaniRequest = {
  nama: string;
  koordinat: Koordinat;
  komoditas_utama?: Komoditas[];
  alamat_umum?: string | null;
  nomor_whatsapp?: string | null;
};

export type DaftarPembeliRequest = {
  nama: string;
  jenis_usaha: JenisUsaha;
  nama_usaha?: string | null;
  koordinat: Koordinat;
  alamat_umum?: string | null;
  nomor_whatsapp?: string | null;
};

export type PerbaruiLokasiRequest = {
  koordinat: Koordinat;
  alamat_umum?: string | null;
};

export type RingkasanPengguna = {
  id_pengguna: string;
  nama: string;
  peran: Peran;
  koordinat: Koordinat;
  alamat_umum?: string | null;
  nomor_whatsapp?: string | null;
  jenis_usaha?: JenisUsaha | null;
  nama_usaha?: string | null;
  komoditas_utama?: Komoditas[];
};

// -- classification (Epic B) ------------------------------------------------
export type Deteksi = {
  kelas: KondisiKode;
  keyakinan: number;
  kotak: number[];
};

export type VerifikasiCitra = {
  metadata_lengkap: boolean;
  geotag_mencurigakan: boolean;
  jarak_dari_lokasi_terdaftar_km?: number | null;
  catatan: string;
};

export type KlasifikasiResponse = {
  id_klasifikasi: string;
  komoditas: Komoditas;
  pemicu: Pemicu;
  jenis_kondisi: KondisiKode[];
  tingkat_keparahan: TingkatKeparahan;
  skor_keyakinan: number | null;
  metode_klasifikasi: MetodeKlasifikasi;
  label_bahasa: string;
  penjelasan: string;
  butuh_konfirmasi_manual: boolean;
  tindakan_disarankan: string;
  deteksi?: Deteksi[];
  citra?: Citra[];
  verifikasi: VerifikasiCitra;
  sumber_placeholder: boolean;
};

export type KlasifikasiManualRequest = {
  komoditas: Komoditas;
  pemicu: Pemicu;
  jenis_kondisi: KondisiKode[];
  tingkat_keparahan: TingkatKeparahan;
  citra?: Citra[];
  koordinat_ambil?: Koordinat | null;
};

export type RingkasanKlasifikasi = {
  id_klasifikasi: string;
  komoditas: Komoditas;
  pemicu: Pemicu;
  jenis_kondisi: KondisiKode[];
  tingkat_keparahan: TingkatKeparahan;
  skor_keyakinan: number;
  metode_klasifikasi: MetodeKlasifikasi;
  label_bahasa: string;
  butuh_konfirmasi_manual: boolean;
  citra?: Citra[];
};

// -- listings (§8) ----------------------------------------------------------
export type PenawaranResponse = {
  id_penawaran: string;
  id_petani: string;
  pemicu: Pemicu;
  komoditas: Komoditas;
  jenis_kondisi: KondisiKode[];
  tingkat_keparahan: TingkatKeparahan;
  skor_keyakinan: number | null;
  metode_klasifikasi: MetodeKlasifikasi;
  dilaporkan_sendiri: boolean;
  volume: number;
  lama_sejak_panen?: number | null;
  kondisi_penyimpanan?: KondisiPenyimpanan | null;
  sisa_jendela_hari?: number | null;
  mendesak: boolean;
  keterangan_jendela: string;
  koordinat: Koordinat;
  status: StatusPenawaran;
  citra?: Citra[];
  jumlah_permintaan_cocok: number;
};

export type BuatPenawaranRequest = {
  id_klasifikasi?: string | null;
  komoditas?: Komoditas | null;
  pemicu?: Pemicu | null;
  jenis_kondisi?: KondisiKode[] | null;
  tingkat_keparahan?: TingkatKeparahan | null;
  volume: number;
  lama_sejak_panen?: number | null;
  kondisi_penyimpanan?: KondisiPenyimpanan | null;
  citra?: Citra[];
};

export type PermintaanResponse = {
  id_permintaan: string;
  id_pembeli: string;
  jenis_usaha: JenisUsaha;
  komoditas_dicari: Komoditas[];
  kondisi_diterima: KondisiKode[];
  keparahan_maksimal: TingkatKeparahan;
  volume_minimum: number;
  volume_dibutuhkan: number;
  radius_maksimal: number;
  rentang_harga: RentangHarga;
  koordinat: Koordinat;
  status: StatusPermintaan;
};

export type BuatPermintaanRequest = {
  komoditas_dicari: Komoditas[];
  kondisi_diterima: KondisiKode[];
  keparahan_maksimal: TingkatKeparahan;
  volume_minimum: number;
  volume_dibutuhkan: number;
  radius_maksimal: number;
  rentang_harga?: RentangHarga;
  koordinat?: Koordinat | null;
  berlaku_hingga?: string | null;
};

// -- recommendation (Epic C) ------------------------------------------------
export type OpsiRekomendasi = {
  nama: string;
  nilai_estimasi: NilaiEstimasi;
  tingkat_upaya: TingkatUpaya;
  catatan: string;
  jenis_usaha_pembeli?: JenisUsaha[];
  ketersediaan_pembeli: KetersediaanPembeli;
  keterangan_pembeli: string;
  id_aturan: string;
  dasar_aturan: string;
  penyesuaian?: string | null;
};

export type RekomendasiResponse = {
  id_penawaran: string;
  komoditas: Komoditas;
  jenis_kondisi: KondisiKode[];
  tingkat_keparahan: TingkatKeparahan;
  sisa_jendela_hari?: number | null;
  opsi?: OpsiRekomendasi[];
  catatan?: string | null;
  versi_basis_aturan: number;
};

// -- matching (Epics D/E) ---------------------------------------------------
export type PembeliCocok = {
  id_permintaan: string;
  id_pembeli: string;
  nama: string;
  nama_usaha?: string | null;
  jenis_usaha: JenisUsaha;
  alamat_umum?: string | null;
  jarak_km: number;
  skor_relevansi: number;
  alasan: Record<string, unknown>;
  volume_dibutuhkan: number;
  volume_minimum: number;
  keparahan_maksimal: TingkatKeparahan;
  rentang_harga: RentangHarga;
  reputasi?: RingkasanReputasi | null;
  tautan_whatsapp?: string | null;
};

export type HasilPencocokanResponse = {
  id_penawaran: string;
  komoditas: Komoditas;
  jumlah_cocok: number;
  pembeli?: PembeliCocok[];
  pesan: string;
  ringkasan_penyaringan?: Record<string, number>;
};

export type KecocokanTercatat = {
  id_kecocokan: string;
  id_penawaran: string;
  id_permintaan: string | null;
  arah: string;
  jarak_km: number;
  skor_relevansi: number;
  alasan: Record<string, unknown>;
  waktu_dibuat: string;
};

// -- trust (Epic F) ---------------------------------------------------------
export type RingkasanTransaksi = {
  id_transaksi: string;
  id_penawaran: string | null;
  id_petani: string;
  id_pembeli: string;
  komoditas: Komoditas;
  volume: number;
  nilai_total: number;
  status: StatusTransaksi;
  waktu_selesai?: string | null;
};

export type BuatTransaksiRequest = {
  id_penawaran: string;
  id_pembeli: string;
  volume: number;
  nilai_total: number;
};

export type SelesaikanTransaksiRequest = {
  rating_untuk_petani?: number | null;
  rating_untuk_pembeli?: number | null;
  nilai_total?: number | null;
};

export type BuatLaporanRequest = {
  id_transaksi: string;
  kondisi_ditemukan: KondisiKode[];
  catatan?: string | null;
  foto_pembanding?: Citra[];
};

export type LaporanResponse = {
  id_laporan: string;
  id_transaksi: string;
  id_pelapor: string;
  id_terlapor: string;
  kondisi_diklaim: KondisiKode[];
  kondisi_ditemukan: KondisiKode[];
  catatan?: string | null;
  foto_pembanding?: Citra[];
  status: StatusLaporan;
  waktu_dibuat: string;
  keterangan_dampak: string;
};

export type TinjauLaporanRequest = {
  status: StatusLaporan;
};

// -- notifications (Epic H) -------------------------------------------------
export type NotifikasiResponse = {
  id_notifikasi: string;
  jenis: string;
  judul: string;
  isi: string;
  data?: Record<string, unknown>;
  mendesak: boolean;
  status_kirim: string;
  waktu_dibuat: string;
  waktu_dibaca?: string | null;
};

// -- community (Epic G) -----------------------------------------------------
export type KartuBerbagi = {
  id_penawaran: string;
  judul: string;
  ringkasan: string;
  komoditas: Komoditas;
  volume_kg: number;
  kondisi_terverifikasi: string;
  tingkat_keparahan: TingkatKeparahan;
  metode_klasifikasi: MetodeKlasifikasi;
  label_verifikasi: string;
  lokasi_umum: string;
  mendesak: boolean;
  sisa_jendela_hari?: number | null;
  url_foto?: string | null;
  tautan_dalam_aplikasi: string;
  teks_siap_bagikan: string;
};

export type PenawaranRingkasPapan = {
  id_penawaran: string;
  komoditas: Komoditas;
  volume_kg: number;
  kondisi: string;
  lokasi_umum: string;
  mendesak: boolean;
  dilaporkan_sendiri: boolean;
};

export type PosKomunitas = {
  id_pos: string;
  id_penulis: string;
  nama_penulis?: string | null;
  wilayah: string;
  isi: string;
  waktu_dibuat: string;
};

export type PapanKomunitasResponse = {
  wilayah?: string | null;
  penawaran_aktif?: PenawaranRingkasPapan[];
  pos?: PosKomunitas[];
  catatan: string;
};

export type BuatPosRequest = {
  wilayah: string;
  isi: string;
};

// -- dashboard (Epic I) -----------------------------------------------------
export type RincianKomoditas = {
  komoditas: Komoditas;
  volume_kg: number;
  nilai_rupiah: number;
  jumlah_transaksi: number;
};

export type DampakResponse = {
  id_pengguna: string;
  nilai_terpulihkan: number;
  volume_dialihkan_kg: number;
  jumlah_koneksi_berhasil: number;
  jumlah_penawaran_dibuat: number;
  jumlah_penawaran_tersalurkan: number;
  tingkat_penyaluran?: number | null;
  transaksi_dibatalkan: number;
  rincian_komoditas?: RincianKomoditas[];
  catatan: string;
};

/**
 * One photo ready for multipart upload.
 *
 * The backend's POST /klasifikasi takes `foto` as an array of file parts plus
 * flat form fields, never base64 in JSON.
 */
export type FotoUnggah = {
  uri: string;
  nama: string;
  tipe: string;
};
