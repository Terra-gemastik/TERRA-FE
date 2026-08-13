# TERRA — Mobile App

React Native + Expo client for the TERRA backend. Built for **GEMASTIK 2026**.

Every screen talks to the real API. **Nothing is mocked on this side** — where
something is a placeholder, it is a placeholder *in the backend*, and this app
labels it as such on screen rather than hiding it.

**The visual design is deliberately unfinished.** Grey palette, one muted
accent, system fonts, no illustrations. It is meant to be replaced wholesale by
a designer without touching a single line of business logic — see
[Reskinning](#reskinning).

Backend repo: `../TERRA-BE` (separate git repository).

---

## Quick start

```bash
npm install
cp .env.example .env        # then set EXPO_PUBLIC_API_URL
npm start                   # press 'a' for Android, or scan the QR
```

The backend must be running and seeded:

```bash
cd ../TERRA-BE
python -m scripts.init_db --seed
uvicorn terra.main:app --host 0.0.0.0 --port 8000
```

`--host 0.0.0.0` matters: without it the API only listens on loopback and a
phone or emulator cannot reach it.

### Pointing at the backend

`EXPO_PUBLIC_API_URL` is the only thing to get right, and the usual mistake is
`localhost` — on a device that means the *phone*, not your laptop.

| Running on | Use |
|---|---|
| Android emulator | `http://10.0.2.2:8000` |
| iOS simulator | `http://127.0.0.1:8000` |
| Physical device | `http://<your-LAN-IP>:8000` (`ipconfig`) |
| Deployed | `https://<project>.vercel.app` |

### Signing in

Press a demo chip on the login screen, or type a token:

`demo-petani-1`, `demo-petani-2`, `demo-pembeli-1` … `demo-pembeli-6`

Those are seeded accounts in the backend database. They authenticate for real.

---

## ⚠️ Auth is not JWT — read this before changing it

The backend's security scheme, straight from `openapi.json`:

```json
"APIKeyHeader": { "type": "apiKey", "in": "header", "name": "X-Terra-Token" }
```

An **opaque token in a custom header**, not `Authorization: Bearer`, and there
is **no `/login` endpoint** anywhere in the API. Tokens are minted only by
`POST /onboarding/petani` and `POST /onboarding/pembeli`; `GET /onboarding/saya`
is the only way to check one. That is intentional on the backend side —
production-grade auth is explicitly out of MVP scope there.

So the login screen takes a token and validates it against the API. Registration
returns a token and signs you straight in.

**To move to real JWT later**, everything is funnelled through
[`src/auth/session.ts`](src/auth/session.ts):

1. `headerAuth()` → return `{ Authorization: \`Bearer ${token}\` }`
2. add a `login()` call in `src/api/endpoints.ts`, call it from `LoginScreen`
3. handle refresh around the existing 401 hook in `src/api/client.ts`

No screen, hook or component reads the token directly, so nothing else changes.

---

## The API client is generated, not hand-written

`openapi.json` is copied from the backend and is the contract. Types come from
it via `openapi-typescript` — **never from memory**.

```bash
# in the backend repo, after any request/response change:
python -m scripts.export_openapi
cp openapi.json ../TERRA-FE/openapi.json

# here:
npm run generate:api      # openapi.json -> src/api/schema.d.ts
npm run typecheck         # renamed/removed fields surface as errors
```

`src/api/schema.d.ts` is generated — do not hand-edit it. `src/api/types.ts`
only gives its types shorter names.

This already earned its keep: the generated types correctly marked
`penawaran_aktif`, `rincian_komoditas`, `komoditas_utama` and `pembeli` as
optional, which caught four places where the UI would have crashed on a
response that legitimately omits them.

---

## Reskinning

**Two places. Nothing else.**

### 1. `tailwind.config.js` — the tokens

Semantic names only: `brand`, `surface`, `ink`, `outline`, `danger`, `warning`,
`success`, `info`, a type scale (`heading-lg` … `caption`), spacing
(`tight`/`snug`/`gutter`/`section`/`page`) and radii
(`control`/`card`/`sheet`/`pill`).

Change the **values**, keep the **key names**. Screens reference the names.

### 2. `src/components/ui/` — the components

`Screen`, `Text`, `Button`, `Card`, `TextField`, `Select`, `MultiSelect`,
`Badge`, `ConditionBadge`, `ListItem`, `EmptyState`, `ErrorState`,
`LoadingSpinner`, `QueryState`, `StatTile`, `KeyValue`, `SectionHeader`,
`Stack`, `Divider`.

Every screen composes only from these. Change how a Button looks here and every
button in the app changes.

There is one duplication: `src/components/ui/tokens.ts` holds hex literals for
React Native props that cannot take a `className` (navigation theme,
`ActivityIndicator`, `Ionicons`, `placeholderTextColor`). **Keep it in sync with
`tailwind.config.js`** — the linter cannot check that one.

### The rule, and how it is enforced

No file outside `src/components/ui/` may use a raw Tailwind palette class, a raw
font size, a raw radius, a raw font weight, or a hex literal.

```bash
npm run lint:tokens
```

It scans every string literal outside the UI folder and **fails the build on a
single violation**, naming the file, line, class and the token to use instead.
Layout utilities (`flex`, `gap-4`, `px-2`, `w-full`) remain allowed everywhere —
appearance goes through tokens, layout does not.

```bash
npm run check     # typecheck + lint:tokens
```

---

## Structure

```
openapi.json              contract, copied from the backend
tailwind.config.js        ★ RESKIN SURFACE 1 — tokens
src/
  api/       schema.d.ts (generated) · client.ts · endpoints.ts · types.ts
  auth/      AuthContext.tsx · session.ts (auth seam) · storage.ts (SecureStore)
  hooks/     one file per backend module, TanStack Query only
  components/ui/          ★ RESKIN SURFACE 2 — primitives
  navigation/             role-based root + farmer/buyer tabs
  screens/   auth · farmer · buyer · shared
  lib/       domain.ts (labels) · format.ts · media.ts (camera/gallery + geotag)
scripts/     generate-api-types.mjs · check-raw-classes.mjs
```

Nothing under `screens/`, `api/`, `navigation/` or `hooks/` needs to change for
a reskin. If it would, that is a structural bug.

---

## Screens

**Auth** — Login (token entry + demo chips), Register (role selection first,
then role-specific fields).

**Farmer** — Home (own offers, urgent first) · New Offer (camera or gallery,
commodity, trigger, volume, storage) · Classification Result · Recommendations ·
Buyer Matches · Buyer Detail (reputation, WhatsApp, record a deal) · Venues
(nearby pasar/peternak from open data) · Share Card.

**Buyer** — Incoming supply (reverse matches) · Browse all supply · Post
Demand · My Demands.

### Push and pull are different screens

Worth knowing before adding anything to either side:

- **Buyer Home** is the *push* path — supply that matched a demand the buyer
  posted, delivered without them searching. Empty when their demand is narrow.
- **Browse all supply** is the *pull* path — every open offer, filterable by
  commodity, ignoring the buyer's own filters. It exists so an empty home
  screen doesn't read as "no supply exists."
- **Buyer Matches** lists people who posted a demand. **Venues** lists places
  that merely exist, from OpenStreetMap. They are separate screens with
  separate types on purpose: a venue has no price, no reputation and no
  contact, because nobody there has agreed to anything. Do not merge them.

### Venue screen carries a licence obligation

`VenuesScreen` renders OpenStreetMap data under **ODbL**, which makes
attribution mandatory. The backend returns `atribusi` and `lisensi` in the
payload and the screen prints them in the footer. **Keep that footer** — it is
a licence term, not a design detail.

**Shared** — Community board · Notifications · Profile (reputation + reports) ·
Transactions (rate, cancel, report) · Mismatch Report · Impact Dashboard.

### Photo capture

`expo-image-picker` in **both modes**: in-app camera, and gallery with
multi-select. 1–3 photos per listing (PRD B-01).

PRD F-01 used to forbid the gallery, so an offer's timestamp and coordinates
were guaranteed genuine. That was relaxed — farmers shoot harvest away from
signal and in bulk — but the guarantee is not faked to compensate. Provenance
is tracked per photo:

| Source | Metadata | Badge |
|---|---|---|
| Camera | device time + `expo-location` coordinates | `Kamera` (green) |
| Gallery **with** EXIF | timestamp + GPS read from the file | `Galeri · berlokasi` (blue) |
| Gallery **without** EXIF | none — nothing is substituted | `Galeri · tanpa lokasi` (amber) |

`lib/media.ts` reads EXIF defensively: platforms disagree on whether GPS comes
back signed or as magnitude + N/S/E/W, and `0,0` means "field present but
empty". Anything unparseable yields **no coordinate at all** rather than a
guess — a wrong coordinate is worse than a missing one, because the backend
would compare it to the farmer's registered location and flag an honest photo
as suspicious (F-02).

When sources are mixed, the classification call sends the strongest available
metadata: a camera photo with coordinates first, then any photo with
coordinates, then any with a timestamp.

The backend needed no change. `_verifikasi` already sets `metadata_lengkap:
false` when any photo lacks a timestamp or coordinates, and its own schema
notes that the server can never prove a photo came from the camera. The claim
degrades with the evidence.

Upload is `multipart/form-data` with `foto` repeated per file plus flat text
fields, matching the schema exactly. **Images are never base64-encoded into
JSON.**

---

## What is a placeholder (all of it on the backend)

| Thing | Reality | Where the app says so |
|---|---|---|
| YOLO classification | Mock classifier — plausible, varied, deterministic per photo | Classification Result shows a notice when `sumber_placeholder` is true |
| Push delivery | Composed and stored, never dispatched | Notifications screen states it; the app polls every 30s instead |
| Photo storage | Fake URLs, bytes discarded | Images may not load from `url_foto` |

The app polls notifications precisely *because* push is not wired up. When the
backend gains a real provider, drop `refetchInterval` in
`src/hooks/useNotifications.ts` and invalidate the key from the push handler.

---

## Out of scope — do not add

Mirroring the backend (PRD §3.2):

- **No transport cost anywhere.** Distance is shown because it filters and
  ranks. It is never priced, and `rentang_harga` is the buyer's produce price
  per kg, not a shipping rate.
- **No shipment pooling** on the community board — it is a passive surface.
- **No payment or escrow.** Recording a transaction records an agreement.

## Known gaps

- **A farmer cannot mark an offer as distributed.** `useTandaiTersalurkan`
  exists in `hooks/useOffers.ts` but no screen calls it, so `POST
  /penawaran/{id}/tersalurkan` is unreachable. The impact dashboard computes
  `tingkat_penyaluran` as `tersalurkan / dibuat`, which means **that metric is
  permanently 0 for real users** — it only looks right today because the seed
  hard-codes some offers to that status. Surfaced by endpoint-coverage
  analysis of the smoke flow.
- **Location cannot be changed after signup.** `usePerbaruiLokasi` is likewise
  unused, leaving `PATCH /onboarding/saya/lokasi` unreachable (PRD A-02).
- **`daftarPembeliTerdaftar` is unused** — dead code, or a screen that was
  never built.
- **Share cards produce no WhatsApp link preview.** PRD §6.7's criterion needs
  a public HTML page with OG tags; this product has no web surface by decision.
  Sharing text + image URL + deep link works.
- **Mismatch reports can be confirmed by anyone**, because the backend has no
  moderator role yet. The app only files them.
- **Buyer match list is N+1** — `GET /kecocokan/saya` returns ids only, so each
  offer is fetched separately. Fine at demo scale; a backend change would fix
  it properly.
- **SecureStore is unavailable on web**, so `--web` forgets your session on
  reload. The product targets Android.

---

## Smoke flow

`e2e/smoke_web.mjs` drives the app in a real browser and asserts each screen
renders what the API returned — the counterpart to the backend's
`scripts/smoke_flow.py`, which walks the API itself. Between them: the API
behaves, and the app shows it.

```bash
npm run smoke          # run it (headless, ~40s)
npm run smoke:watch    # same run in a visible browser, slowed down to watch
npm run smoke:video    # same run, recorded to e2e/rekaman/*.webm
npm run smoke:build    # rebuild the web bundle after changing code
```

No emulator, no device, no Android SDK. It builds the web bundle, serves it,
and walks: login as farmer → seeded offer → recommendations → buyer matches →
open-data venues → share card → login as buyer → browse all supply. Steps print
as they pass and it exits non-zero on the first failure.

Needs a seeded backend reachable at `EXPO_PUBLIC_API_URL`.

**Two things about it that are not obvious:**

- **The test browser runs with `--disable-web-security`.** The backend
  registers no CORS middleware, deliberately — it serves a native app, and
  native runtimes do not enforce CORS. A browser does, so without this every
  request is blocked before it leaves the page. Disabling it in a throwaway
  test browser beats widening a live API's surface for a test's benefit.
- **`page.goBack()` does not work here.** React Navigation's native-stack
  pushes no browser history entries, so the browser's back button leaves the
  SPA and lands on `about:blank`. Use the header's own control —
  `getByRole("button", { name: "Go back" })`, wrapped as `kembali()`.

Selectors go through `getByRole("button", { name })`, because `components/ui`
sets `accessibilityLabel` on every button and native-stack keeps previous
screens mounted at `0x0` — a plain text lookup can match a button on a screen
that is no longer on top.

### Coverage

**23 of 40 endpoints (57%), including 8 writes.** Combined with the backend's
`scripts/smoke_flow.py`: **40 of 40 (100%)**.

The write path runs end to end through the UI — register buyer → post demand →
register farmer → attach a gallery photo → classify → publish → match → record
a transaction → complete it with a rating → post to the community board.

Two things make that possible, and both are worth knowing:

- **Gallery input.** Once F-01 was relaxed to allow it, `expo-image-picker` on
  web opens a real file dialog, which Playwright answers through the
  `filechooser` event. That single interception is what unlocks publishing —
  and therefore transactions, which need an offer to exist first. The camera
  has no web equivalent, so before that change none of this was reachable.
- **Classifier retries.** The mock puts roughly 1 in 8 results below the
  confidence threshold, where B-06 correctly refuses to publish. The flow
  retries with a different fixture (each has distinct bytes, so each gives a
  different deterministic result) rather than treating a working guard as a
  failure.

Writes run entirely between **throwaway accounts the flow registers itself**
(`Uji Smoke …`). Recording a deal as `demo-petani-1` would move that account's
reputation on every run and erode the F-06 contrast the seed exists to show.

#### Write assertions check the network, not the tap

`pastikan("POST", "/transaksi", …)` fails unless a 2xx for that call appears in
the response log. This is not belt-and-braces: every form here validates and
returns early when a field is missing, so the tap succeeds, no request is sent,
and nothing appears on screen. An earlier version printed "transaksi tercatat"
in exactly that situation — the button had been tapped, `POST /transaksi` had
never been issued, and the run passed green.

#### What the remaining 17 need

| Reason | Endpoints |
|---|---|
| **App never calls them** — dead hooks with no screen | `POST /tersalurkan`, `PATCH /lokasi`, `GET /reputasi/{id}`, `GET /kecocokan`, `GET /onboarding/pembeli`, `POST /laporan/{id}/tinjau` |
| **Needs `navigator.share`**, absent headless | `POST /kartu/dibagikan` |
| **Not part of this journey** — reachable, just not walked | `POST /laporan`, `POST /batal`, `POST /tutup`, `GET /penawaran`, `POST /klasifikasi/manual`, `GET /klasifikasi/{id}` |
| **Not called by any client** | `GET /health`, `/basis-aturan`, `/api/info` |

The first row is a **product gap, not a test gap** — see "Known gaps".

### What passing here does not prove

Web is not the shipping platform. Untested by this flow: session persistence
(`auth/storage.ts` no-ops SecureStore on web, so a reload always signs you
out), camera capture and geotagging, and native navigation/performance on
low-end Android.

`.maestro/` holds equivalent flows for a real device (`npm run smoke:device`,
needs [Maestro](https://maestro.dev/docs) plus an emulator) to cover exactly
those. They have not been run on this machine.

## Verification status

Run `npm run check` (typecheck + token lint) before committing — screens under
active redesign will fail it until their raw values are swapped for tokens.

- `npm run typecheck` — every screen builds against types generated from the
  backend's own OpenAPI schema, so a renamed field upstream becomes a compile
  error here rather than a runtime crash
- `npm run lint:tokens` — proven to work: planting `bg-green-600`, `text-lg`
  and `rounded-md` in a screen made it fail with all three, then pass again
  once reverted
- `npx expo export --platform android` — bundles successfully (3.9 MB Hermes
  bytecode), which exercises the NativeWind babel/metro setup and every import
  path
- `npx expo config` — resolves; camera and location permission strings applied

**Not done: running the app against a live backend.** That needs a device or
emulator plus a running, seeded API — start both as described above and walk
the flow: register or sign in as `demo-petani-1` → New Offer → capture → publish
→ recommendations → matches → share card, then sign in as `demo-pembeli-1` and
check Notifications for the reverse match.

## Notes for SDK 57

Three packages that older Expo SDKs bundled now need installing explicitly, and
all three are already in `package.json`: `@expo/vector-icons`,
`babel-preset-expo`, and `react-native-worklets` (required by
react-native-reanimated 4). The bundle fails without them.

`babel-preset-expo` adds the reanimated/worklets babel plugin automatically —
do not add it to `babel.config.js` as well, or it runs twice.
