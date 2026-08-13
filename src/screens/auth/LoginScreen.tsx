/** Normal sign-in screen; demo credential mapping lives in src/auth/session.ts. */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/auth/AuthContext";
import {
  Button,
  ErrorState,
  Stack,
  Text,
  TextField,
} from "@/components/ui";
import type { RootStackParamList } from "@/navigation/types";

export function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { masukDenganKredensial } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sedangMasuk, setSedangMasuk] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);

  const bolehMasuk =
    email.trim().length > 0 &&
    password.length > 0;

  const kirim = async () => {
    if (!bolehMasuk) {
      setGalat(
        new Error(
          "Isi email dan kata sandi terlebih dahulu.",
        ),
      );
      return;
    }

    setSedangMasuk(true);
    setGalat(null);

    try {
      await masukDenganKredensial(
        email.trim(),
        password,
      );
    } catch (error) {
      setGalat(error);
    } finally {
      setSedangMasuk(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-sunken">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-page pb-section">

            {/* =========================================================
                BRAND
               ========================================================= */}

            <View className="pt-section">
              <View className="self-start rounded-pill bg-brand-muted px-gutter py-snug">
                <Text variant="caption">
                  TERRA
                </Text>
              </View>

              <Text
                variant="display"
                className="mt-gutter"
              >
                Selamat datang kembali
              </Text>

              <Text
                variant="body-lg"
                tone="secondary"
                className="mt-snug"
              >
                Salurkan hasil panen ke peluang yang tepat.
              </Text>
            </View>

            {/* =========================================================
                LOGIN FORM
               ========================================================= */}

            <View className="mt-section">
              <Text variant="heading-sm">
                Masuk ke akun
              </Text>

              <Text
                variant="body-sm"
                tone="secondary"
                className="mt-tight"
              >
                Gunakan akun TERRA Anda untuk melanjutkan.
              </Text>

              <Stack
                className="mt-gutter"
                gap="gutter"
              >
                <TextField
                  label="Email / username"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nama@terra.id"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <TextField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Masukkan kata sandi"
                  autoCapitalize="none"
                  secureTextEntry
                />
              </Stack>
            </View>

            {/* =========================================================
                ERROR
               ========================================================= */}

            {galat ? (
              <View className="mt-gutter">
                <ErrorState
                  error={galat}
                  title="Belum bisa masuk"
                />
              </View>
            ) : null}

            {/* =========================================================
                PRIMARY ACTION
               ========================================================= */}

            <View className="mt-section">
              <Button
                label="Masuk"
                onPress={() => void kirim()}
                loading={sedangMasuk}
                disabled={!bolehMasuk}
                icon="log-in-outline"
              />
            </View>

            {/* =========================================================
                REGISTER
               ========================================================= */}

            <View className="mt-section flex-row flex-wrap items-center">
              <Text
                variant="body-sm"
                tone="secondary"
              >
                Belum punya akun?
              </Text>

              <Button
                label="Daftar"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() =>
                  navigation.navigate("Daftar")
                }
                className="ml-tight"
              />
            </View>

            {/* =========================================================
                BOTTOM BREATHING SPACE
               ========================================================= */}

            <View className="flex-1" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}