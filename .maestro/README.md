# On-device smoke flows

Automated UI tests against the real Android app — the same journeys
`npm run smoke` walks in a browser, but on the platform TERRA actually ships.

```bash
npm run smoke:device
```

Use the web flow for everyday checks (no emulator, ~40 s). Use this one for
what a browser structurally cannot reach:

- **session persistence** — `auth/storage.ts` no-ops SecureStore on web, so
  that path is unexercised there
- **camera capture and geotagging** (F-01/B-02) — the foundation of the trust
  layer
- **native navigation, gestures, and real behaviour on low-end Android** (NF-05)

---

## Setup

### 1. Android SDK + an emulator

Android Studio → SDK Manager (a recent platform + build-tools) → Device
Manager → create an AVD (Pixel 6 / API 34 is a safe pairing). Then:

```bash
adb devices        # must list one device
```

Hardware virtualization has to be on in BIOS (WHPX on Windows), and the first
AVD boot is slow enough to look hung when it isn't.

### 2. Build the app with its real package id — **do not use Expo Go**

```bash
npx expo run:android
```

This compiles a dev build installed as **`id.terra.mobile`**, which is what the
flows target.

Expo Go will not work here: it runs as `host.exp.exponent`, so `launchApp`
would launch Expo Go's own home screen rather than TERRA, and `clearState`
would clear Expo Go's data instead of the app's. Reaching the app inside Expo
Go needs a machine-IP-dependent `exp://` deep link, which is exactly the kind
of fragility an automated test should not carry.

### 3. Maestro

Install the **native Windows** build, not WSL — Maestro's own docs recommend
against WSL because connecting to an emulator on the Windows host needs
advanced port configuration.
See [docs.maestro.dev](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli).

```bash
maestro --version
```

### 4. Seeded backend

`EXPO_PUBLIC_API_URL` must point at an API with the demo data loaded
(`python -m scripts.init_db --seed`, or paste `terra/db/seed.sql`). The flows
assert on seeded records — notably `pnw_aktif_2`, the 120 kg bruised-carrot
offer.

---

## The flows

| File | Covers |
|---|---|
| `shared-masuk.yaml` | Sign-in subflow, parameterised by account |
| `01-petani.yaml` | Expert system end to end: seeded offer → recommendations → buyer matches → open-data venues → share card |
| `02-pembeli.yaml` | Buyer pull path (browse all supply) and reverse flow (post a demand) |

`02-pembeli.yaml` **writes data** — point it at a demo database.

---

## Two selector rules worth knowing

**Anchor exact matches.** Maestro treats text as a regex, so `"Masuk"` also
matches the heading `"Masuk ke akun"` on the same screen. Ambiguous labels use
`^Masuk$`.

**The Welcome screen comes first.** The login form is one tap in, not the
launch screen — an earlier version of these flows tapped straight for the email
field and would have failed on every run.

---

## What these deliberately skip

**Photo capture.** PRD F-01 requires in-app capture and forbids a gallery path,
so no fixture image can be handed to the app — that is the trust layer working,
not a testing gap. Automating it would mean tapping a shutter at fixed
coordinates against the emulator's synthetic camera, asserting nothing useful.

The capture step stays a manual check:

> New Offer → commodity + trigger → capture → confirm the result screen shows a
> condition and a confidence score.

The backend's `scripts/smoke_flow.py` does cover classification by posting
image bytes to `POST /klasifikasi`. Between the three, the only untested link
is the camera hand-off itself.

---

## Status

**Not yet run.** No Android SDK or emulator on the machine these were written
on. The journey and every asserted string were taken from a passing web run
(`npm run smoke`), so the content is verified even though the Maestro syntax
and native timing are not. Expect to adjust a timeout or a scroll step on the
first run.
