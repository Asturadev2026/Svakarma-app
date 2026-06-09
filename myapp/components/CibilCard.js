import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CibilCard({ cibil }) {
  const navigation = useNavigation();

  if (!cibil) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("CIBIL")
        }
      >
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#FFFFFF", marginBottom: 6 }}>
            CIBIL Not Available
          </Text>
          <Text style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginBottom: 14 }}>
            Check your credit score for free to unlock better loan rates.
          </Text>
          <View style={[styles.circle, { borderColor: "#6B7280", width: 100, height: 36, borderRadius: 10, borderWidth: 1.5 }]}>
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Check Now</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "excellent":
      case "good":
      case "high":
        return "#10B981"; // green
      case "medium":
      case "fair":
        return "#F59E0B"; // amber
      default:
        return "#EF4444"; // red
    }
  };

  const statusColor = getStatusColor(cibil.status);

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
            {cibil.score}
          </Text>
        </View>

        <View style={[styles.circle, { borderColor: statusColor }]}>
          <Text style={[styles.circleText, { color: statusColor }]}>
            {cibil.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${(cibil.score / cibil.maxScore) * 100}%`, backgroundColor: statusColor }]} />
      </View>

      <Text style={styles.description}>
        {cibil.score >= 700 
          ? "You're in a strong credit bracket. Eligible for competitive interest rates."
          : "Work on timely repayments to improve your credit rating."}
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
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: {
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
    height: "100%",
  },
  description: {
    color: "#D1D5DB",
    marginTop: 16,
    lineHeight: 22,
  },
});