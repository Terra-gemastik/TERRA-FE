/** Farmer offers — PRD §8 `PenawaranPetani`. */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { penawaran } from "@/api/endpoints";
import type {
  BuatPenawaranRequest,
  Komoditas,
  PenawaranResponse,
  StatusPenawaran,
} from "@/api/types";

import { kunci } from "./keys";

export function usePenawaranSaya(): UseQueryResult<PenawaranResponse[]> {
  return useQuery<PenawaranResponse[]>({
    queryKey: kunci.penawaran.saya,
    queryFn: () => penawaran.milikSaya(),
  });
}

export function useDaftarPenawaran(filter?: {
  komoditas?: Komoditas;
  status?: StatusPenawaran;
}): UseQueryResult<PenawaranResponse[]> {
  return useQuery<PenawaranResponse[]>({
    queryKey: kunci.penawaran.daftar(filter),
    queryFn: () => penawaran.daftar(filter),
  });
}

export function usePenawaran(
  idPenawaran: string | undefined,
): UseQueryResult<PenawaranResponse> {
  return useQuery<PenawaranResponse>({
    queryKey: kunci.penawaran.detail(idPenawaran ?? ""),
    queryFn: () => penawaran.detail(idPenawaran!),
    enabled: Boolean(idPenawaran),
  });
}

/**
 * Publish an offer.
 *
 * The backend runs the reverse-match scan inside this same call (PRD E-02) and
 * reports how many standing demands were hit as `jumlah_permintaan_cocok`, so
 * matches and notifications are invalidated here too — buyers' data has just
 * changed as a side effect of this write.
 */
export function useBuatPenawaran() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BuatPenawaranRequest) => penawaran.buat(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kunci.penawaran.semua });
      void qc.invalidateQueries({ queryKey: kunci.pencocokan.saya });
      void qc.invalidateQueries({ queryKey: kunci.notifikasi });
      void qc.invalidateQueries({ queryKey: kunci.dampak });
    },
  });
}

export function useTandaiTersalurkan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idPenawaran: string) => penawaran.tandaiTersalurkan(idPenawaran),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kunci.penawaran.semua });
      void qc.invalidateQueries({ queryKey: kunci.dampak });
    },
  });
}
