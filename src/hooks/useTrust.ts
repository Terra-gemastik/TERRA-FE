/** Trust & verification — PRD Epic F. */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trust } from "@/api/endpoints";
import type {
  BuatLaporanRequest,
  BuatTransaksiRequest,
  SelesaikanTransaksiRequest,
  TinjauLaporanRequest,
} from "@/api/types";

import { kunci } from "./keys";

export function useTransaksiSaya() {
  return useQuery({
    queryKey: kunci.trust.transaksi,
    queryFn: () => trust.transaksiSaya(),
  });
}

/**
 * Two-directional reputation (PRD F-05, F-06).
 *
 * `ringkasan_teks` states what the numbers are derived from; screens show it
 * next to the figures so a score is never an unexplained rating.
 */
export function useReputasi(idPengguna: string | undefined) {
  return useQuery({
    queryKey: kunci.trust.reputasi(idPengguna ?? ""),
    queryFn: () => trust.reputasi(idPengguna!),
    enabled: Boolean(idPengguna),
  });
}

export function useLaporanTerhadap(idPengguna: string | undefined) {
  return useQuery({
    queryKey: kunci.trust.laporan(idPengguna ?? ""),
    queryFn: () => trust.laporanTerhadap(idPengguna!),
    enabled: Boolean(idPengguna),
  });
}

/** Every write below moves a reputation, so all of them invalidate it. */
function useInvalidasiTrust() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: kunci.trust.transaksi });
    void qc.invalidateQueries({ queryKey: ["reputasi"] });
    void qc.invalidateQueries({ queryKey: ["laporan"] });
    void qc.invalidateQueries({ queryKey: kunci.dampak });
    void qc.invalidateQueries({ queryKey: kunci.penawaran.semua });
  };
}

export function useBuatTransaksi() {
  const invalidasi = useInvalidasiTrust();
  return useMutation({
    mutationFn: (body: BuatTransaksiRequest) => trust.buatTransaksi(body),
    onSuccess: invalidasi,
  });
}

export function useSelesaikanTransaksi() {
  const invalidasi = useInvalidasiTrust();
  return useMutation({
    mutationFn: (masukan: {
      idTransaksi: string;
      body: SelesaikanTransaksiRequest;
    }) => trust.selesaikan(masukan.idTransaksi, masukan.body),
    onSuccess: invalidasi,
  });
}

/**
 * PRD F-06: cancellation after agreement, recorded against whoever cancelled.
 * This is the buyer-side accountability half of the trust layer.
 */
export function useBatalkanTransaksi() {
  const invalidasi = useInvalidasiTrust();
  return useMutation({
    mutationFn: (masukan: { idTransaksi: string; alasan?: string }) =>
      trust.batalkan(masukan.idTransaksi, masukan.alasan),
    onSuccess: invalidasi,
  });
}

/** PRD F-04: post-transaction mismatch report with comparison photos. */
export function useBuatLaporan() {
  const invalidasi = useInvalidasiTrust();
  return useMutation({
    mutationFn: (body: BuatLaporanRequest) => trust.buatLaporan(body),
    onSuccess: invalidasi,
  });
}

export function useTinjauLaporan() {
  const invalidasi = useInvalidasiTrust();
  return useMutation({
    mutationFn: (masukan: { idLaporan: string; body: TinjauLaporanRequest }) =>
      trust.tinjauLaporan(masukan.idLaporan, masukan.body),
    onSuccess: invalidasi,
  });
}
