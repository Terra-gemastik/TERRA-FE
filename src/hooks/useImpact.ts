/** Impact dashboard — PRD Epic I. */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { dampak } from "@/api/endpoints";
import type { DampakResponse } from "@/api/types";

import { kunci } from "./keys";

/**
 * Cumulative impact for the signed-in user.
 *
 * Aggregated from that user's own transaction history (PRD I-02) — no
 * platform-wide totals, nothing extrapolated. `nilai_terpulihkan` is gross
 * produce value; no transport cost is deducted anywhere, because that
 * modelling is out of scope (PRD §3.2).
 */
export function useDampakSaya(): UseQueryResult<DampakResponse> {
  return useQuery<DampakResponse>({
    queryKey: kunci.dampak,
    queryFn: () => dampak.milikSaya(),
  });
}
