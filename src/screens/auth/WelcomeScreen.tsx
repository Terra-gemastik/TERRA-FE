import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";
import type { RootStackParamList } from "@/navigation/types";

export function WelcomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-surface-sunken">
      <View className="flex-1 px-page pb-section">

        {/* BRAND */}
        <View className="items-center pt-section">
          <Image
            source={require("../../../assets/terra-logo.png")}
            style={{
              width: 112,
              height: 32,
            }}
            resizeMode="contain"
          />
        </View>

        {/* HERO */}
        <View className="flex-1 justify-center">
          <View className="items-center">
            <Image
              source={require("../../../assets/welcome-harvest.png")}
              style={{
                width: 260,
                height: 260,
              }}
              resizeMode="contain"
            />

            <Text
              variant="heading-lg"
              className="mt-section text-center"
            >
              Lebih Banyak Hasil Panen,{"\n"}
              Lebih Banyak Nilai.
            </Text>

            <Text
              variant="body"
              tone="secondary"
              className="mt-snug px-section text-center"
            >
              Temukan pemanfaatan dan pembeli terbaik untuk hasil
              gagal panen maupun oversupply.
            </Text>
          </View>

          {/* PRIMARY ACTIONS */}
          <View className="mt-section">
            <Button
              label="Masuk"
              onPress={() => navigation.navigate("Masuk")}
            />

            <View className="mt-snug">
              <Button
                label="Daftar"
                variant="secondary"
                onPress={() => navigation.navigate("Daftar")}
              />
            </View>
          </View>
      </View>
        {/* FOOTNOTE */}
        <Text
          variant="caption"
          tone="muted"
          className="text-center"
        >
          Analisis TERRA adalah alat bantu keputusan.{"\n"}
          Keputusan akhir tetap di tangan Anda.
        </Text>

      </View>
    </SafeAreaView>
  );
}