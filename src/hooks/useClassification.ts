/** Condition classification — PRD Epic B. */

import { useMutation } from "@tanstack/react-query";

import { klasifikasi } from "@/api/endpoints";
import type {
  FotoUnggah,
  KlasifikasiManualRequest,
  Komoditas,
  Pemicu,
} from "@/api/types";

export type MasukanKlasifikasi = {
  komoditas: Komoditas;
  pemicu: Pemicu;
  foto: FotoUnggah[];
  waktuAmbil?: string;
  latitude?: number;
  longitude?: number;
};

/**
 * Automatic classification from photos.
 *
 * Not cached: each call uploads a new photo and produces a new record, so
 * there is nothing to reuse between invocations.
 *
 * The response may come back with `butuh_konfirmasi_manual: true` — that is a
 * SUCCESS, not an error. PRD B-06 requires the app to stop and offer a retake
 * or the manual path rather than proceeding silently. ClassificationResult
 * handles that branch.
 */
export function useKlasifikasiOtomatis() {
  return useMutation({
    mutationFn: (masukan: MasukanKlasifikasi) => klasifikasi.otomatis(masukan),
  });
}

/** PRD B-07: manual fallback. Result is tagged self-reported. */
export function useKlasifikasiManual() {
  return useMutation({
    mutationFn: (body: KlasifikasiManualRequest) => klasifikasi.manual(body),
  });
}
