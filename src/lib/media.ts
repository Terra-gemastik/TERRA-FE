/**
 * In-app photo capture with geotagging.
 *
 * PRD F-01 requires photos to be CAPTURED IN-APP rather than picked from the
 * gallery, so that the timestamp and coordinates travelling with the offer are
 * the real ones. That is why this file only ever calls `launchCameraAsync` —
 * there is deliberately no gallery path, and adding one would undermine the
 * trust layer the backend builds on top of this metadata.
 *
 * Location is best-effort: if the user denies it, capture still proceeds and
 * the backend records `metadata_lengkap: false` on the classification. Denying
 * a permission should degrade verification, not block a farmer from listing.
 */

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import type { FotoUnggah } from "@/api/types";

export type HasilTangkapan = {
  foto: FotoUnggah;
  waktuAmbil: string;
  latitude?: number;
  longitude?: number;
  /** Set when the photo was taken but location could not be attached. */
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
    waktuAmbil: new Date().toISOString(),
    latitude: lokasi.latitude,
    longitude: lokasi.longitude,
    peringatanLokasi: lokasi.peringatan,
  };
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
