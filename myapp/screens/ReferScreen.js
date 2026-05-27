import React from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

export default function ReferScreen() {
  const navigation = useNavigation();

  const steps = [
    {
      number: "1",
      title: "Share your code",
      subtitle:
        "Send your unique code to MSMEs you know",
    },

    {
      number: "2",
      title: "They apply & get a loan",
      subtitle:
        "Friend uses your code while applying",
    },

    {
      number: "3",
      title: "You both earn",
      subtitle:
        "₹2,500 to you + ₹2,500 off processing fee for them",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
            Refer & Earn
          </Text>

          <View style={{ width: 42 }} />
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.gift}>
            🎁
          </Text>

          <Text style={styles.bannerLabel}>
            REFER & EARN
          </Text>

          <Text style={styles.bannerAmount}>
            Earn ₹2,500
          </Text>

          <Text style={styles.bannerSubtitle}>
            for every fellow entrepreneur
            who takes a loan
          </Text>

          <View style={styles.circleOne} />
          <View style={styles.circleTwo} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {[
            ["12", "REFERRED"],
            ["5", "APPROVED"],
            ["₹12.5K", "EARNED"],
          ].map((item, index) => (
            <View
              key={index}
              style={styles.statCard}
            >
              <Text style={styles.statValue}>
                {item[0]}
              </Text>

              <Text style={styles.statLabel}>
                {item[1]}
              </Text>
            </View>
          ))}
        </View>

        {/* Referral Card */}
        <View style={styles.referralCard}>
          <Text style={styles.referralLabel}>
            YOUR REFERRAL CODE
          </Text>

          <View style={styles.codeContainer}>
            <Text style={styles.code}>
              RAJESH2026
            </Text>

            <TouchableOpacity style={styles.copyButton}>
              <Text style={styles.copyText}>
                Copy
              </Text>
            </TouchableOpacity>
          </View>

          {/* WhatsApp */}
          <TouchableOpacity style={styles.whatsappButton}>
            <Text style={styles.whatsappText}>
              Share via WhatsApp
            </Text>
          </TouchableOpacity>

          {/* Share Buttons */}
          <View style={styles.shareRow}>
            {["SMS", "Email", "More"].map(
              (item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.shareButton}
                >
                  <Text style={styles.shareText}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* How It Works */}
        <Text style={styles.sectionTitle}>
          How it works
        </Text>

        {steps.map((item, index) => (
          <View
            key={index}
            style={styles.stepCard}
          >
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>
                {item.number}
              </Text>
            </View>

            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                {item.title}
              </Text>

              <Text style={styles.stepSubtitle}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  banner: {
    backgroundColor: "#111111",
    borderRadius: 30,
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 24,
  },

  gift: {
    fontSize: 44,
  },

  bannerLabel: {
    color: "#FF001E",
    fontWeight: "700",
    marginTop: 14,
    letterSpacing: 1,
  },

  bannerAmount: {
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "700",
    marginTop: 14,
  },

  bannerSubtitle: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 26,
    fontSize: 17,
  },

  circleOne: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,0,30,0.25)",
    top: -20,
    right: -30,
  },

  circleTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,0,30,0.25)",
    bottom: -40,
    left: -30,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  statCard: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 24,
    alignItems: "center",
  },

  statValue: {
    color: "#FF001E",
    fontSize: 30,
    fontWeight: "700",
  },

  statLabel: {
    color: "#9CA3AF",
    marginTop: 10,
    fontWeight: "700",
    fontSize: 12,
  },

  referralCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
  },

  referralLabel: {
    color: "#9CA3AF",
    fontWeight: "700",
    marginBottom: 18,
  },

  codeContainer: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#FF001E",
    borderRadius: 18,
    padding: 16,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  code: {
    color: "#FF001E",
    fontSize: 34,
    fontWeight: "700",
  },

  copyButton: {
    backgroundColor: "#FF001E",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  copyText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  whatsappButton: {
    height: 64,
    backgroundColor: "#111111",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  whatsappText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  shareButton: {
    width: "31%",
    backgroundColor: "#F4F4F4",
    height: 54,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  shareText: {
    color: "#111827",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 18,
  },

  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  stepCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FF001E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },

  stepNumber: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 20,
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
  },

  stepSubtitle: {
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 22,
  },
});