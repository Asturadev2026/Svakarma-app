import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function QuickActions() {
  const navigation = useNavigation();

  const actions = [
    { label: "Apply", icon: "file-text", screen: "MainTabs", params: { screen: "Loans" } },
    { label: "Free CIBIL", icon: "trending-up", screen: "CIBIL" },
    { label: "EMI Calc", icon: "calculator", screen: "EMICalculator" },
    { label: "Status", icon: "activity", screen: "MyApplications" },
    { label: "Refer", icon: "gift", screen: "Refer" },
    { label: "Profile", icon: "user", screen: "MainTabs", params: { screen: "Profile" } },
    { label: "Pay EMI", icon: "credit-card", screen: "EMIPayment" },
    { label: "Help", icon: "help-circle", screen: "Help" },
  ];

  const handlePress = (item) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.screen) {
      if (item.params) {
        navigation.navigate(item.screen, item.params);
      } else {
        navigation.navigate(item.screen);
      }
    }
  };

  return (
    <View style={styles.container}>
      {actions.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => handlePress(item)}
        >
          <View style={styles.iconBox}>
            {item.icon === "calculator" ? (
              <MaterialCommunityIcons name="calculator" size={24} color="#8B1A1A" />
            ) : (
              <Feather name={item.icon} size={24} color="#8B1A1A" />
            )}
          </View>

          <Text style={styles.label}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  card: {
    width: "22%",
    alignItems: "center",
    marginBottom: 22,
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FFF2F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    color: "#111827",
    textAlign: "center",
    fontWeight: "600",
  },
});