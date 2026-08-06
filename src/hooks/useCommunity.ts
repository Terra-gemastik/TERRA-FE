/** Community & sharing — PRD Epic G. */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { komunitas } from "@/api/endpoints";
import type { BuatPosRequest } from "@/api/types";

import { kunci } from "./keys";

/**
 * Regional board — active listings plus free-text posts.
 *
 * PRD G-04 is a constraint rather than a feature: this is a passive
 * information surface, and no shipment-pooling is built on top of it. The
 * response carries that note and the screen shows it.
 */
export function usePapanKomunitas(wilayah?: string) {
  return useQuery({
    queryKey: kunci.komunitas.papan(wilayah),
    queryFn: () => komunitas.papan(wilayah),
  });
}

export function useBuatPos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BuatPosRequest) => komunitas.buatPos(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["komunitas", "papan"] });
    },
  });
}

/**
 * Share card payload for one offer (PRD G-01).
 *
 * The backend returns DATA, not a rendered image or page — the app composes
 * the native share sheet from it. There is no web surface in this product, so
 * the WhatsApp *link preview* half of PRD §6.7 is not achievable; sharing
 * text plus a deep link is.
 */
export function useKartuBerbagi(idPenawaran: string | undefined) {
  return useQuery({
    queryKey: kunci.komunitas.kartu(idPenawaran ?? ""),
    queryFn: () => komunitas.kartu(idPenawaran!),
    enabled: Boolean(idPenawaran),
  });
}

/** Analytics ping after the share sheet closes (PRD §12 `card_shared`). */
export function useCatatBerbagi() {
  return useMutation({
    mutationFn: (masukan: { idPenawaran: string; kanal: string }) =>
      komunitas.catatBerbagi(masukan.idPenawaran, masukan.kanal),
  });
}
