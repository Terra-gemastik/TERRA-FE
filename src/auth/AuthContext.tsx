/**
 * Current user + role, and the sign-in / sign-out transitions.
 *
 * Deliberately the app's only global state. Everything else that comes from
 * the server lives in TanStack Query, which already handles caching,
 * refetching and invalidation better than a hand-rolled store would.
 */

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { setOnUnauthorized } from "@/api/client";
import { onboarding } from "@/api/endpoints";
import type { Peran, ProfilResponse } from "@/api/types";

import { setTokenAktif, tokenUntukKredensialDemo } from "./session";
import { bacaToken, hapusToken, simpanToken } from "./storage";

type AuthState = {
  pengguna: ProfilResponse | null;
  peran: Peran | null;
  /** True while the stored token is being restored at startup. */
  memulihkan: boolean;
  /** Validate a token against the API and sign in with it. */
  masuk: (token: string) => Promise<ProfilResponse>;
  /** Demo-only credential facade over the existing token-backed backend. */
  masukDenganKredensial: (email: string, password: string) => Promise<ProfilResponse>;
  keluar: () => Promise<void>;
  /** Re-read the profile — used after registering or editing it. */
  segarkan: () => Promise<void>;
};

const Konteks = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [pengguna, setPengguna] = useState<ProfilResponse | null>(null);
  const [memulihkan, setMemulihkan] = useState(true);
  const queryClient = useQueryClient();

  const keluar = useCallback(async () => {
    setTokenAktif(null);
    await hapusToken();
    setPengguna(null);
    // Drop every cached response so the next user never sees the last one's data.
    queryClient.clear();
  }, [queryClient]);

  const masuk = useCallback(
    async (token: string) => {
      // Validate before storing: GET /onboarding/saya is the only endpoint
      // that can tell us whether a token is real, since the backend has no
      // login. Passing the token explicitly avoids trusting it first.
      const profil = await onboarding.profilSaya(token);
      setTokenAktif(token);
      await simpanToken(token);
      setPengguna(profil);
      return profil;
    },
    [],
  );

  const masukDenganKredensial = useCallback(
    async (email: string, password: string) => {
      const token = tokenUntukKredensialDemo(email, password);
      if (!token) {
        throw new Error("Email atau kata sandi belum sesuai.");
      }
      return masuk(token);
    },
    [masuk],
  );

  const segarkan = useCallback(async () => {
    const profil = await onboarding.profilSaya();
    setPengguna(profil);
  }, []);

  // Restore a previous session on cold start.
  useEffect(() => {
    let dibatalkan = false;

    (async () => {
      try {
        const token = await bacaToken();
        if (!token) return;

        setTokenAktif(token);
        const profil = await onboarding.profilSaya(token);
        if (!dibatalkan) setPengguna(profil);
      } catch {
        // Token expired, revoked, or the API moved. Start clean rather than
        // leaving a half-authenticated app.
        setTokenAktif(null);
        await hapusToken();
      } finally {
        if (!dibatalkan) setMemulihkan(false);
      }
    })();

    return () => {
      dibatalkan = true;
    };
  }, []);

  // Any 401 from anywhere signs the user out, so a revoked token cannot leave
  // the app stuck on screens that will never load.
  useEffect(() => {
    setOnUnauthorized(() => {
      void keluar();
    });
    return () => setOnUnauthorized(null);
  }, [keluar]);

  const nilai = useMemo<AuthState>(
    () => ({
      pengguna,
      peran: pengguna?.peran ?? null,
      memulihkan,
      masuk,
      masukDenganKredensial,
      keluar,
      segarkan,
    }),
    [pengguna, memulihkan, masuk, masukDenganKredensial, keluar, segarkan],
  );

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

export function useAuth(): AuthState {
  const konteks = useContext(Konteks);
  if (!konteks) throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  return konteks;
}
