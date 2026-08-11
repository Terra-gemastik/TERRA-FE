/** Buyer demands — PRD Epic E, the reverse flow. */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { permintaan } from "@/api/endpoints";
import type { BuatPermintaanRequest, PermintaanResponse } from "@/api/types";

import { kunci } from "./keys";

export function usePermintaanSaya(): UseQueryResult<PermintaanResponse[]> {
  return useQuery<PermintaanResponse[]>({
    queryKey: kunci.permintaan.saya,
    queryFn: () => permintaan.milikSaya(),
  });
}

export function useBuatPermintaan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BuatPermintaanRequest) => permintaan.buat(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kunci.permintaan.semua });
    },
  });
}

/** PRD E-04: close a demand early rather than waiting for expiry. */
export function useTutupPermintaan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idPermintaan: string) => permintaan.tutup(idPermintaan),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kunci.permintaan.semua });
    },
  });
}
