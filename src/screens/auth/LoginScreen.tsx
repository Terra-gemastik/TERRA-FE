/**
 * Sign in.
 *
 * ⚠️ THE BACKEND HAS NO LOGIN ENDPOINT AND NO JWT. Its security scheme is an
 * opaque token in the `X-Terra-Token` header (verified in openapi.json), and
 * tokens are only ever minted by registration. Production auth is out of scope
 * for the MVP by explicit decision on the backend side.
 *
 * So this screen takes a token and validates it for real against
 * GET /onboarding/saya. Nothing is faked: an invalid token fails here exactly
 * as it would anywhere else in the app.
 *
 * When the backend grows real credentials, swap the body of `masuk` in
 * src/auth/AuthContext.tsx and replace this form's single field. The rest of
 * the app is unaffected — see src/auth/session.ts.
 */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import { TOKEN_DEMO } from "@/auth/session";
import {
  Button,
  Card,
  ErrorState,
  Screen,
  Stack,
  Text,
  TextField,
} from "@/components/ui";
import type { RootStackParamList } from "@/navigation/types";

export function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { masuk } = useAuth();

  const [token, setToken] = useState("");
  const [sedangMasuk, setSedangMasuk] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);

  const kirim = async (nilai: string) => {
    const bersih = nilai.trim();
    if (!bersih) {
      setGalat(new Error("Token tidak boleh kosong."));
      return;
    }

    setSedangMasuk(true);
    setGalat(null);
    try {
      await masuk(bersih);
      // No navigation call: RootNavigator swaps the whole tree once a user
      // exists, so pushing a screen here would fight it.
    } catch (e) {
      setGalat(e);
    } finally {
      setSedangMasuk(false);
    }
  };

  return (
    <Screen>
      <View className="pt-section">
        <Text variant="display">TERRA</Text>
        <Text variant="body" tone="secondary" className="mt-tight">
          Salurkan hasil panen yang tidak terserap pasar.
        </Text>
      </View>

      <Stack className="mt-section">
        <TextField
          label="Token akses"
          value={token}
          onChangeText={setToken}
          placeholder="mis. demo-petani-1"
          autoCapitalize="none"
          helper="Token diberikan saat akun dibuat."
        />

        {galat ? <ErrorState error={galat} title="Gagal masuk" /> : null}

        <Button
          label="Masuk"
          onPress={() => void kirim(token)}
          loading={sedangMasuk}
          icon="log-in-outline"
        />

        <Button
          label="Buat akun baru"
          variant="secondary"
          onPress={() => navigation.navigate("Daftar")}
        />
      </Stack>

      <Card
        title="Akun demo"
        subtitle="Data hasil seeding di backend. Ketuk untuk mengisi token."
        className="mt-section"
      >
        <View className="mt-snug flex-row flex-wrap">
          {TOKEN_DEMO.map((akun) => (
            <Pressable
              key={akun.token}
              accessibilityRole="button"
              onPress={() => {
                setToken(akun.token);
                void kirim(akun.token);
              }}
              className="mb-snug mr-snug rounded-control border-hairline border-outline bg-surface px-snug py-2"
            >
              <Text variant="body-sm">{akun.label}</Text>
              <Text variant="caption" tone="muted">
                {akun.catatan}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
