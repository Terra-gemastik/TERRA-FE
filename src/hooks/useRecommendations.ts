/** Rule-based recommendations — PRD Epic C. */

import { useQuery } from "@tanstack/react-query";

import { rekomendasi } from "@/api/endpoints";

import { kunci } from "./keys";

/**
 * Disposal/sale options for one offer.
 *
 * Every option in the response carries `id_aturan` — the row in the backend's
 * `config/rule_base.yaml` that produced it (PRD C-01 acceptance, NF-06). The
 * screen surfaces it rather than hiding it, because "why am I being told
 * this" is answerable here and should stay answerable.
 */
export function useRekomendasi(idPenawaran: string | undefined) {
  return useQuery({
    queryKey: kunci.rekomendasi(idPenawaran ?? ""),
    queryFn: () => rekomendasi.untukPenawaran(idPenawaran!),
    enabled: Boolean(idPenawaran),
  });
}
