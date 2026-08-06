/** Notifications — PRD Epic H. */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notifikasi } from "@/api/endpoints";

import { kunci } from "./keys";

/**
 * The signed-in user's notifications, urgent first.
 *
 * NOTE ON THE BACKEND PLACEHOLDER: push delivery is not wired up on the server
 * — notifications are composed, prioritised and stored, but never dispatched
 * to a device (`status_kirim: "tercatat"`). Polling this endpoint is therefore
 * the only way a buyer learns about a reverse match today, which is why it
 * refetches on a timer instead of relying on a push wake-up.
 *
 * When the backend gains a real push provider, drop `refetchInterval` and
 * invalidate this key from the push handler instead.
 */
export function useNotifikasiSaya() {
  return useQuery({
    queryKey: kunci.notifikasi,
    queryFn: () => notifikasi.milikSaya(),
    refetchInterval: 30_000,
  });
}

export function useJumlahBelumDibaca() {
  const { data } = useNotifikasiSaya();
  return data?.filter((n) => !n.waktu_dibaca).length ?? 0;
}

export function useTandaiDibaca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idNotifikasi: string) => notifikasi.tandaiDibaca(idNotifikasi),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kunci.notifikasi });
    },
  });
}
