/** Normal sign-in screen; demo credential mapping lives in src/auth/session.ts. */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import { Button, ErrorState, Screen, Stack, Text, TextField } from "@/components/ui";
import type { RootStackParamList } from "@/navigation/types";

export function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { masukDenganKredensial } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sedangMasuk, setSedangMasuk] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);

  const bolehMasuk = email.trim().length > 0 && password.length > 0;

  const kirim = async () => {
    if (!bolehMasuk) {
      setGalat(new Error("Isi email dan kata sandi terlebih dahulu."));
      return;
    }

    setSedangMasuk(true);
    setGalat(null);
    try {
      await masukDenganKredensial(email, password);
      // RootNavigator swaps the auth tree after the profile is loaded.
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
        <Text variant="body-lg" tone="secondary" className="mt-snug">
          Salurkan hasil panen ke peluang yang tepat.
        </Text>
      </View>

      <Stack className="mt-section">
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

        {galat ? <ErrorState error={galat} title="Belum bisa masuk" /> : null}

        <Button
          label="Masuk"
          onPress={() => void kirim()}
          loading={sedangMasuk}
          disabled={!bolehMasuk}
          icon="log-in-outline"
        />
      </Stack>

      <View className="mt-section flex-row items-center">
        <Text variant="body-sm" tone="secondary">
          Belum punya akun?
        </Text>
        <Button
          label="Daftar"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => navigation.navigate("Daftar")}
          className="ml-tight"
        />
      </View>
    </Screen>
  );
}
