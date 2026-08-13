# Frontend handoff — perubahan dari sisi backend

Aidam mengerjakan backend. Berkas ini mencatat setiap perubahan yang menyentuh
`TERRA-FE`, supaya tidak ada yang berubah di frontend tanpa kamu tahu.

Semua perubahan memakai `components/ui` dan token dari `tailwind.config.js` —
tidak ada kelas Tailwind mentah, tidak ada hex. `npm run lint:tokens` lulus
untuk setiap berkas di bawah.

**Yang sengaja TIDAK disentuh:** `CommunityScreen.tsx` dan `ProfileScreen.tsx`.
Keduanya sedang kamu desain ulang, jadi dibiarkan utuh agar tidak bentrok.

---

## Ringkasan

| # | Perubahan | Berkas | Perlu tindakan darimu? |
|---|---|---|---|
| 1 | Tombol "Tandai sudah tersalurkan" | `screens/farmer/RecommendationsScreen.tsx` | Tidak |
| 2 | Layar "Ubah lokasi" (baru) | `screens/shared/EditLocationScreen.tsx` | **Ya — 1 tombol** |
| 3 | Bagian "Sudah diberi tahu" | `screens/farmer/MatchesScreen.tsx` | Tidak |
| 4 | Foto dari galeri + multi-pilih | `lib/media.ts`, `screens/farmer/NewOfferScreen.tsx` | Tidak |
| 5 | Perbaikan unggah foto di web | `api/endpoints.ts` | Tidak |
| 6 | Layar "Jelajahi pasokan" (baru) | `screens/buyer/BrowseOffersScreen.tsx` | Tidak |
| 7 | Layar "Tempat penyaluran" (baru) | `screens/farmer/VenuesScreen.tsx` | Tidak |
| 8 | Hook baru `useKecocokanPenawaran` | `hooks/useMatches.ts` | Tidak |
| 9 | Registrasi 3 layar baru | `navigation/RootNavigator.tsx`, `navigation/types.ts` | Tidak |

---

## 1. Tombol "Tandai sudah tersalurkan"

**Berkas:** `src/screens/farmer/RecommendationsScreen.tsx`

**Kenapa:** hook `useTandaiTersalurkan` sudah ada sejak commit pertama tapi tidak
pernah dipanggil layar mana pun. Akibatnya `tingkat_penyaluran` di dasbor dampak
(= tersalurkan / dibuat) **selalu 0 untuk pengguna sungguhan** — angkanya cuma
terlihat benar di demo karena data seed menuliskan statusnya langsung.

**Yang ditambahkan:** satu `Button` di bawah "Bagikan kartu penawaran", muncul
hanya bila status penawaran belum `tersalurkan`. Setelah ditekan, sebuah `Card`
bernada `success` menggantikannya.

**Kalau mau dipindah:** blok tombol + `Card` konfirmasi + `ErrorState` bisa
dipindah utuh ke layar lain; yang dibutuhkan hanya `params.idPenawaran`.

---

## 2. Layar "Ubah lokasi" — **butuh satu tombol darimu**

**Berkas baru:** `src/screens/shared/EditLocationScreen.tsx`
**Sudah terdaftar di:** `RootNavigator.tsx` sebagai `"UbahLokasi"`

**Kenapa:** hook `usePerbaruiLokasi` juga tidak pernah dipakai, jadi lokasi tidak
bisa diubah setelah daftar (PRD A-02). Lokasi menentukan **semua** jarak di
aplikasi: radius pencocokan pembeli, daftar tempat penyaluran, dan pemeriksaan
geotag foto. Salah pin saat daftar = ketiganya ikut salah, selamanya.

**Kenapa layar terpisah, bukan di ProfileScreen:** `ProfileScreen.tsx` sedang
kamu ubah. Menambah form di sana pasti bentrok. Jadi layarnya berdiri sendiri.

**Yang perlu kamu lakukan — satu tombol di `ProfileScreen.tsx`:**

```tsx
<Button
  label="Ubah lokasi"
  variant="secondary"
  icon="location-outline"
  onPress={() => navigation.navigate("UbahLokasi")}
/>
```

Letakkan di dekat tombol "Riwayat transaksi" / "Dampak saya" yang sudah ada.
`navigation` sudah tersedia di layar itu, tipe rutenya sudah terdaftar, jadi
tidak ada impor tambahan.

**Cara tahu sudah tersambung:** `npm run smoke` punya langkah yang otomatis
melewati diri sendiri selama tombol ini belum ada, dan berjalan sendiri begitu
tombolnya muncul:

```
16. TULIS: ubah lokasi terdaftar (A-02)
  ! tombol "Ubah lokasi" belum ada di ProfileScreen — dilewati.
```

---

## 3. Bagian "Sudah diberi tahu"

**Berkas:** `src/screens/farmer/MatchesScreen.tsx`

Daftar pembeli di atasnya dihitung ulang setiap dibuka. Bagian baru ini
menampilkan **kecocokan yang tersimpan** — pembeli yang benar-benar menerima
notifikasi saat penawaran diterbitkan (PRD E-02/E-03). Muncul hanya bila ada
isinya, jadi layar lama tidak berubah bila kosong.

Memakai hook baru `useKecocokanPenawaran` di `hooks/useMatches.ts`.

---

## 4. Foto boleh dari galeri, dan boleh banyak sekaligus

**Berkas:** `src/lib/media.ts`, `src/screens/farmer/NewOfferScreen.tsx`,
`app.json` (teks izin)

PRD F-01 dulu melarang galeri supaya waktu dan lokasi foto dijamin asli.
Aturannya dilonggarkan. Jaminannya **tidak dipalsukan** untuk menutupi itu —
asal foto dicatat per berkas:

| Sumber | Metadata | Badge |
|---|---|---|
| Kamera | waktu + koordinat perangkat | `Kamera` (hijau) |
| Galeri **ber-EXIF** | waktu + GPS dari berkasnya | `Galeri · berlokasi` (biru) |
| Galeri **tanpa EXIF** | tidak ada, dan tidak dikarang | `Galeri · tanpa lokasi` (kuning) |

Backend sudah menangani ini sejak awal: `metadata_lengkap` jadi `false` bila ada
foto tanpa waktu/koordinat. Tidak ada perubahan backend.

**Catatan desain:** badge ditampilkan **per foto**, bukan diringkas, supaya
petani yang mencampur satu foto kamera dengan dua foto galeri tahu foto mana
yang membawa lokasi.

---

## 5. Perbaikan unggah foto di web

**Berkas:** `src/api/endpoints.ts`

`FormData.append("foto", { uri, name, type })` itu konvensi React Native. Di web
objek itu berubah jadi teks `"[object Object]"`, server menerima field teks
padahal menunggu berkas, dan balasannya **422 tanpa penjelasan**. Sekarang jalur
web mengubah URI jadi `File` sungguhan. Perilaku di Android tidak berubah.

---

## 6–7. Dua layar baru

- **`screens/buyer/BrowseOffersScreen.tsx`** — pembeli menjelajah semua pasokan
  terbuka, bukan cuma yang cocok dengan permintaannya. Diakses dari tombol
  "Jelajahi semua pasokan" di beranda pembeli.
- **`screens/farmer/VenuesScreen.tsx`** — pasar/peternak terdekat dari data
  terbuka OpenStreetMap, untuk saat belum ada pembeli terdaftar.

  ⚠️ **Footer atribusi di layar ini wajib.** Datanya berlisensi ODbL; atribusi
  "© OpenStreetMap contributors" adalah syarat lisensi, bukan hiasan. Jangan
  dihapus saat mendesain ulang.

---

## Cara memastikan tidak ada yang rusak

```bash
npm run check     # typecheck + lint token
npm run smoke     # jalankan alur asli di browser (~2 menit)
npm run smoke:watch   # sama, tapi jendelanya terlihat
```

`npm run check` **saat ini belum lulus** karena `CommunityScreen.tsx`
(2 galat tipe + kelas mentah) dan `ProfileScreen.tsx` (1 kelas mentah) — itu
bagian yang sedang kamu kerjakan, bukan dari perubahan di atas.

---

## Yang sengaja TIDAK dibuat

**Layar tinjau laporan ketidaksesuaian.** Endpoint `POST /laporan/{id}/tinjau`
ada dan berfungsi, tapi backend **belum punya peran moderator** — endpoint itu
terbuka untuk semua pengguna login. Membuat layarnya sekarang berarti siapa pun
bisa mengonfirmasi atau menolak laporan terhadap siapa pun, termasuk membersihkan
laporan terhadap dirinya sendiri. Itu langsung memengaruhi skor akurasi (F-05).

**Urutannya: backend menambah pembatasan peran dulu, baru layarnya dibuat.**
Aidam sudah tahu soal ini.

Empat rute lain (`GET /reputasi/{id}`, `GET /onboarding/pembeli`,
`GET /klasifikasi/{id}`) juga tidak dipakai layar mana pun, tapi datanya sudah
sampai ke UI lewat jalur lain — jadi itu rute berlebih, bukan fitur yang hilang.
Bisa dihapus dari `endpoints.ts` kalau mau bersih-bersih.
