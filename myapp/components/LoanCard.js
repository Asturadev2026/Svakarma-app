import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

export default function LoanCard() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("ApplicationStatus")
      }
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>
            Active Loan (SVK-2845102)
          </Text>

          <Text style={styles.amount}>
            ₹1,87,500
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            ACTIVE
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.bottomLabel}>
            EMI Due
          </Text>

          <Text style={styles.bottomValue}>
            ₹13,850
          </Text>
        </View>

        <View>
          <Text style={styles.bottomLabel}>
            Next Due
          </Text>

          <Text style={styles.bottomValue}>
            12 May
          </Text>
        </View>

        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>
            Pay Now
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 22,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#6B7280",
    fontSize: 14,
  },

  amount: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 6,
  },

  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },

  statusText: {
    color: "#166534",
    fontWeight: "700",
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 20,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bottomLabel: {
    color: "#6B7280",
    fontSize: 13,
  },

  bottomValue: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },

  payButton: {
    backgroundColor: "#FF001E",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },

  payButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});