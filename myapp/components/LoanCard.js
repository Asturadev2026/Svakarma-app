import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LoanCard({ activeLoan }) {
  const navigation = useNavigation();

  if (!activeLoan) {
    return (
      <View style={styles.card}>
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 6 }}>
            No Active Loans
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 14 }}>
            Apply for a business loan to get fast collateral-free funding.
          </Text>
          <TouchableOpacity 
            style={[styles.payButton, { backgroundColor: "#8B1A1A" }]}
            onPress={() => navigation.navigate("ApplyLoan")}
          >
            <Text style={styles.payButtonText}>Apply for a Loan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

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
            Active Loan ({activeLoan.loanNumber})
          </Text>

          <Text style={styles.amount}>
            ₹{Number(activeLoan.amount).toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {activeLoan.status}
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
            ₹{Number(activeLoan.emiDue).toLocaleString("en-IN")}
          </Text>
        </View>

        <View>
          <Text style={styles.bottomLabel}>
            Next Due
          </Text>

          <Text style={styles.bottomValue}>
            {formatDate(activeLoan.nextDueDate)}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: "#8B1A1A",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});