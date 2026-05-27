import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

export default function OfferCard() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("ApplyLoan")
      }
    >
      <Text style={styles.tag}>
        ✨ PRE-APPROVED OFFER
      </Text>

      <View style={styles.expiryBadge}>
        <Text style={styles.expiryText}>
          Expires in 14d
        </Text>
      </View>

      <Text style={styles.subtitle}>
        You're eligible up to
      </Text>

      <Text style={styles.amount}>
        ₹ 8,50,000
      </Text>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap to claim · Zero docs
        </Text>

        <Text style={styles.arrow}>
          →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#E60012",
    borderRadius: 26,
    padding: 22,
    marginBottom: 20,
    overflow: "hidden",
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

  arrow: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
  },
});