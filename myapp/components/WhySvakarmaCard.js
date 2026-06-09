import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function WhySvakarmaCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Why Svakarma?
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            ₹500Cr+
          </Text>

          <Text style={styles.statLabel}>
            Loans Disbursed
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            25k+
          </Text>

          <Text style={styles.statLabel}>
            MSMEs Served
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            98%
          </Text>

          <Text style={styles.statLabel}>
            Approval Rate
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            24 hrs
          </Text>

          <Text style={styles.statLabel}>
            Avg Approval Time
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 40,
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 22,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statBox: {
    width: "48%",
    backgroundColor: "#F8F8F8",
    borderRadius: 18,
    padding: 20,
  },

  statValue: {
    color: "#8B1A1A",
    fontSize: 28,
    fontWeight: "700",
  },

  statLabel: {
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
  },
});