/**
 * THE AUTH SEAM.
 *
 * ============================================================================
 * WHAT THE BACKEND ACTUALLY DOES  (verified against openapi.json, not memory)
 * ----------------------------------------------------------------------------
 *   "securitySchemes": {
 *     "APIKeyHeader": { "type": "apiKey", "in": "header", "name": "X-Terra-Token" }
 *   }
 *
 * An OPAQUE TOKEN in a custom header — not a JWT, and not `Authorization:
 * Bearer`. There is also no `/login` endpoint anywhere in the API. The only
 * ways a token comes into existence are:
 *
 *   POST /onboarding/petani   → PendaftaranResponse.token_akses
 *   POST /onboarding/pembeli  → PendaftaranResponse.token_akses
 *
 * and the only way to validate one is `GET /onboarding/saya`.
 *
 * That is deliberate on the backend side: context.md puts production-grade
 * auth out of scope for the MVP. It means the Login screen is a token-entry
 * screen, which is honest about what exists rather than faking a password box
 * against an endpoint that would ignore it.
 *
 * ============================================================================
 * SWAPPING TO REAL JWT LATER
 * ----------------------------------------------------------------------------
 * Everything auth-shaped funnels through this file. When the backend grows a
 * real login:
 *
 *   1. Change `headerAuth()` to return { Authorization: `Bearer ${token}` }.
 *   2. Add a `login(email, password)` call in src/api/endpoints.ts and call it
 *      from LoginScreen instead of `verifikasiToken`.
 *   3. If tokens expire, add refresh handling in `src/api/client.ts` around
 *      the existing 401 hook.
 *
 * No screen, hook, or component reads the token directly, so nothing else has
 * to change.
 * ============================================================================
 */

/** The header name the backend expects. Change here, changes everywhere. */
export const HEADER_TOKEN = "X-Terra-Token";

/**
 * In-memory copy of the active token.
 *
 * SecureStore is the durable home (see storage.ts); this mirror exists so the
 * API client can attach the header synchronously without awaiting on every
 * single request.
 */
let tokenAktif: string | null = null;

export function setTokenAktif(token: string | null): void {
  tokenAktif = token;
}

export function getTokenAktif(): string | null {
  return tokenAktif;
}

/**
 * Auth headers for one request.
 *
 * The single place the wire format for credentials is decided.
 */
export function headerAuth(token: string | null = tokenAktif): Record<string, string> {
  if (!token) return {};
  return { [HEADER_TOKEN]: token };
}

/**
 * Seeded demo accounts from the backend's `scripts/init_db --seed`.
 *
 * These are real tokens against the real database, not mock data — the login
 * screen offers them as quick-fill chips so a demo does not start with typing.
 * Every one still round-trips through GET /onboarding/saya to sign in.
 */
export const TOKEN_DEMO = [
  { token: "demo-petani-1", label: "Petani 1", catatan: "Lembang · riwayat bersih" },
  { token: "demo-petani-2", label: "Petani 2", catatan: "Cisarua · ada laporan" },
  { token: "demo-pembeli-1", label: "Pembeli 1", catatan: "Pengolah saus" },
  { token: "demo-pembeli-2", label: "Pembeli 2", catatan: "Peternak" },
  { token: "demo-pembeli-3", label: "Pembeli 3", catatan: "Produsen kompos" },
  { token: "demo-pembeli-4", label: "Pembeli 4", catatan: "Pengolah keripik" },
  { token: "demo-pembeli-5", label: "Pembeli 5", catatan: "Pengolah jus" },
  { token: "demo-pembeli-6", label: "Pembeli 6", catatan: "Ada pembatalan" },
] as const;
