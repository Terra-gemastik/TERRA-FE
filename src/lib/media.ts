/**
 * Photo input for a listing: in-app camera, or the device gallery.
 *
 * TRUST MODEL — read before changing either path
 *
 * PRD F-01 originally allowed the camera only, so the timestamp and
 * coordinates travelling with an offer were guaranteed to be the real ones.
 * That requirement was relaxed: farmers photograph harvest away from signal,
 * in bulk, and often before they think to open the app, and forcing a retake
 * cost more real listings than the guarantee was worth.
 *
 * The guarantee is not faked to compensate. Provenance is tracked per photo:
 *
 *   kamera  — captured here. Time is now, coordinates from the device.
 *   galeri  — chosen from the library. Time and coordinates come from EXIF if
 *             the file carries any, and are simply absent if it does not.
 *
 * Absent metadata is not patched over. The backend's `_verifikasi` sets
 * `metadata_lengkap: false` whenever any photo lacks a timestamp or
 * coordinates, and the UI shows that verdict. A gallery photo that kept its
 * EXIF verifies exactly like a camera one; a screenshot or a forwarded image
 * carries nothing and is reported as unverified. The claim degrades with the
 * evidence instead of quietly becoming a lie.
 *
 * Location is best-effort throughout: denying it degrades verification, it
 * never blocks a farmer from listing.
 */

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import type { FotoUnggah } from "@/api/types";

/** Where a photo came from. Travels with it so the UI can label it. */
export type SumberFoto = "kamera" | "galeri";

export type HasilTangkapan = {
  foto: FotoUnggah;
  sumber: SumberFoto;
  /** Absent for a gallery photo with no EXIF timestamp. */
  waktuAmbil?: string;
  latitude?: number;
  longitude?: number;
  /** Set when the photo has no usable location metadata. */
  peringatanLokasi?: string;
};

export class KameraDitolak extends Error {
  constructor() {
    super(
      "Izin kamera ditolak. TERRA memerlukan foto yang diambil langsung di aplikasi agar kondisi panen dapat diverifikasi.",
    );
    this.name = "KameraDitolak";
  }
}

export class GaleriDitolak extends Error {
  constructor() {
    super(
      "Izin galeri ditolak. Anda masih bisa mengambil foto langsung lewat kamera.",
    );
    this.name = "GaleriDitolak";
  }
}

export class TangkapanDibatalkan extends Error {
  constructor() {
    super("Pengambilan foto dibatalkan.");
    this.name = "TangkapanDibatalkan";
  }
}

async function ambilKoordinat(): Promise<{
  latitude?: number;
  longitude?: number;
  peringatan?: string;
}> {
  try {
    const izin = await Location.requestForegroundPermissionsAsync();
    if (!izin.granted) {
      return {
        peringatan:
          "Izin lokasi ditolak — penawaran akan ditandai tanpa verifikasi lokasi.",
      };
    }

    const posisi = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: posisi.coords.latitude,
      longitude: posisi.coords.longitude,
    };
  } catch {
    return {
      peringatan: "Lokasi tidak dapat dibaca — penawaran tetap dapat dibuat.",
    };
  }
}

/**
 * Open the camera, take one photo, and attach capture metadata.
 *
 * Throws `KameraDitolak` or `TangkapanDibatalkan`; callers surface those as
 * ordinary UI messages rather than errors.
 */
export async function tangkapFoto(): Promise<HasilTangkapan> {
  const izinKamera = await ImagePicker.requestCameraPermissionsAsync();
  if (!izinKamera.granted) throw new KameraDitolak();

  const hasil = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.6, // NF-01 gives the whole classification call < 5s on 4G
    allowsMultipleSelection: false,
    exif: false,
  });

  if (hasil.canceled || !hasil.assets?.length) throw new TangkapanDibatalkan();

  const aset = hasil.assets[0];
  const lokasi = await ambilKoordinat();

  return {
    foto: {
      uri: aset.uri,
      nama: aset.fileName ?? `panen-${Date.now()}.jpg`,
      tipe: aset.mimeType ?? "image/jpeg",
    },
    sumber: "kamera",
    waktuAmbil: new Date().toISOString(),
    latitude: lokasi.latitude,
    longitude: lokasi.longitude,
    peringatanLokasi: lokasi.peringatan,
  };
}

/**
 * Read GPS out of an EXIF block.
 *
 * Encoding varies by platform and by whatever wrote the file: Android usually
 * hands back signed decimal degrees, iOS an unsigned magnitude plus a
 * separate N/S/E/W reference. Handle both, and return nothing at all rather
 * than a plausible-looking guess when the values are unusable — a wrong
 * coordinate is worse than a missing one, because the backend would then
 * compare it against the farmer's registered location and flag an honest
 * photo as suspicious (F-02).
 */
function koordinatExif(exif: Record<string, unknown> | null | undefined): {
  latitude?: number;
  longitude?: number;
} {
  if (!exif) return {};

  const angka = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
  let lat = angka(exif.GPSLatitude);
  let lon = angka(exif.GPSLongitude);
  if (lat === undefined || lon === undefined) return {};

  const refLat = typeof exif.GPSLatitudeRef === "string" ? exif.GPSLatitudeRef : undefined;
  const refLon = typeof exif.GPSLongitudeRef === "string" ? exif.GPSLongitudeRef : undefined;
  if (refLat === "S" && lat > 0) lat = -lat;
  if (refLon === "W" && lon > 0) lon = -lon;

  // 0,0 is Null Island — in practice it means "the field existed but was empty".
  if (lat === 0 && lon === 0) return {};
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return {};
  return { latitude: lat, longitude: lon };
}

/** EXIF timestamps are "YYYY:MM:DD HH:MM:SS", which `Date` cannot parse. */
function waktuExif(exif: Record<string, unknown> | null | undefined): string | undefined {
  const mentah = exif?.DateTimeOriginal ?? exif?.DateTime;
  if (typeof mentah !== "string") return undefined;
  const cocok = mentah.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!cocok) return undefined;
  const [, th, bl, hr, jm, mn, dt] = cocok;
  const d = new Date(`${th}-${bl}-${hr}T${jm}:${mn}:${dt}`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * Pick one or more photos from the device gallery.
 *
 * `exif: true` matters: it is the only way a gallery photo can carry the
 * timestamp and coordinates the trust layer checks. Files that kept their
 * EXIF verify like camera captures; files that lost it (screenshots,
 * WhatsApp forwards, anything re-encoded) come back with nothing and are
 * reported as unverified rather than assumed good.
 *
 * `sisa` caps the selection so the caller cannot exceed PRD B-01's limit.
 */
export async function pilihDariGaleri(sisa: number): Promise<HasilTangkapan[]> {
  const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!izin.granted) throw new GaleriDitolak();

  const hasil = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.6,
    allowsMultipleSelection: true,
    selectionLimit: Math.max(1, sisa),
    exif: true,
  });

  if (hasil.canceled || !hasil.assets?.length) throw new TangkapanDibatalkan();

  return hasil.assets.slice(0, sisa).map((aset, indeks) => {
    const exif = aset.exif as Record<string, unknown> | undefined;
    const titik = koordinatExif(exif);
    const waktu = waktuExif(exif);

    return {
      foto: {
        uri: aset.uri,
        nama: aset.fileName ?? `galeri-${Date.now()}-${indeks}.jpg`,
        tipe: aset.mimeType ?? "image/jpeg",
      },
      sumber: "galeri" as const,
      waktuAmbil: waktu,
      latitude: titik.latitude,
      longitude: titik.longitude,
      peringatanLokasi:
        titik.latitude === undefined
          ? "Foto galeri ini tidak menyimpan lokasi — penawaran ditandai tanpa verifikasi lokasi."
          : undefined,
    };
  });
}

/** Current position on its own — used when registering to set a home location. */
export async function lokasiSaatIni(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const izin = await Location.requestForegroundPermissionsAsync();
  if (!izin.granted) return null;
  try {
    const posisi = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: posisi.coords.latitude,
      longitude: posisi.coords.longitude,
    };
  } catch {
    return null;
  }
}
