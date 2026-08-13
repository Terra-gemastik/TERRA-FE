/**
 * Root navigation.
 *
 * Three states, decided in one place:
 *   restoring a stored session  → splash
 *   no session                  → auth screens
 *   session                     → the tab layout for that user's role
 *
 * Role is read from the profile the backend returned (`peran`), never guessed
 * from anything client-side.
 */

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import { LoadingSpinner, Text, temaNavigasi } from "@/components/ui";
import { BrowseOffersScreen } from "@/screens/buyer/BrowseOffersScreen";
import { PostDemandScreen } from "@/screens/buyer/PostDemandScreen";
import { BuyerDetailScreen } from "@/screens/farmer/BuyerDetailScreen";
import { ClassificationResultScreen } from "@/screens/farmer/ClassificationResultScreen";
import { MatchesScreen } from "@/screens/farmer/MatchesScreen";
import { NewOfferScreen } from "@/screens/farmer/NewOfferScreen";
import { RecommendationsScreen } from "@/screens/farmer/RecommendationsScreen";
import { VenuesScreen } from "@/screens/farmer/VenuesScreen";
import { ShareCardScreen } from "@/screens/farmer/ShareCardScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { ImpactScreen } from "@/screens/shared/ImpactScreen";
import { MismatchReportScreen } from "@/screens/shared/MismatchReportScreen";
import { TransactionsScreen } from "@/screens/shared/TransactionsScreen";
import { WelcomeScreen } from "@/screens/auth/WelcomeScreen";

import { BuyerTabs } from "./BuyerTabs";
import { FarmerTabs } from "./FarmerTabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function Splash() {
  return (
    <View className="flex-1 items-center justify-center bg-surface-sunken">
      <Text variant="heading-lg">TERRA</Text>
      <LoadingSpinner label="Memulihkan sesi…" />
    </View>
  );
}

export function RootNavigator() {
  const { pengguna, peran, memulihkan } = useAuth();

  return (
    <NavigationContainer theme={temaNavigasi}>
      {memulihkan ? (
        <Splash />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerBackTitle: "Kembali",
            contentStyle: { backgroundColor: temaNavigasi.colors.background },
          }}
        >
          {!pengguna ? (
            <Stack.Group>
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Masuk"
                component={LoginScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Daftar"
                component={RegisterScreen}
                options={{
                  headerShown: true,
                  title: "Buat akun",
                }}
              />
            </Stack.Group>
          ) : (
            <>
              {peran === "petani" ? (
                <Stack.Screen
                  name="RootPetani"
                  component={FarmerTabs}
                  options={{ headerShown: false }}
                />
              ) : (
                <Stack.Screen
                  name="RootPembeli"
                  component={BuyerTabs}
                  options={{ headerShown: false }}
                />
              )}

              {/* Farmer flow — PRD §10.1 */}
              <Stack.Screen
                name="PenawaranBaru"
                component={NewOfferScreen}
                options={{ title: "Penawaran baru" }}
              />
              <Stack.Screen
                name="HasilKlasifikasi"
                component={ClassificationResultScreen}
                options={{ title: "Hasil klasifikasi" }}
              />
              <Stack.Screen
                name="Rekomendasi"
                component={RecommendationsScreen}
                options={{ title: "Opsi penyaluran" }}
              />
              <Stack.Screen
                name="Pencocokan"
                component={MatchesScreen}
                options={{ title: "Pembeli cocok" }}
              />
              <Stack.Screen
                name="TempatPenyaluran"
                component={VenuesScreen}
                options={{ title: "Tempat penyaluran" }}
              />
              <Stack.Screen
                name="DetailPembeli"
                component={BuyerDetailScreen}
                options={{ title: "Detail pembeli" }}
              />
              <Stack.Screen
                name="KartuBerbagi"
                component={ShareCardScreen}
                options={{ title: "Kartu penawaran" }}
              />

              {/* Buyer flow — PRD §10.2 */}
              <Stack.Screen
                name="PasangPermintaan"
                component={PostDemandScreen}
                options={{ title: "Pasang permintaan" }}
              />
              <Stack.Screen
                name="JelajahPenawaran"
                component={BrowseOffersScreen}
                options={{ title: "Jelajahi pasokan" }}
              />

              {/* Shared */}
              <Stack.Screen
                name="Transaksi"
                component={TransactionsScreen}
                options={{ title: "Transaksi" }}
              />
              <Stack.Screen
                name="LaporanKetidaksesuaian"
                component={MismatchReportScreen}
                options={{ title: "Laporkan ketidaksesuaian" }}
              />
              <Stack.Screen
                name="Dampak"
                component={ImpactScreen}
                options={{ title: "Dampak saya" }}
              />
            </>
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
