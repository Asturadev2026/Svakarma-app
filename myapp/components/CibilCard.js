import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

export default function CibilCard() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("CIBIL")
      }
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>
            Your CIBIL Score
          </Text>

          <Text style={styles.score}>
            742
          </Text>
        </View>

        <View style={styles.circle}>
          <Text style={styles.circleText}>
            GOOD
          </Text>
        </View>
      </View>

      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: "74%" }]} />
      </View>

      <Text style={styles.description}>
        You're in a strong credit bracket.
        Eligible for competitive interest rates.
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 24,
    marginBottom: 22,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#9CA3AF",
    fontSize: 14,
  },

  score: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "700",
    marginTop: 6,
  },

  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 5,
    borderColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },

  circleText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#374151",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 24,
  },

  progressFill: {
    width: "78%",
    height: "100%",
    backgroundColor: "#10B981",
  },

  description: {
    color: "#D1D5DB",
    marginTop: 16,
    lineHeight: 22,
  },
});