/** Value formatting. Text only — nothing here decides how anything looks. */

export function rupiah(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined) return "—";
  return `Rp${Math.round(nilai).toLocaleString("id-ID")}`;
}

export function rentangRupiah(
  min: number | null | undefined,
  max: number | null | undefined,
  satuan = "/kg",
): string {
  if (min === null || min === undefined) {
    if (max === null || max === undefined) return "—";
    return `s.d. ${rupiah(max)}${satuan}`;
  }
  if (max === null || max === undefined) return `mulai ${rupiah(min)}${satuan}`;
  if (min === max) return `${rupiah(min)}${satuan}`;
  return `${rupiah(min)}–${rupiah(max)}${satuan}`;
}

export function kilogram(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined) return "—";
  const bulat = Number.isInteger(nilai) ? nilai : Number(nilai.toFixed(1));
  return `${bulat.toLocaleString("id-ID")} kg`;
}

export function kilometer(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined) return "—";
  return `${nilai.toFixed(1)} km`;
}

export function persen(rasio: number | null | undefined): string {
  if (rasio === null || rasio === undefined) return "—";
  return `${Math.round(rasio * 100)}%`;
}

export function tanggal(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function waktuRelatif(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const detik = Math.floor((Date.now() - d.getTime()) / 1000);
  if (detik < 60) return "baru saja";
  if (detik < 3600) return `${Math.floor(detik / 60)} menit lalu`;
  if (detik < 86400) return `${Math.floor(detik / 3600)} jam lalu`;
  if (detik < 604800) return `${Math.floor(detik / 86400)} hari lalu`;
  return tanggal(iso);
}

export function koordinatSingkat(lat: number, lon: number): string {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}
