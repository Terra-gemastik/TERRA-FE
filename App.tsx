/**
 * App root.
 *
 * Provider order matters: QueryClientProvider must wrap AuthProvider, because
 * AuthProvider clears the query cache on sign-out.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/hanken-grotesk";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/auth/AuthContext";
import { WARNA } from "@/components/ui";
import { RootNavigator } from "@/navigation/RootNavigator";

import "./global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mid-to-low-end Android on mobile data (PRD NF-05): fewer refetches,
      // and a failed request should not retry three times before the user
      // sees an error they can act on.
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [fontSiap, fontGalat] = useFonts({
    "Hanken Grotesk": HankenGrotesk_400Regular,
    "Hanken Grotesk_500Medium": HankenGrotesk_500Medium,
    "Hanken Grotesk_600SemiBold": HankenGrotesk_600SemiBold,
    "Hanken Grotesk_700Bold": HankenGrotesk_700Bold,
    "Hanken Grotesk_800ExtraBold": HankenGrotesk_800ExtraBold,
  });

  if (!fontSiap && !fontGalat) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: WARNA.surfaceSunken,
        }}
      >
        <ActivityIndicator color={WARNA.brandStrong} accessibilityLabel="Memuat" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </AuthProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
