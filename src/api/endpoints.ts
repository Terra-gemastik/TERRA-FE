/**
 * Every backend call the app makes, typed against the generated schema.
 *
 * Grouped by backend module so this file mirrors the API's own structure —
 * find the endpoint the same way you'd find it in /docs.
 *
 * Paths and parameter names were taken from openapi.json, not from memory.
 */

import { Platform } from "react-native";

import { request } from "./client";
import type * as T from "./types";

// ===========================================================================
// Onboarding — Epic A
// ===========================================================================
export const onboarding = {
  daftarPetani: (body: T.DaftarPetaniRequest) =>
    // Registration is the only way a token is minted, so it must not send one.
    request<T.PendaftaranResponse>("/onboarding/petani", {
      method: "POST",
      body,
      token: null,
    }),

  daftarPembeli: (body: T.DaftarPembeliRequest) =>
    request<T.PendaftaranResponse>("/onboarding/pembeli", {
      method: "POST",
      body,
      token: null,
    }),

  /**
   * Current profile — also serves as token validation at login, since the
   * backend has no dedicated auth endpoint.
   */
  profilSaya: (token?: string) =>
    request<T.ProfilResponse>("/onboarding/saya", { token }),

  perbaruiLokasi: (body: T.PerbaruiLokasiRequest) =>
    request<T.ProfilResponse>("/onboarding/saya/lokasi", { method: "PATCH", body }),

  profilPengguna: (idPengguna: string) =>
    request<T.ProfilResponse>(`/onboarding/pengguna/${idPengguna}`),

  daftarPembeliTerdaftar: () =>
    request<T.RingkasanPengguna[]>("/onboarding/pembeli"),
};

// ===========================================================================
// Classification — Epic B
// ===========================================================================
export const klasifikasi = {
  /**
   * PRD B-01..B-06. multipart/form-data, exactly as the schema declares:
   * `foto` repeated per file, plus flat text fields. Images are never
   * base64-encoded into JSON.
   */
  otomatis: async (masukan: {
    komoditas: T.Komoditas;
    pemicu: T.Pemicu;
    foto: T.FotoUnggah[];
    waktuAmbil?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const form = new FormData();
    form.append("komoditas", masukan.komoditas);
    form.append("pemicu", masukan.pemicu);

    for (const f of masukan.foto) {
      if (Platform.OS === "web") {
        // The {uri,name,type} shape below is a React Native convention, not a
        // DOM one. On web `FormData.append` would stringify that object to
        // "[object Object]" and the server would receive a text field where it
        // expects a file — a silent 422 with no clue why. Resolve the blob:
        // URI to a real File instead.
        const blob = await fetch(f.uri).then((r) => r.blob());
        form.append("foto", new File([blob], f.nama, { type: f.tipe || blob.type }));
      } else {
        form.append("foto", {
          uri: f.uri,
          name: f.nama,
          type: f.tipe,
        } as unknown as Blob);
      }
    }

    if (masukan.waktuAmbil) form.append("waktu_ambil", masukan.waktuAmbil);
    if (masukan.latitude !== undefined) {
      form.append("latitude", String(masukan.latitude));
    }
    if (masukan.longitude !== undefined) {
      form.append("longitude", String(masukan.longitude));
    }

    return request<T.KlasifikasiResponse>("/klasifikasi", { method: "POST", form });
  },

  /** PRD B-07: the manual path, tagged self-reported. */
  manual: (body: T.KlasifikasiManualRequest) =>
    request<T.KlasifikasiResponse>("/klasifikasi/manual", { method: "POST", body }),

  ambil: (idKlasifikasi: string) =>
    request<T.RingkasanKlasifikasi>(`/klasifikasi/${idKlasifikasi}`),
};

// ===========================================================================
// Listings — farmer offers and buyer demands
// ===========================================================================
export const penawaran = {
  buat: (body: T.BuatPenawaranRequest) =>
    request<T.PenawaranResponse>("/penawaran", { method: "POST", body }),

  daftar: (filter?: { komoditas?: T.Komoditas; status?: T.StatusPenawaran }) =>
    request<T.PenawaranResponse[]>("/penawaran", {
      query: {
        komoditas: filter?.komoditas,
        status_penawaran: filter?.status,
      },
    }),

  milikSaya: () => request<T.PenawaranResponse[]>("/penawaran/saya"),

  detail: (idPenawaran: string) =>
    request<T.PenawaranResponse>(`/penawaran/${idPenawaran}`),

  tandaiTersalurkan: (idPenawaran: string) =>
    request<T.PenawaranResponse>(`/penawaran/${idPenawaran}/tersalurkan`, {
      method: "POST",
    }),
};

export const permintaan = {
  buat: (body: T.BuatPermintaanRequest) =>
    request<T.PermintaanResponse>("/permintaan", { method: "POST", body }),

  milikSaya: () => request<T.PermintaanResponse[]>("/permintaan/saya"),

  tutup: (idPermintaan: string) =>
    request<T.PermintaanResponse>(`/permintaan/${idPermintaan}/tutup`, {
      method: "POST",
    }),
};

// ===========================================================================
// Recommendation — Epic C
// ===========================================================================
export const rekomendasi = {
  untukPenawaran: (idPenawaran: string) =>
    request<T.RekomendasiResponse>(`/penawaran/${idPenawaran}/rekomendasi`),
};

// ===========================================================================
// Matching — Epics D and E
// ===========================================================================
export const pencocokan = {
  /** Forward flow: ranked buyers for one offer. */
  cariPembeli: (idPenawaran: string) =>
    request<T.HasilPencocokanResponse>(`/penawaran/${idPenawaran}/pembeli`),

  kecocokanPenawaran: (idPenawaran: string) =>
    request<T.KecocokanTercatat[]>(`/penawaran/${idPenawaran}/kecocokan`),

  /** Reverse flow: supply that matched this buyer's standing demands. */
  kecocokanSaya: () => request<T.KecocokanTercatat[]>("/kecocokan/saya"),

  /**
   * Open-data venues near an offer — pasar, peternak — for when no buyer is
   * registered nearby. Not buyers: nothing here has agreed to purchase.
   */
  tempatPenyaluran: (idPenawaran: string, radiusKm?: number) =>
    request<T.TempatPenyaluranResponse>(
      `/penawaran/${idPenawaran}/tempat-penyaluran` +
        (radiusKm ? `?radius_km=${radiusKm}` : ""),
    ),
};

// ===========================================================================
// Trust — Epic F
// ===========================================================================
export const trust = {
  buatTransaksi: (body: T.BuatTransaksiRequest) =>
    request<T.RingkasanTransaksi>("/transaksi", { method: "POST", body }),

  selesaikan: (idTransaksi: string, body: T.SelesaikanTransaksiRequest) =>
    request<T.RingkasanTransaksi>(`/transaksi/${idTransaksi}/selesai`, {
      method: "POST",
      body,
    }),

  batalkan: (idTransaksi: string, alasan?: string) =>
    request<T.RingkasanTransaksi>(`/transaksi/${idTransaksi}/batal`, {
      method: "POST",
      body: { alasan: alasan ?? null },
    }),

  transaksiSaya: () => request<T.RingkasanTransaksi[]>("/transaksi/saya"),

  buatLaporan: (body: T.BuatLaporanRequest) =>
    request<T.LaporanResponse>("/laporan", { method: "POST", body }),

  tinjauLaporan: (idLaporan: string, body: T.TinjauLaporanRequest) =>
    request<T.LaporanResponse>(`/laporan/${idLaporan}/tinjau`, {
      method: "POST",
      body,
    }),

  laporanTerhadap: (idPengguna: string) =>
    request<T.LaporanResponse[]>(`/laporan/terhadap/${idPengguna}`),

  reputasi: (idPengguna: string) =>
    request<T.RingkasanReputasi>(`/reputasi/${idPengguna}`),
};

// ===========================================================================
// Notifications — Epic H
// ===========================================================================
export const notifikasi = {
  milikSaya: () => request<T.NotifikasiResponse[]>("/notifikasi/saya"),

  tandaiDibaca: (idNotifikasi: string) =>
    request<T.NotifikasiResponse>(`/notifikasi/${idNotifikasi}/dibaca`, {
      method: "POST",
    }),
};

// ===========================================================================
// Community — Epic G
// ===========================================================================
export const komunitas = {
  kartu: (idPenawaran: string) =>
    request<T.KartuBerbagi>(`/penawaran/${idPenawaran}/kartu`),

  /** Fire-and-forget analytics after the native share sheet closes (§12). */
  catatBerbagi: (idPenawaran: string, kanal: string) =>
    request<void>(`/penawaran/${idPenawaran}/kartu/dibagikan`, {
      method: "POST",
      query: { kanal },
    }),

  papan: (wilayah?: string) =>
    request<T.PapanKomunitasResponse>("/komunitas/papan", { query: { wilayah } }),

  buatPos: (body: T.BuatPosRequest) =>
    request<T.PosKomunitas>("/komunitas/pos", { method: "POST", body }),
};

// ===========================================================================
// Impact dashboard — Epic I
// ===========================================================================
export const dampak = {
  milikSaya: () => request<T.DampakResponse>("/dampak/saya"),
};
