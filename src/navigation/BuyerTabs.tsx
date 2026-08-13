/** Buyer tab layout — the demand side. */

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { WARNA } from "@/components/ui";
import { useJumlahBelumDibaca } from "@/hooks/useNotifications";
import { BuyerHomeScreen } from "@/screens/buyer/BuyerHomeScreen";
import { MyDemandsScreen } from "@/screens/buyer/MyDemandsScreen";
import { CommunityScreen } from "@/screens/shared/CommunityScreen";
import { NotificationsScreen } from "@/screens/shared/NotificationsScreen";
import { ProfileScreen } from "@/screens/shared/ProfileScreen";

import type { TabPembeliParamList } from "./types";

const Tab = createBottomTabNavigator<TabPembeliParamList>();

export function BuyerTabs() {
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
          marginHorizontal: 3,
          marginVertical: 6,
          paddingVertical: 2,
        },
        tabBarStyle: {
          backgroundColor: WARNA.surface,
          borderTopColor: WARNA.outlineSubtle,
          height: 66,
          paddingHorizontal: 6,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="BerandaPembeli"
        component={BuyerHomeScreen}
        options={{
          title: "Pasokan",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "leaf" : "leaf-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PermintaanSaya"
        component={MyDemandsScreen}
        options={{
          title: "Permintaan",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "clipboard" : "clipboard-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="KomunitasPembeli"
        component={CommunityScreen}
        options={{
          title: "Komunitas",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NotifikasiPembeli"
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
        name="ProfilPembeli"
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
