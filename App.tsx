/**
 * App root.
 *
 * Provider order matters: QueryClientProvider must wrap AuthProvider, because
 * AuthProvider clears the query cache on sign-out.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/auth/AuthContext";
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
