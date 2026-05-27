import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

export default function CibilScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Free CIBIL Score
        </Text>

        <View style={{ width: 42 }} />
      </View>

      {/* Top Icon */}
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>
          📈
        </Text>
      </View>

      {/* Main Title */}
      <Text style={styles.title}>
        Check your free CIBIL
      </Text>

      <Text style={styles.subtitle}>
        Your full credit report and score,
        free forever. No impact on your score.
      </Text>

      {/* Provider Card */}
      <View style={styles.providerCard}>
        <Text style={styles.poweredBy}>
          POWERED BY
        </Text>

        <View style={styles.providerRow}>
          <View style={styles.cibilLogo}>
            <Text style={styles.cibilText}>
              CIBIL
            </Text>
          </View>

          <View>
            <Text style={styles.providerName}>
              TransUnion CIBIL
            </Text>

            <Text style={styles.providerDescription}>
              India's most trusted credit bureau
            </Text>
          </View>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          ✓ This is a soft pull · Will not affect your score
        </Text>
      </View>

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefit}>
          ✓ Updated monthly, free forever
        </Text>

        <Text style={styles.benefit}>
          ✓ Detailed report with credit lines
        </Text>

        <Text style={styles.benefit}>
          ✓ Personalized tips to improve score
        </Text>

        <Text style={styles.benefit}>
          ✓ Alerts on score changes
        </Text>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* CTA */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          Get my free score
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 22,
    paddingTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  backArrow: {
    fontSize: 22,
    color: "#111827",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFF1F2",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 50,
  },

  icon: {
    fontSize: 42,
  },

  title: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    textAlign: "center",
    marginTop: 18,
    color: "#6B7280",
    fontSize: 17,
    lineHeight: 28,
    paddingHorizontal: 10,
  },

  providerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginTop: 34,
  },

  poweredBy: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 18,
  },

  providerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cibilLogo: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  cibilText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 18,
  },

  providerName: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
  },

  providerDescription: {
    marginTop: 4,
    color: "#9CA3AF",
    fontSize: 14,
  },

  infoBanner: {
    backgroundColor: "#ECFDF3",
    borderRadius: 18,
    padding: 18,
    marginTop: 22,
  },

  infoText: {
    color: "#15803D",
    fontWeight: "600",
    lineHeight: 22,
  },

  benefitsContainer: {
    marginTop: 26,
  },

  benefit: {
    color: "#374151",
    fontSize: 17,
    lineHeight: 34,
  },

  button: {
    height: 68,
    borderRadius: 24,
    backgroundColor: "#FF001E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,

    shadowColor: "#FF001E",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.25,
    shadowRadius: 18,

    elevation: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
});