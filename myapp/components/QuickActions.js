import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

const actions = [
  {
    label: "Apply",
    icon: "👛",
    screen: "ApplyLoan",
  },

  {
    label: "Free CIBIL",
    icon: "📈",
    screen: "CIBIL",
  },

  {
    label: "EMI Calc",
    icon: "🧮",
    screen: "EMICalculator",
  },

  {
    label: "Status",
    icon: "📄",
    screen: "ApplicationStatus",
  },

  {
    label: "Refer",
    icon: "🎁",
    screen: "ApplicationStatus",
  },

  {
    label: "Profile",
    icon: "🏢",
    screen: "ApplicationStatus",
  },

  {
    label: "Pay EMI",
    icon: "🧾",
    screen: "ApplicationStatus",
  },

  {
    label: "Help",
    icon: "❓",
    screen: "ApplicationStatus",
  },
];

export default function QuickActions() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {actions.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(item.screen)
          }
        >
          <View style={styles.iconBox}>
            <Text style={styles.icon}>
              {item.icon}
            </Text>
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
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  icon: {
    fontSize: 24,
  },

  label: {
    fontSize: 13,
    color: "#111827",
    textAlign: "center",
  },
});