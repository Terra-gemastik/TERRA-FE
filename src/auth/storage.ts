/**
 * Durable token storage.
 *
 * expo-secure-store keeps the token in the OS keychain / Android Keystore
 * rather than AsyncStorage, so it survives restarts without sitting in
 * plaintext app storage.
 *
 * SecureStore is unavailable on web. Every call is guarded so `expo start
 * --web` degrades to "you have to log in again each reload" instead of
 * crashing — the app targets Android, and web is only ever a convenience.
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KUNCI_TOKEN = "terra.token_akses";

const tersedia = Platform.OS !== "web";

export async function simpanToken(token: string): Promise<void> {
  if (!tersedia) return;
  await SecureStore.setItemAsync(KUNCI_TOKEN, token);
}

export async function bacaToken(): Promise<string | null> {
  if (!tersedia) return null;
  try {
    return await SecureStore.getItemAsync(KUNCI_TOKEN);
  } catch {
    // A corrupted keychain entry should log the user out, not brick the app.
    return null;
  }
}

export async function hapusToken(): Promise<void> {
  if (!tersedia) return;
  try {
    await SecureStore.deleteItemAsync(KUNCI_TOKEN);
  } catch {
    // Already gone is the outcome we wanted anyway.
  }
}
