/** Farmer tab layout — the supply side. */

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { WARNA } from "@/components/ui";
import { useJumlahBelumDibaca } from "@/hooks/useNotifications";
import { CommunityScreen } from "@/screens/shared/CommunityScreen";
import { NotificationsScreen } from "@/screens/shared/NotificationsScreen";
import { ProfileScreen } from "@/screens/shared/ProfileScreen";
import { FarmerHomeScreen } from "@/screens/farmer/FarmerHomeScreen";

import type { TabPetaniParamList } from "./types";

const Tab = createBottomTabNavigator<TabPetaniParamList>();

export function FarmerTabs() {
  const belumDibaca = useJumlahBelumDibaca();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: WARNA.brandPrimary,
        tabBarInactiveTintColor: WARNA.inkMuted,
        tabBarStyle: { borderTopColor: WARNA.outlineSubtle },
      }}
    >
      <Tab.Screen
        name="BerandaPetani"
        component={FarmerHomeScreen}
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="KomunitasPetani"
        component={CommunityScreen}
        options={{
          title: "Komunitas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NotifikasiPetani"
        component={NotificationsScreen}
        options={{
          title: "Notifikasi",
          tabBarBadge: belumDibaca > 0 ? belumDibaca : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfilPetani"
        component={ProfileScreen}
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
