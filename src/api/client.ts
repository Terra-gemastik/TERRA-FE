/**
 * HTTP client.
 *
 * One place that knows about base URLs, auth headers, and how the backend
 * reports errors. Endpoints build on this; screens never touch it directly.
 *
 * The backend returns two error shapes, and both are normalised here:
 *
 *   TerraError      { "pesan": "...", "detail": { ... } }        (domain errors)
 *   FastAPI 422     { "detail": [ { loc, msg, type }, ... ] }    (validation)
 */

import { headerAuth } from "@/auth/session";

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8000"
).replace(/\/+$/, "");

export class TerraApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, pesan: string, detail?: unknown) {
    super(pesan);
    this.name = "TerraApiError";
    this.status = status;
    this.detail = detail;
  }

  /** True when the token was missing, unknown, or the role was wrong. */
  get tidakBerwenang(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

/**
 * Called when the API rejects our credentials, so AuthContext can sign out.
 * A callback rather than an import, to keep client.ts free of React.
 */
let saatTidakBerwenang: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null): void {
  saatTidakBerwenang = handler;
}

type Query = Record<string, string | number | boolean | undefined | null>;

type OpsiPermintaan = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  /** Serialised as JSON. Mutually exclusive with `form`. */
  body?: unknown;
  /** Sent as multipart/form-data. Content-Type is left to the runtime. */
  form?: FormData;
  query?: Query;
  /** Override the stored token — used to validate one before signing in. */
  token?: string | null;
  signal?: AbortSignal;
};

function bangunUrl(path: string, query?: Query): string {
  const url = new URL(BASE_URL + path);
  if (query) {
    for (const [kunci, nilai] of Object.entries(query)) {
      if (nilai !== undefined && nilai !== null && nilai !== "") {
        url.searchParams.set(kunci, String(nilai));
      }
    }
  }
  return url.toString();
}

/** Turn whatever the backend sent into one readable sentence. */
function pesanGalat(status: number, tubuh: unknown): string {
  if (tubuh && typeof tubuh === "object") {
    const t = tubuh as Record<string, unknown>;

    if (typeof t.pesan === "string") return t.pesan;

    if (Array.isArray(t.detail)) {
      const bagian = t.detail
        .map((d) => {
          const item = d as { loc?: unknown[]; msg?: string };
          const medan = Array.isArray(item.loc)
            ? item.loc.filter((l) => l !== "body" && l !== "query").join(".")
            : "";
          return medan ? `${medan}: ${item.msg ?? ""}` : (item.msg ?? "");
        })
        .filter(Boolean);
      if (bagian.length) return bagian.join("\n");
    }

    if (typeof t.detail === "string") return t.detail;
  }

  if (status === 404) return "Data tidak ditemukan.";
  if (status === 401) return "Sesi tidak valid. Masuk ulang.";
  if (status === 503) return "Layanan sedang tidak tersedia.";
  return `Permintaan gagal (HTTP ${status}).`;
}

export async function request<T>(
  path: string,
  opsi: OpsiPermintaan = {},
): Promise<T> {
  const { method = "GET", body, form, query, token, signal } = opsi;

  // `token` undefined -> use the signed-in token; `null` -> send none.
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...headerAuth(token),
  };

  // Never set Content-Type for FormData: the runtime has to add the multipart
  // boundary itself, and overriding it produces a body the backend cannot parse.
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let respons: Response;
  try {
    respons = await fetch(bangunUrl(path, query), {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    });
  } catch (penyebab) {
    // fetch only rejects on transport failure, which on a device almost always
    // means the API URL is unreachable rather than the server erroring.
    throw new TerraApiError(
      0,
      `Tidak dapat menghubungi server di ${BASE_URL}.\n` +
        "Periksa EXPO_PUBLIC_API_URL — di perangkat fisik, 'localhost' menunjuk ke ponsel, bukan komputer Anda.",
      penyebab,
    );
  }

  if (respons.status === 204) return undefined as T;

  const teks = await respons.text();
  const tubuh = teks ? safeJson(teks) : null;

  if (!respons.ok) {
    if (respons.status === 401) saatTidakBerwenang?.();
    throw new TerraApiError(respons.status, pesanGalat(respons.status, tubuh), tubuh);
  }

  return tubuh as T;
}

function safeJson(teks: string): unknown {
  try {
    return JSON.parse(teks);
  } catch {
    return teks;
  }
}

export const apiBaseUrl = BASE_URL;
