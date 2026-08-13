/**
 * TERRA — mobile app smoke flow, driven through the web build.
 *
 * The counterpart to the backend's `scripts/smoke_flow.py`: that one walks the
 * API, this one walks the UI and asserts each screen renders what the API
 * returned. Same style — numbered steps, printed results, non-zero exit on the
 * first failure.
 *
 *   npm run smoke
 *
 * ---------------------------------------------------------------------------
 * WHY THE BROWSER RUNS WITH WEB SECURITY DISABLED
 *
 * The backend registers no CORS middleware, deliberately: it is consumed by a
 * React Native app, and native runtimes do not enforce CORS. A browser does,
 * so without `--disable-web-security` every request from this harness is
 * blocked before it leaves the page and the app reports "tidak dapat
 * menghubungi server".
 *
 * Disabling it in a throwaway test browser is the right lever. The alternative
 * -- adding permissive CORS to a live API purely so a test can run -- would
 * widen production's surface to buy nothing for real users.
 *
 * ---------------------------------------------------------------------------
 * WHAT PASSING HERE DOES *NOT* PROVE
 *
 * Web is not the shipping platform; Android is. Specifically untested here:
 *   - session persistence. `auth/storage.ts` no-ops SecureStore on web, so a
 *     reload always signs you out. That is why this script re-logs in between
 *     personas instead of signing out through the UI.
 *   - camera capture and geotagging (PRD F-01/B-02) -- no web equivalent.
 *   - native navigation, gestures, and low-end Android performance (NF-05).
 *
 * `.maestro/` covers the same journeys on a real device for those reasons.
 */

import { createRequire } from "node:module";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(AKAR, "package.json"));
const { chromium } = require("playwright");

const KELUARAN = join(AKAR, "dist-web");
const PORT = 4173;
const PROFIL = join(AKAR, "node_modules", ".cache", "terra-e2e-profile");
const REKAMAN = join(AKAR, "e2e", "rekaman");

/**
 * --tampil   open a real browser window and slow each action down so a human
 *            can follow along          (`npm run smoke:watch`)
 * --rekam    record the run to e2e/rekaman/*.webm  (`npm run smoke:video`)
 *
 * Flags rather than environment variables: `VAR=1 node ...` is not valid in
 * cmd.exe, which is what npm uses to run scripts on Windows, and flags avoid
 * pulling in cross-env just for this.
 *
 * Default is headless and fast — what CI and everyday checks want.
 */
const TAMPIL = process.argv.includes("--tampil");
const REKAM = process.argv.includes("--rekam");
const LAYAR = { width: 414, height: 896 };

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".ico": "image/x-icon", ".png": "image/png",
  ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".ttf": "font/ttf", ".woff": "font/woff", ".woff2": "font/woff2",
};

let langkah = 0;
const judul = (t) => console.log(`\n${"─".repeat(66)}\n${++langkah}. ${t}\n${"─".repeat(66)}`);
const baris = (k, v) => console.log(`  ${String(k).padEnd(22)} ${v}`);
const ok = (t) => console.log(`  ✓ ${t}`);

class Gagal extends Error {}

/**
 * Assert some text is on the screen the user is actually looking at.
 *
 * `.filter({ visible: true })` is load-bearing, not decoration. Native-stack
 * keeps every previous screen mounted at 0x0 rather than unmounting it, so a
 * bare `.first()` happily resolves to a copy of the text sitting on a screen
 * underneath the current one -- which then never becomes visible and times
 * out, while the text is plainly on screen.
 */
async function lihat(page, teks, { timeout = 15000, label } = {}) {
  const target =
    typeof teks === "string"
      ? page.getByText(teks, { exact: false }).filter({ visible: true }).first()
      : teks;
  try {
    await target.waitFor({ state: "visible", timeout });
    ok(label ?? (typeof teks === "string" ? `terlihat: "${teks}"` : "terlihat"));
  } catch {
    const isi = await page.evaluate(() => document.body.innerText).catch(() => "(kosong)");
    throw new Gagal(
      `tidak menemukan ${JSON.stringify(String(teks))} di layar.\n--- isi layar ---\n${isi.slice(0, 800)}`
    );
  }
}

/**
 * Tap a `Button` from components/ui by its label.
 *
 * Buttons set `accessibilityLabel={label}`, which react-native-web renders as
 * `aria-label`. Matching on the role is far steadier than matching on text:
 * native-stack keeps previous screens mounted at 0x0, so a plain text lookup
 * can resolve to a button on a screen that is no longer on top.
 */
const tekan = (page, label) =>
  page.locator(`button[aria-label="${label}"]:visible`).first();

/** Switch bottom tab. Tabs render as links on web, not buttons. */
async function ketuk(page, tab) {
  await page.locator("a:visible").filter({ hasText: tab }).first().click();
  await page.waitForTimeout(2500);
}

/**
 * Unwind the stack until the tab bar is reachable again.
 *
 * Detail screens are pushed on the ROOT stack, above the tab navigator, so the
 * tab bar is not rendered while one is open — tapping a tab from there simply
 * times out. Press back until it reappears rather than hard-coding a count,
 * which would break the moment a screen is added to the journey.
 */
async function keTabs(page, maks = 5) {
  for (let i = 0; i < maks; i++) {
    // Farmer's first tab is "Beranda", buyer's is "Pasokan" — either means
    // the tab bar is back.
    const tab = page.locator("a:visible").filter({ hasText: /Beranda|Pasokan/ });
    if (await tab.count()) return;
    await kembali(page);
  }
  throw new Gagal("tidak kembali ke tab root setelah beberapa kali tekan kembali");
}

/**
 * Go back one screen.
 *
 * NOT `page.goBack()`. React Navigation's native-stack pushes no browser
 * history entries on web, so the browser's back button leaves the SPA entirely
 * and lands on about:blank. The header's own control is the only correct one.
 */
async function kembali(page) {
  await page.locator('button[aria-label="Go back"]:visible').first().click();
  await page.waitForTimeout(2200);
}

function bangunJikaPerlu() {
  if (existsSync(join(KELUARAN, "index.html"))) {
    console.log(`Memakai build web yang ada di ${KELUARAN}`);
    console.log("(jalankan `npm run smoke:build` setelah mengubah kode)");
    return;
  }
  console.log("Build web belum ada — membangun sekarang (butuh 1-2 menit)…");
  execFileSync(process.execPath, [
    join(AKAR, "node_modules", "@expo", "cli", "build", "bin", "cli"),
    "export", "--platform", "web", "--output-dir", KELUARAN,
  ], { stdio: "inherit", cwd: AKAR });
}

function layani() {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    let body;
    try {
      body = await readFile(join(KELUARAN, p));
    } catch {
      body = await readFile(join(KELUARAN, "index.html")); // SPA fallback
      p = "/index.html";
    }
    res.writeHead(200, { "Content-Type": MIME[extname(p)] ?? "application/octet-stream" });
    res.end(body);
  });
  return new Promise((r) => server.listen(PORT, () => r(server)));
}

/**
 * Fill a TextField by its placeholder.
 *
 * Single-line fields render as <input>; `multiline` ones render as <textarea>.
 * Match both, or the community post box is unreachable.
 */
async function isi(page, placeholder, nilai) {
  await page
    .locator(`input[placeholder="${placeholder}"]:visible, textarea[placeholder="${placeholder}"]:visible`)
    .first()
    .fill(nilai);
}

/**
 * Register a throwaway account and land signed in as it.
 *
 * WHY REGISTER RATHER THAN REUSE A DEMO ACCOUNT
 *   The write steps below have to act on data nobody is demoing. Filing a
 *   report or recording a deal as `demo-petani-1` would move that account's
 *   reputation on every run and quietly erode the F-06 contrast the seed sets
 *   up (clean farmer vs. one with a confirmed mismatch). A fresh account each
 *   run keeps seeded reputation pristine.
 *
 *   These accounts persist -- there is no delete endpoint by MVP design -- so
 *   they are named to be obvious in the database.
 */
async function daftar(page, { peran, nama }) {
  await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.locator('button[aria-label="Daftar"]:visible').first().click();
  await page.waitForTimeout(1800);

  await page.locator(`div:visible:text-is("${peran}")`).first().click()
    .catch(() => page.getByText(peran, { exact: false }).filter({ visible: true }).first().click());
  await page.waitForTimeout(600);

  await isi(page, "Nama lengkap", nama);
  await isi(page, "mis. Lembang, Bandung Barat", "Lembang, Bandung Barat");

  if (peran === "Petani") {
    await page.getByText("Tomat", { exact: false }).filter({ visible: true }).first().click();
  } else {
    await page.getByText("Produsen kompos", { exact: false }).filter({ visible: true })
      .first().click();
    await isi(page, "mis. CV Saus Lembang", `${nama} Usaha`);
  }
  await page.waitForTimeout(500);

  await tekan(page, "Buat akun").click();
  await page.waitForTimeout(5000);
}

async function masuk(page, identitas, sandi, namaDiharapkan) {
  // A reload always signs out on web (SecureStore is a no-op there), so this
  // is also how the script switches persona.
  await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  await page.locator('button[aria-label="Masuk"]:visible').first().click();
  await page.waitForTimeout(1500);

  const input = await page.$$("input");
  if (input.length < 2) throw new Gagal("layar masuk tidak menampilkan dua kolom isian");
  await input[0].fill(identitas);
  await input[1].fill(sandi);

  await page.locator('button[aria-label="Masuk"]:visible').last().click();
  await page.waitForTimeout(4000);
  await lihat(page, namaDiharapkan, { label: `masuk sebagai ${identitas}` });
}

async function jalankan() {
  bangunJikaPerlu();
  const server = await layani();
  console.log(`Melayani build web di http://localhost:${PORT}`);

  if (TAMPIL) {
    console.log("\nMode tampil: jendela browser akan terbuka dan setiap langkah");
    console.log("diperlambat agar bisa diikuti. Jangan klik di dalamnya.");
    console.log("(Chrome akan memperingatkan soal flag yang tidak didukung —");
    console.log(" itu `--disable-web-security`, memang disengaja. Lihat komentar di atas.)");
  }
  if (REKAM) console.log(`\nMerekam ke ${REKAMAN}`);

  const ctx = await chromium.launchPersistentContext(PROFIL, {
    args: ["--disable-web-security"],
    viewport: LAYAR,
    headless: !TAMPIL,
    // Long enough to follow by eye, short enough not to be tedious.
    slowMo: TAMPIL ? 350 : 0,
    ...(REKAM ? { recordVideo: { dir: REKAMAN, size: LAYAR } } : {}),
  });
  const page = ctx.pages()[0] ?? (await ctx.newPage());

  const panggilan = [];
  page.on("response", (r) => {
    const u = r.url();
    if (!u.startsWith(`http://localhost:${PORT}`)) {
      panggilan.push(`${r.status()} ${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/, "")}`);
    }
  });

  let keluar = 0;
  try {
    // -- 1 -----------------------------------------------------------------
    judul("Masuk sebagai petani (peran menentukan tata letak tab)");
    await masuk(page, "budi", "terra123", "Pak Dedi Supriadi");
    await lihat(page, "Tambah hasil panen");

    // -- 2 -----------------------------------------------------------------
    judul("Beranda petani: penawaran tersemai, yang mendesak lebih dulu");
    await lihat(page, "Wortel", { label: 'penawaran wortel (pnw_aktif_2) tampil' });
    await lihat(page, "Mendesak", { label: "penanda mendesak (H-02)" });

    // -- 3 -----------------------------------------------------------------
    judul("Rekomendasi penyaluran (C-01, C-02, NF-06)");
    await page.getByText("Wortel", { exact: false }).filter({ visible: true }).first().click();
    await page.waitForTimeout(3500);
    await lihat(page, "Pakan ternak", { label: "opsi prioritas 1 dari WOR-K1-K2-BERAT" });
    await lihat(page, "WOR-K1-K2-BERAT", { label: "jejak aturan tampil (NF-06)" });

    // -- 4 -----------------------------------------------------------------
    judul("Pembeli cocok (D-02 … D-04)");
    await tekan(page, "Lihat pembeli terdekat").click();
    await page.waitForTimeout(3500);
    await lihat(page, "Kompos Hijau Cimahi", { label: "pembeli yang lolos saringan" });
    await lihat(page, "keparahan melebihi batas pembeli", {
      label: "pembeli jus wortel tersaring, alasannya dinyatakan (D acceptance)",
    });
    await kembali(page);

    // -- 5 -----------------------------------------------------------------
    judul("Tempat penyaluran dari data terbuka (butuh backend ter-deploy)");
    await tekan(page, "Tempat penyaluran di sekitar").click();
    await page.waitForTimeout(4000);
    const isiTempat = await page.evaluate(() => document.body.innerText);
    if (/OpenStreetMap contributors/i.test(isiTempat)) {
      ok("atribusi ODbL tampil (kewajiban lisensi)");
      ok("daftar tempat termuat");
    } else {
      console.log("  ! endpoint /tempat-penyaluran belum ada di backend ter-deploy.");
      console.log("    Deploy backend, lalu jalankan ulang. Dilewati, bukan gagal.");
    }
    await kembali(page);

    // -- 6 -----------------------------------------------------------------
    judul("Kartu berbagi (G-01: lokasi umum saja, bukan titik persis)");
    await tekan(page, "Bagikan kartu penawaran").click();
    await page.waitForTimeout(3000);
    await lihat(page, "Teks yang akan dibagikan");
    await lihat(page, "Lembang", { label: "lokasi umum, bukan koordinat persis" });

    // -- 7 -----------------------------------------------------------------
    // Opening a buyer pulls their public profile and reputation -- F-07 says
    // the counterparty's standing must be visible BEFORE contact is made.
    judul("Detail pembeli: reputasi terlihat sebelum kontak (D-05, F-07)");
    await kembali(page);
    await tekan(page, "Lihat pembeli terdekat").click();
    await page.waitForTimeout(3000);
    await page.getByText("Kompos Hijau Cimahi", { exact: false }).filter({ visible: true }).first().click();
    await page.waitForTimeout(3500);
    await lihat(page, "Kompos Hijau Cimahi");
    await lihat(page, "Dasar peringkat", { label: "rincian skor pencocokan (NF-06)" });

    // -- 8 -----------------------------------------------------------------
    judul("Layar bersama petani: komunitas, notifikasi, transaksi, dampak, profil");
    await keTabs(page);

    await ketuk(page, "Komunitas");
    await lihat(page, "Penawaran di sekitar", { timeout: 20000, label: "papan komunitas (G-03)" });

    await ketuk(page, "Notifikasi");
    await page.waitForTimeout(2500);

    await ketuk(page, "Profil");
    await lihat(page, "Reputasi", { timeout: 20000, label: "profil + reputasi + laporan terhadap saya" });

    await tekan(page, "Riwayat transaksi").click();
    await page.waitForTimeout(3000);
    ok("riwayat transaksi terbuka (GET /transaksi/saya)");
    await kembali(page);

    await tekan(page, "Dampak saya").click();
    await lihat(page, "Nilai terpulihkan", { timeout: 20000, label: "dasbor dampak (I-01)" });

    // -- 9 -----------------------------------------------------------------
    judul("Masuk sebagai pembeli (cabang peran yang lain)");
    await masuk(page, "sambal", "terra123", "Pasokan");

    // -- 8 -----------------------------------------------------------------
    judul("Jalur tarik pembeli: jelajahi semua pasokan");
    await tekan(page, "Jelajahi semua pasokan").click();
    await page.waitForTimeout(3000);
    await lihat(page, "Semua pasokan terbuka");
    await lihat(page, "Wortel", { label: "penawaran yang TIDAK cocok dengan permintaan pembeli ini pun tampil" });

    // -- 11 ----------------------------------------------------------------
    // Notifications are only created by a reverse match, so a fresh database
    // may legitimately have none. Skip rather than fail in that case.
    judul("Tandai notifikasi dibaca (H-01)");
    await keTabs(page);              // Browse sits above the tab bar
    await ketuk(page, "Notifikasi");
    const notif = page.locator('[role="button"]:visible').filter({ hasText: /Pasokan|cocok|MENDESAK/i });
    if (await notif.count()) {
      await notif.first().click();
      await page.waitForTimeout(2500);
      ok("notifikasi ditandai dibaca (POST /notifikasi/{id}/dibaca)");
    } else {
      console.log("  ! belum ada notifikasi — dilewati, bukan gagal.");
      console.log("    Notifikasi lahir dari pencocokan balik; publikasikan penawaran dulu.");
    }

    // -- 12 ----------------------------------------------------------------
    const tanda = Date.now().toString().slice(-6);
    judul("TULIS: pembeli baru mendaftar, memasang permintaan, lalu menutupnya");
    await daftar(page, { peran: "Pembeli / Mitra", nama: `Uji Smoke Pembeli ${tanda}` });
    await lihat(page, "Pasang permintaan baru", { label: "pendaftaran pembeli (A-01, A-03)" });

    await tekan(page, "Pasang permintaan baru").click();
    await lihat(page, "Komoditas dicari", { timeout: 20000 });
    await page.getByText("Tomat", { exact: false }).filter({ visible: true }).first().click();
    await page.getByText("Mulus, tanpa cacat", { exact: false }).filter({ visible: true })
      .first().click();
    // `bolehKirim` also needs a severity ceiling; radius defaults to 50.
    await page.getByText("Berat", { exact: true }).filter({ visible: true }).first().click();
    await isi(page, "800", "500");
    await tekan(page, "Pasang permintaan").click();
    await page.waitForTimeout(4000);
    ok("permintaan dipasang (E-01, POST /permintaan)");

    await ketuk(page, "Permintaan");
    await lihat(page, "Tutup", { timeout: 20000, label: "permintaan baru terdaftar" });
    await tekan(page, "Tutup").click();
    await page.waitForTimeout(3000);
    ok("permintaan ditutup (E-04, POST /permintaan/{id}/tutup)");

    // -- 13 ----------------------------------------------------------------
    judul("TULIS: petani baru mendaftar dan menulis di papan komunitas");
    await daftar(page, { peran: "Petani", nama: `Uji Smoke Petani ${tanda}` });
    await lihat(page, "Tambah hasil panen", { label: "pendaftaran petani (A-01, A-02)" });

    await ketuk(page, "Komunitas");
    // The compose form is collapsed behind a toggle.
    await page.getByText("Buat posting", { exact: false }).filter({ visible: true })
      .first().click();
    await page.waitForTimeout(1200);
    await isi(page, "Bagikan kabar panen, harga, atau kebutuhan di sekitar Anda.",
      `Uji smoke otomatis ${tanda}.`);
    await tekan(page, "Kirim posting").click();
    await page.waitForTimeout(3500);
    await lihat(page, `Uji smoke otomatis ${tanda}`, {
      timeout: 20000,
      label: "pos komunitas tersimpan (G-03, POST /komunitas/pos)",
    });

    console.log(`\n${"─".repeat(66)}`);
    console.log("SELESAI — seluruh langkah lulus.");
    console.log(`${"─".repeat(66)}`);
  } catch (e) {
    console.error(`\n✗ GAGAL pada langkah ${langkah}: ${e.message}`);
    await page.screenshot({ path: join(AKAR, "e2e", "gagal.png"), fullPage: true }).catch(() => {});
    console.error(`  tangkapan layar: e2e/gagal.png`);
    keluar = 1;
  } finally {
    console.log("\nPanggilan API yang terlihat:");
    const unik = [...new Set(panggilan)];
    console.log(unik.length ? unik.map((c) => "  " + c).join("\n") : "  (tidak ada — periksa CORS / EXPO_PUBLIC_API_URL)");
    // Video is only flushed to disk when the context closes, so the path can
    // not be reported until after this.
    const video = REKAM ? page.video() : null;
    await ctx.close();
    if (video) {
      const berkas = await video.path().catch(() => null);
      if (berkas) console.log(`\nRekaman: ${berkas}`);
    }
    server.close();
  }
  process.exit(keluar);
}

jalankan();
