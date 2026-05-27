import React from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const sections = [
    {
      title: "Personal details",
      fields: "5 fields completed",
      completed: true,
      icon: "👤",
    },

    {
      title: "Business info",
      fields: "7 fields completed",
      completed: true,
      icon: "🏢",
    },

    {
      title: "KYC documents",
      fields: "4 fields completed",
      completed: true,
      icon: "🛡️",
    },

    {
      title: "Financial profile",
      fields: "3 fields completed",
      completed: true,
      icon: "📈",
    },

    {
      title: "Address proof",
      fields: "2 fields pending",
      completed: false,
      icon: "📍",
    },

    {
      title: "References",
      fields: "2 fields pending",
      completed: false,
      icon: "👥",
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
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backArrow}>
              ←
            </Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            My Profile
          </Text>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editIcon}>
              ✎
            </Text>
          </TouchableOpacity>
        </View>

        {/* Completion Card */}
        <View style={styles.completionCard}>
          <Text style={styles.completionLabel}>
            PROFILE COMPLETION
          </Text>

          <Text style={styles.completionPercentage}>
            85%
          </Text>

          <Text style={styles.completionText}>
            Complete 2 more sections to unlock
          </Text>

          <Text style={styles.completionSubtext}>
            0.5% lower interest rate
          </Text>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionHeading}>
          Profile sections
        </Text>

        {/* Profile Cards */}
        {sections.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sectionCard,

              !item.completed &&
                styles.pendingCard,
            ]}
            activeOpacity={0.85}
          >
            <View style={styles.leftRow}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>
                  {item.icon}
                </Text>
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  {item.title}
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {item.fields}
                </Text>
              </View>
            </View>

            {item.completed ? (
              <Text style={styles.checkmark}>
                ✓
              </Text>
            ) : (
              <View style={styles.completeBadge}>
                <Text style={styles.completeText}>
                  COMPLETE
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Quick Info */}
        <Text style={styles.sectionHeading}>
          Quick info
        </Text>

        <View style={styles.infoCard}>
          {[
            ["PAN", "ABCDE1234F"],
            ["Aadhaar", "XXXX XXXX 4527"],
            ["Udyam ID", "UDYAM-MH-18-0034521"],
            ["GSTIN", "27ABCDE1234F1Z5"],
            ["Email", "rajesh.mehta@mehtaent.in"],
            ["Mobile", "+91 98765 43210"],
          ].map((item, index) => (
            <View
              key={index}
              style={[
                styles.infoRow,

                index === 5 && {
                  borderBottomWidth: 0,
                },
              ]}
            >
              <Text style={styles.infoLabel}>
                {item[0]}
              </Text>

              <Text style={styles.infoValue}>
                {item[1]}
              </Text>
            </View>
          ))}
        </View>
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

  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  editIcon: {
    color: "#FF001E",
    fontSize: 20,
  },

  completionCard: {
    backgroundColor: "#E60012",
    borderRadius: 28,
    padding: 26,
    marginBottom: 28,
  },

  completionLabel: {
    color: "#FFD7DC",
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 1,
  },

  completionPercentage: {
    color: "#FFFFFF",
    fontSize: 64,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },

  completionText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 8,
    fontSize: 16,
  },

  completionSubtext: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    marginTop: 8,
    fontSize: 18,
  },

  progressBackground: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    marginTop: 24,
    overflow: "hidden",
  },

  progressFill: {
    width: "85%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  sectionHeading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 18,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pendingCard: {
    borderWidth: 1,
    borderColor: "#FFC9D0",
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EEF7F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  icon: {
    fontSize: 24,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
  },

  sectionSubtitle: {
    marginTop: 6,
    color: "#6B7280",
  },

  checkmark: {
    color: "#16A34A",
    fontSize: 26,
    fontWeight: "700",
  },

  completeBadge: {
    backgroundColor: "#FF001E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },

  completeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 40,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  infoLabel: {
    color: "#6B7280",
    fontSize: 16,
  },

  infoValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
});