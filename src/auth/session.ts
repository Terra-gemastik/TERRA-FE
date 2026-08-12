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
 * The production UI deliberately hides this wire format. For the current demo
 * environment, normal-looking credentials are mapped to these opaque tokens in
 * this file only, then every sign-in still validates the token against
 * GET /onboarding/saya. Replace that mapping when a real login endpoint exists.
 *
 * ============================================================================
 * SWAPPING TO REAL JWT LATER
 * ----------------------------------------------------------------------------
 * Everything auth-shaped funnels through this file. When the backend grows a
 * real login:
 *
 *   1. Change `headerAuth()` to return { Authorization: `Bearer ${token}` }.
 *   2. Add a `login(email, password)` call in src/api/endpoints.ts and call it
 *      from AuthContext instead of `tokenUntukKredensialDemo`.
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
 * Demo-only credential bridge.
 *
 * Normal users never see or type tokens. These credentials map internally to
 * the current MVP tokens and are validated by the same profile request as every
 * other session. Keep the bridge isolated here so real auth can replace it
 * without changing screens.
 */
const AKUN_DEMO = [
  { email: "budi@terra.id", username: "budi", password: "terra123", token: "demo-petani-1" },
  { email: "sari@terra.id", username: "sari", password: "terra123", token: "demo-petani-2" },
  { email: "sambal@terra.id", username: "sambal", password: "terra123", token: "demo-pembeli-1" },
  { email: "ternak@terra.id", username: "ternak", password: "terra123", token: "demo-pembeli-2" },
  { email: "kompos@terra.id", username: "kompos", password: "terra123", token: "demo-pembeli-3" },
  { email: "keripik@terra.id", username: "keripik", password: "terra123", token: "demo-pembeli-4" },
  { email: "jus@terra.id", username: "jus", password: "terra123", token: "demo-pembeli-5" },
  { email: "mitra@terra.id", username: "mitra", password: "terra123", token: "demo-pembeli-6" },
] as const;

export function tokenUntukKredensialDemo(identifier: string, password: string): string | null {
  const nilai = identifier.trim().toLowerCase();
  const akun = AKUN_DEMO.find(
    (item) =>
      (item.email === nilai || item.username === nilai) && item.password === password,
  );
  return akun?.token ?? null;
}
