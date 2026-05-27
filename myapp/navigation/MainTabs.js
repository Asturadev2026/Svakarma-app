import React from "react";
import ProfileScreen from "../screens/ProfileScreen";

import {
  View,
  Text,
} from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";

const Tab = createBottomTabNavigator();

function LoansScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F8F8",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
        }}
      >
        Loans Screen
      </Text>
    </View>
  );
}

function EMIScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F8F8",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
        }}
      >
        EMI Screen
      </Text>
    </View>
  );
}


export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 18,
          height: 72,
          borderRadius: 24,

          backgroundColor: "#FFFFFF",

          borderTopWidth: 0,

          shadowColor: "#000",

          shadowOffset: {
            width: 0,
            height: 10,
          },

          shadowOpacity: 0.08,
          shadowRadius: 20,

          elevation: 12,
        },

        tabBarShowLabel: true,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 8,
        },

        tabBarActiveTintColor: "#FF001E",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarIcon: ({ focused }) => {
          let icon = "🏠";

          if (route.name === "Home")
            icon = "🏠";

          if (route.name === "Loans")
            icon = "💰";

          if (route.name === "EMI")
            icon = "🧾";

          if (route.name === "Profile")
            icon = "👤";

          return (
            <Text
              style={{
                fontSize: 22,
                opacity: focused ? 1 : 0.7,
              }}
            >
              {icon}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Loans"
        component={LoansScreen}
      />

      <Tab.Screen
        name="EMI"
        component={EMIScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
      
    </Tab.Navigator>
  );
}