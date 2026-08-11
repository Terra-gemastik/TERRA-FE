/** Onboarding & profile — PRD Epic A. */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { onboarding } from "@/api/endpoints";
import type {
  DaftarPembeliRequest,
  DaftarPetaniRequest,
  PerbaruiLokasiRequest,
  ProfilResponse,
  RingkasanPengguna,
} from "@/api/types";

import { kunci } from "./keys";

export function useProfilSaya(): UseQueryResult<ProfilResponse> {
  return useQuery<ProfilResponse>({
    queryKey: kunci.profil.saya,
    queryFn: () => onboarding.profilSaya(),
  });
}

/** PRD F-07: the counterparty's reputation is visible before contact. */
export function useProfilPengguna(
  idPengguna: string | undefined,
): UseQueryResult<ProfilResponse> {
  return useQuery<ProfilResponse>({
    queryKey: kunci.profil.pengguna(idPengguna ?? ""),
    queryFn: () => onboarding.profilPengguna(idPengguna!),
    enabled: Boolean(idPengguna),
  });
}

export function useDaftarPembeliTerdaftar(): UseQueryResult<RingkasanPengguna[]> {
  return useQuery<RingkasanPengguna[]>({
    queryKey: kunci.profil.semuaPembeli,
    queryFn: () => onboarding.daftarPembeliTerdaftar(),
  });
}

export function useDaftarPetani() {
  return useMutation({
    mutationFn: (body: DaftarPetaniRequest) => onboarding.daftarPetani(body),
  });
}

export function useDaftarPembeli() {
  return useMutation({
    mutationFn: (body: DaftarPembeliRequest) => onboarding.daftarPembeli(body),
  });
}

export function usePerbaruiLokasi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PerbaruiLokasiRequest) => onboarding.perbaruiLokasi(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kunci.profil.saya });
    },
  });
}
