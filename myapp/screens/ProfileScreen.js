import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons";
import api from "../services/api";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.success) {
          setProfileData(response.data);
        }
      } catch (err) {
        console.warn('[PROFILE] Failed to fetch profile:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const personal = profileData?.personalDetails;
  const business = profileData?.businessDetails;
  const kyc = profileData?.kycStatus;

  // Derive completion percentage from kycStatus
  const completionPct = kyc?.completionPercentage ?? 0;

  // Derive whether business info is complete
  const businessComplete = !!(business?.businessName);

  const sections = [
    {
      title: "Personal details",
      fields: personal?.fullName && personal.fullName !== 'Complete Your Profile'
        ? "Name on file"
        : "Pending",
      completed: !!(personal?.fullName && personal.fullName !== 'Complete Your Profile'),
      icon: "user",
      onPress: () => navigation.navigate("EditPersonalDetails"),
    },
    {
      title: "Business info",
      fields: businessComplete ? business.businessName : "Not set",
      completed: businessComplete,
      icon: "briefcase",
      onPress: () => navigation.navigate("OnboardingSelectType"),
    },
    {
      title: "KYC documents",
      fields: (kyc?.panVerified && kyc?.aadhaarVerified) ? "Verified" : "Pending verification",
      completed: !!(kyc?.panVerified && kyc?.aadhaarVerified),
      icon: "shield",
      onPress: () => navigation.navigate("OnboardingDocumentUpload"),
    },
    {
      title: "Financial profile",
      fields: business?.annualTurnover ? business.annualTurnover : "Pending",
      completed: !!(business?.annualTurnover),
      icon: "trending-up",
    },
    {
      title: "Address proof",
      fields: business?.city ? `${business.city}, ${business.state ?? ''}` : "Pending",
      completed: !!(business?.city),
      icon: "map-pin",
    },
  ];

  const infoRows = [
    ["PAN",         personal?.pan ?? "—"],
    ["Aadhaar",     personal?.aadhaar ?? "—"],
    ["Udyam ID",    business?.udyamId ?? "—"],
    ["GSTIN",       business?.gstin ?? "—"],
    ["Mobile",      personal?.mobile ? `+91 ${personal.mobile}` : "—"],
    ["Business",    business?.businessName ?? "—"],
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8B1A1A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            My Profile
          </Text>

          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-2" size={18} color="#8B1A1A" />
          </TouchableOpacity>
        </View>

        {/* Completion Card */}
        <View style={styles.completionCard}>
          <Text style={styles.completionLabel}>
            PROFILE COMPLETION
          </Text>

          <Text style={styles.completionPercentage}>
            {completionPct}%
          </Text>

          <Text style={styles.completionText}>
            {completionPct >= 100 ? 'Profile complete!' : 'Complete your profile to unlock better rates'}
          </Text>

          <Text style={styles.completionSubtext}>
            0.5% lower interest rate
          </Text>

          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionHeading}>
          Profile sections
        </Text>

        {/* Profile Cards */}
        {sections.map((item, index) => {
          const iconColor = item.completed ? "#16A34A" : "#8B1A1A";
          const iconBg = item.completed ? "#EEF7F0" : "#FFF5F5";
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.sectionCard,
                !item.completed && styles.pendingCard,
              ]}
              activeOpacity={0.85}
              onPress={() => item.onPress && item.onPress()}
            >
              <View style={styles.leftRow}>
                <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                  <Feather name={item.icon} size={22} color={iconColor} />
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
                <Feather name="check-circle" size={24} color="#16A34A" />
              ) : (
                <View style={styles.completeBadge}>
                  <Text style={styles.completeText}>
                    COMPLETE
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Quick Info */}
        <Text style={styles.sectionHeading}>
          Quick info
        </Text>

        <View style={styles.infoCard}>
          {infoRows.map((item, index) => (
            <View
              key={index}
              style={[
                styles.infoRow,

                index === infoRows.length - 1 && {
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
    color: "#8B1A1A",
    fontSize: 20,
  },

  completionCard: {
    backgroundColor: "#8B1A1A",
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
    backgroundColor: "#8B1A1A",
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