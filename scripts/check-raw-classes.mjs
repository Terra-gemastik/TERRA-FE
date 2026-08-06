/**
 * TOKEN PURITY CHECK  —  npm run lint:tokens
 *
 * Fails if any file outside src/components/ui/ uses a raw Tailwind palette
 * class, a raw font size, a raw border radius, a raw font weight, or a
 * hardcoded hex colour.
 *
 * WHY THIS EXISTS
 * A reskin is a two-file job — tailwind.config.js plus src/components/ui/ —
 * only as long as nothing else hardcodes appearance. One `bg-green-600` in one
 * screen and that promise quietly stops being true. A convention nobody checks
 * is a convention that erodes; this turns it into a build failure.
 *
 * WHAT IS STILL ALLOWED EVERYWHERE
 * Layout utilities: flex, flex-1, gap-2, px-4, mt-6, w-full, items-center,
 * absolute, rounded-card (a token), text-heading-lg (a token) …
 * Appearance comes from tokens; layout does not.
 *
 * HOW IT SCANS
 * Only string literals are examined, so prose in comments never trips it.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Files allowed to name raw values: the reskin surface itself. */
const EXEMPT = [
  join("src", "components", "ui"),
  join("src", "api", "schema.d.ts"), // generated
  "tailwind.config.js",
  "global.css",
  "scripts",
  "node_modules",
  ".git",
  ".expo",
  "assets",
];

const PALETTE =
  "inherit|current|transparent|black|white|slate|gray|grey|zinc|neutral|stone|" +
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|" +
  "violet|purple|fuchsia|pink|rose";

const PREFIX =
  "bg|text|border|ring|from|via|to|shadow|divide|placeholder|caret|accent|" +
  "decoration|outline|fill|stroke";

const ATURAN = [
  {
    nama: "warna palet mentah",
    saran: "pakai token semantik: bg-surface, text-ink-secondary, border-outline, bg-danger-surface",
    uji: new RegExp(`^(${PREFIX})-(${PALETTE})(-\\d{2,3})?(\\/\\d{1,3})?$`),
  },
  {
    nama: "ukuran teks mentah",
    saran: "pakai skala tipografi: text-heading-lg, text-body, text-label, text-caption",
    uji: /^text-(xs|sm|base|lg|xl|[2-9]xl)$/,
  },
  {
    nama: "radius mentah",
    saran: "pakai token radius: rounded-control, rounded-card, rounded-sheet, rounded-pill",
    uji: /^rounded(-(sm|md|lg|xl|2xl|3xl|full|none))?$/,
  },
  {
    nama: "bobot font mentah",
    saran: "bobot sudah termasuk dalam skala tipografi (text-heading-md dst.)",
    uji: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  },
  {
    nama: "nilai arbitrer / hex",
    saran: "tambahkan token baru di tailwind.config.js daripada menulis nilai langsung",
    uji: /\[#[0-9a-fA-F]{3,8}\]|^#[0-9a-fA-F]{3,6}$/,
  },
];

function dikecualikan(jalur) {
  const rel = relative(root, jalur);
  return EXEMPT.some((e) => rel === e || rel.startsWith(e + sep));
}

function kumpulkanBerkas(dir, keluar = []) {
  for (const entri of readdirSync(dir)) {
    const penuh = join(dir, entri);
    if (dikecualikan(penuh)) continue;
    if (statSync(penuh).isDirectory()) kumpulkanBerkas(penuh, keluar);
    else if (/\.(tsx?|jsx?)$/.test(entri)) keluar.push(penuh);
  }
  return keluar;
}

/** Every string literal in the file, with its line number. */
function literalString(isi) {
  const hasil = [];
  const pola = /"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g;
  let cocok;
  while ((cocok = pola.exec(isi)) !== null) {
    const teks = cocok[1] ?? cocok[2] ?? cocok[3] ?? "";
    if (!teks.trim()) continue;
    hasil.push({ teks, baris: isi.slice(0, cocok.index).split("\n").length });
  }
  return hasil;
}

const pelanggaran = [];
for (const berkas of kumpulkanBerkas(root)) {
  const isi = readFileSync(berkas, "utf8");
  for (const { teks, baris } of literalString(isi)) {
    for (const kata of teks.split(/\s+/)) {
      const kelas = kata.split(":").pop(); // buang varian: hover:, dark:, md:
      if (!kelas) continue;
      for (const aturan of ATURAN) {
        if (aturan.uji.test(kelas)) {
          pelanggaran.push({
            berkas: relative(root, berkas),
            baris,
            kelas,
            aturan: aturan.nama,
            saran: aturan.saran,
          });
        }
      }
    }
  }
}

if (pelanggaran.length === 0) {
  console.log("OK  tidak ada kelas Tailwind mentah di luar src/components/ui/");
  console.log("    Reskin tetap cukup dengan mengubah tailwind.config.js + ui/.");
  process.exit(0);
}

console.error(`GAGAL  ${pelanggaran.length} penggunaan nilai mentah ditemukan:\n`);
for (const p of pelanggaran) {
  console.error(`  ${p.berkas}:${p.baris}`);
  console.error(`      "${p.kelas}"  — ${p.aturan}`);
  console.error(`      ${p.saran}\n`);
}
console.error(
  "Setiap warna, ukuran teks, dan radius harus lewat token di tailwind.config.js.\n" +
    "Lihat komentar di berkas itu untuk daftar token yang tersedia.",
);
process.exit(1);
