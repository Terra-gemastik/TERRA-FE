# TERRA — Mobile App

React Native + Expo client for the TERRA backend. Built for **GEMASTIK 2026**.

Every screen talks to the real API. **Nothing is mocked on this side** — where
something is a placeholder, it is a placeholder *in the backend*, and this app
labels it as such on screen rather than hiding it.

**The visual design is deliberately unfinished.** Grey palette, one muted
accent, system fonts, no illustrations. It is meant to be replaced wholesale by
a designer without touching a single line of business logic — see
[Reskinning](#reskinning).

Backend repo: `../TERRA_GEMASTIK` (separate git repository).

---

## Quick start

```bash
npm install
cp .env.example .env        # then set EXPO_PUBLIC_API_URL
npm start                   # press 'a' for Android, or scan the QR
```

The backend must be running and seeded:

```bash
cd ../TERRA_GEMASTIK
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
cp openapi.json ../TERRA_MOBILE/openapi.json

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
  lib/       domain.ts (labels) · format.ts · media.ts (camera + geotag)
scripts/     generate-api-types.mjs · check-raw-classes.mjs
```

Nothing under `screens/`, `api/`, `navigation/` or `hooks/` needs to change for
a reskin. If it would, that is a structural bug.

---

## Screens

**Auth** — Login (token entry + demo chips), Register (role selection first,
then role-specific fields).

**Farmer** — Home (own offers, urgent first) · New Offer (in-app camera,
commodity, trigger, volume, storage) · Classification Result · Recommendations ·
Buyer Matches · Buyer Detail (reputation, WhatsApp, record a deal) · Share Card.

**Buyer** — Incoming supply (reverse matches) · Post Demand · My Demands.

**Shared** — Community board · Notifications · Profile (reputation + reports) ·
Transactions (rate, cancel, report) · Mismatch Report · Impact Dashboard.

### Photo capture

`expo-image-picker` in **camera mode only** — there is deliberately no gallery
path. PRD F-01 requires in-app capture so the timestamp and coordinates on an
offer are real, and a gallery picker would undermine the trust layer built on
that metadata. `expo-location` attaches coordinates at capture time; denying
location still lets you publish, it just marks the classification as
unverified.

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

## Verification status

Checked on this machine:

- `npm run typecheck` — **0 errors** across ~40 source files
- `npm run lint:tokens` — **clean**, and proven to work: planting
  `bg-green-600`, `text-lg` and `rounded-md` in a screen made it fail with all
  three, then pass again once reverted
- `npx expo export --platform android` — **bundles successfully** (3.9 MB
  Hermes bytecode), which exercises the NativeWind babel/metro setup and every
  import path
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
