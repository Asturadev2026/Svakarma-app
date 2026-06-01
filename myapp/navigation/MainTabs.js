import React from "react";
import ProfileScreen from "../screens/ProfileScreen";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import LoansScreen from "../screens/LoansScreen";
import EMICalculatorScreen from "../screens/EMICalculatorScreen";

const Tab = createBottomTabNavigator();

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
          shadowOffset: { width: 0, height: 10 },
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
          const icons = {
            Home: "🏠",
            Loans: "💰",
            EMI: "🧾",
            Profile: "👤",
          };
          return (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.7 }}>
              {icons[route.name] || "🏠"}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Loans" component={LoansScreen} />
      <Tab.Screen name="EMI" component={EMICalculatorScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}