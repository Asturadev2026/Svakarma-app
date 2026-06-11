import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function OfferCard({ activeLoan, preApproved }) {
  const navigation = useNavigation();

  const eligibleAmount = preApproved?.eligibleAmount ?? 850000;
  const expiresInDays = preApproved?.expiresInDays ?? 14;

  const handlePress = () => {
    if (activeLoan) {
      navigation.navigate("Loans");
    } else {
      navigation.navigate("ProductDetail", { productKey: "samridhi" });
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <LinearGradient
        colors={["#8f2222ff", "#941c1cff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.tagRow}>
          <Ionicons name={activeLoan ? "checkmark-circle" : "sparkles"} size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.tag}>
            {activeLoan ? "ACTIVE LOAN" : "PRE-APPROVED OFFER"}
          </Text>
        </View>

        <View style={styles.expiryBadge}>
          <Text style={styles.expiryText}>
            {activeLoan ? "Active" : `Expires in ${expiresInDays}d`}
          </Text>
        </View>

        <Text style={styles.subtitle}>
          {activeLoan ? "Current Active Loan" : "You're eligible up to"}
        </Text>

        <Text style={styles.amount}>
          {activeLoan
            ? `₹ ${Number(activeLoan.outstanding ?? activeLoan.amount).toLocaleString("en-IN")}`
            : `₹ ${Number(eligibleAmount).toLocaleString("en-IN")}`}
        </Text>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {activeLoan ? "Manage Existing Loan" : "Tap to claim · Zero docs"}
          </Text>

          <Feather name="arrow-right" size={24} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 26,
    marginBottom: 20,
    overflow: "hidden",
  },
  card: {
    padding: 22,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tag: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 14,
  },
  expiryBadge: {
    position: "absolute",
    top: 18,
    right: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  expiryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  subtitle: {
    marginTop: 22,
    color: "#FFE3E6",
    fontSize: 15,
  },
  amount: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});