/**
 * Query keys, in one place.
 *
 * Invalidation is the easiest thing to get subtly wrong across a dozen hook
 * files — a key typed slightly differently in two places silently stops
 * refetching. Everything derives from here instead.
 */

import type { Komoditas, StatusPenawaran } from "@/api/types";

export const kunci = {
  profil: {
    saya: ["profil", "saya"] as const,
    pengguna: (id: string) => ["profil", "pengguna", id] as const,
    semuaPembeli: ["profil", "pembeli"] as const,
  },
  penawaran: {
    semua: ["penawaran"] as const,
    saya: ["penawaran", "saya"] as const,
    daftar: (filter?: { komoditas?: Komoditas; status?: StatusPenawaran }) =>
      ["penawaran", "daftar", filter ?? {}] as const,
    detail: (id: string) => ["penawaran", "detail", id] as const,
  },
  permintaan: {
    semua: ["permintaan"] as const,
    saya: ["permintaan", "saya"] as const,
  },
  rekomendasi: (idPenawaran: string) => ["rekomendasi", idPenawaran] as const,
  pencocokan: {
    pembeli: (idPenawaran: string) => ["pencocokan", "pembeli", idPenawaran] as const,
    penawaran: (idPenawaran: string) =>
      ["pencocokan", "penawaran", idPenawaran] as const,
    saya: ["pencocokan", "saya"] as const,
  },
  trust: {
    transaksi: ["transaksi", "saya"] as const,
    reputasi: (id: string) => ["reputasi", id] as const,
    laporan: (id: string) => ["laporan", "terhadap", id] as const,
  },
  notifikasi: ["notifikasi", "saya"] as const,
  komunitas: {
    papan: (wilayah?: string) => ["komunitas", "papan", wilayah ?? ""] as const,
    kartu: (idPenawaran: string) => ["komunitas", "kartu", idPenawaran] as const,
  },
  dampak: ["dampak", "saya"] as const,
};
