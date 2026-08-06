/** Two-sided matching — PRD Epics D (forward) and E (reverse). */

import { useQuery } from "@tanstack/react-query";

import { penawaran, pencocokan } from "@/api/endpoints";
import type { PenawaranResponse } from "@/api/types";

import { kunci } from "./keys";

/**
 * Forward flow: buyers who can take this offer, ranked.
 *
 * An empty list is a real answer, not a failure — the response's `pesan` and
 * `ringkasan_penyaringan` explain which filter removed each candidate
 * (PRD D acceptance criteria). The screen shows that instead of a bare
 * "no results".
 */
export function useCariPembeli(idPenawaran: string | undefined) {
  return useQuery({
    queryKey: kunci.pencocokan.pembeli(idPenawaran ?? ""),
    queryFn: () => pencocokan.cariPembeli(idPenawaran!),
    enabled: Boolean(idPenawaran),
  });
}

/**
 * Reverse flow: supply that matched this buyer's standing demands.
 *
 * `KecocokanTercatat` carries only ids, distance and score, so each match's
 * offer is fetched alongside to make the list readable. N+1 by necessity, and
 * fine at the volumes involved — the alternative is a backend change.
 */
export function useKecocokanSaya() {
  const kecocokan = useQuery({
    queryKey: kunci.pencocokan.saya,
    queryFn: () => pencocokan.kecocokanSaya(),
  });

  const idPenawaran = kecocokan.data?.map((k) => k.id_penawaran) ?? [];

  const penawaranTerkait = useQuery({
    queryKey: [...kunci.pencocokan.saya, "penawaran", idPenawaran],
    queryFn: async () => {
      const hasil = await Promise.all(
        idPenawaran.map((id) =>
          penawaran.detail(id).catch(() => null), // a deleted offer must not break the list
        ),
      );
      const peta: Record<string, PenawaranResponse> = {};
      for (const p of hasil) if (p) peta[p.id_penawaran] = p;
      return peta;
    },
    enabled: idPenawaran.length > 0,
  });

  return {
    kecocokan,
    penawaranPerId: penawaranTerkait.data ?? {},
    isLoading: kecocokan.isLoading || penawaranTerkait.isLoading,
    error: kecocokan.error,
    refetch: () => {
      void kecocokan.refetch();
      void penawaranTerkait.refetch();
    },
  };
}
