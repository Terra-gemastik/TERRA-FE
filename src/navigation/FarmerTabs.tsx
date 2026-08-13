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
        tabBarActiveTintColor: WARNA.inkPrimary,
        tabBarInactiveTintColor: WARNA.inkMuted,
        tabBarActiveBackgroundColor: WARNA.brandMuted,
        tabBarLabelStyle: {
          fontFamily: "Hanken Grotesk",
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarItemStyle: {
          borderRadius: 8,
          marginHorizontal: 4,
          marginVertical: 6,
          paddingVertical: 2,
        },
        tabBarStyle: {
          backgroundColor: WARNA.surface,
          borderTopColor: WARNA.outlineSubtle,
          height: 66,
          paddingHorizontal: 8,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="BerandaPetani"
        component={FarmerHomeScreen}
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="KomunitasPetani"
        component={CommunityScreen}
        options={{
          title: "Komunitas",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NotifikasiPetani"
        component={NotificationsScreen}
        options={{
          title: "Notifikasi",
          tabBarBadge: belumDibaca > 0 ? belumDibaca : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfilPetani"
        component={ProfileScreen}
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
