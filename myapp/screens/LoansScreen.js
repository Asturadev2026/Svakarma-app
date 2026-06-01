import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { loanService } from "../services/loanService";

const LOAN_PRODUCTS = [
  {
    id: "business",
    title: "Business Loan",
    subtitle: "Working Capital · Fund daily operations & inventory",
    icon: "💼",
    range: "₹2L – ₹25L",
    rate: "24–30% p.a.",
    tenure: "1–3 yrs",
    color: "#EEF2FF",
    accent: "#4F46E5",
  },
  {
    id: "samridhi",
    title: "Samridhi Loan",
    subtitle: "GST-based · Straight-through process utilizing GST returns",
    icon: "⚡",
    range: "₹5L – ₹25L",
    rate: "24–30% p.a.",
    tenure: "1–5 yrs",
    color: "#FFF7ED",
    accent: "#EA580C",
    badge: "STP"
  },
  {
    id: "machinery",
    title: "Machinery & Asset",
    subtitle: "Equipment · Finance new or used machines directly to vendors",
    icon: "⚙️",
    range: "₹5L – ₹25L",
    rate: "24–30% p.a.",
    tenure: "1–5 yrs",
    color: "#ECFDF5",
    accent: "#059669",
  },
  {
    id: "damini",
    title: "Damini Loan",
    subtitle: "Women Entrepreneurs · Special discounted processing fees",
    icon: "🌸",
    range: "₹3L – ₹25L",
    rate: "1% lower rate",
    tenure: "1–4 yrs",
    color: "#FDF2F8",
    accent: "#DB2777",
    badge: "DISCOUNT"
  },
  {
    id: "suryakiran",
    title: "SuryaKiran Loan",
    subtitle: "Solar Rooftop · Sustainable power for your industrial units",
    icon: "☀️",
    range: "₹2L – ₹25L",
    rate: "24–28% p.a.",
    tenure: "1–5 yrs",
    color: "#FEFCE8",
    accent: "#CA8A04",
  },
  {
    id: "wash",
    title: "WASH Loan",
    subtitle: "Water/Sanitation · Financing for sanitation retailers",
    icon: "💧",
    range: "₹2L – ₹15L",
    rate: "24–30% p.a.",
    tenure: "1–3 yrs",
    color: "#F0FDF4",
    accent: "#16A34A",
  },
];

const STATUS_COLORS = {
  "In Progress": { bg: "#FEF9C3", text: "#854D0E" },
  Submitted: { bg: "#EFF6FF", text: "#1D4ED8" },
  Approved: { bg: "#ECFDF5", text: "#065F46" },
  Rejected: { bg: "#FEF2F2", text: "#991B1B" },
  Disbursed: { bg: "#F3E8FF", text: "#6B21A8" },
};

export default function LoansScreen() {
  const navigation = useNavigation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async (isRefresh = false) => {
    try {
      const response = await loanService.getApplications();
      if (response?.success && response?.data) {
        setApplications(response.data);
      }
    } catch (e) {
      // Silent fail — user sees empty state
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E60012"
          />
        }
      >
        {/* Header */}
        <Text style={styles.pageTitle}>Business Loans</Text>
        <Text style={styles.pageSubtitle}>
          Collateral-free financing for India's MSMEs
        </Text>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: "#E60012" }]}
            onPress={() => navigation.navigate("ApplyLoan")}
            activeOpacity={0.88}
          >
            <Text style={styles.quickCardIcon}>📝</Text>
            <Text style={styles.quickCardLabelWhite}>Apply Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: "#FFFFFF" }]}
            onPress={() => navigation.navigate("EMICalculator")}
            activeOpacity={0.88}
          >
            <Text style={styles.quickCardIcon}>🧮</Text>
            <Text style={styles.quickCardLabel}>EMI Calc</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: "#FFFFFF" }]}
            onPress={() => navigation.navigate("ApplicationStatus")}
            activeOpacity={0.88}
          >
            <Text style={styles.quickCardIcon}>📊</Text>
            <Text style={styles.quickCardLabel}>My Status</Text>
          </TouchableOpacity>
        </View>

        {/* Active Applications */}
        <Text style={styles.sectionTitle}>My Applications</Text>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#E60012" size="small" />
            <Text style={styles.loadingText}>Fetching your loans...</Text>
          </View>
        ) : applications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyHeading}>No Applications Yet</Text>
            <Text style={styles.emptySubtext}>
              Apply for your first business loan and get disbursed within 48 hours.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => navigation.navigate("ApplyLoan")}
            >
              <Text style={styles.emptyActionBtnText}>Apply for a Loan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          applications.map((app, i) => {
            const colors = STATUS_COLORS[app.status] || STATUS_COLORS["Submitted"];
            const completedSteps = app.statusSteps?.filter((s) => s.completed).length || 0;
            const totalSteps = app.statusSteps?.length || 5;
            const progress = completedSteps / totalSteps;

            return (
              <TouchableOpacity
                key={app.id || i}
                style={styles.appCard}
                activeOpacity={0.88}
                onPress={() => navigation.navigate("ApplicationStatus")}
              >
                <View style={styles.appCardRow}>
                  <View>
                    <Text style={styles.appId}>#{app.id?.toUpperCase()}</Text>
                    <Text style={styles.appAmount}>
                      ₹{Number(app.amount).toLocaleString("en-IN")}
                    </Text>
                    <Text style={styles.appPurpose}>{app.purpose}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: colors.bg },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {app.status}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBg}>
                  <View
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {completedSteps} of {totalSteps} steps completed · Submitted {app.submittedAt}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        {/* Loan Products */}
        <Text style={styles.sectionTitle}>Loan Products</Text>
        {LOAN_PRODUCTS.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate("ApplyLoan")}
          >
            <View style={[styles.productIcon, { backgroundColor: product.color }]}>
              <Text style={styles.productIconEmoji}>{product.icon}</Text>
            </View>
            <View style={styles.productInfo}>
              <View style={styles.productTitleRow}>
                <Text style={styles.productTitle}>{product.title}</Text>
                {product.badge && (
                  <View style={[styles.productBadge, { backgroundColor: product.accent }]}>
                    <Text style={styles.productBadgeText}>{product.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.productSubtitle}>{product.subtitle}</Text>
              <View style={styles.productTagsRow}>
                <View style={[styles.tag, { backgroundColor: product.color }]}>
                  <Text style={[styles.tagText, { color: product.accent }]}>
                    {product.range}
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: product.color }]}>
                  <Text style={[styles.tagText, { color: product.accent }]}>
                    {product.rate}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Bottom note */}
        <View style={styles.disclosureCard}>
          <Text style={styles.disclosureText}>
            🔒 All loans subject to credit assessment and regulatory compliance. Interest rates may vary based on your business profile and CIBIL score.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scrollContent: { padding: 20, paddingBottom: 120 },

  pageTitle: { fontSize: 30, fontWeight: "700", color: "#111827" },
  pageSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 4, marginBottom: 24 },

  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  quickCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickCardIcon: { fontSize: 24, marginBottom: 6 },
  quickCardLabel: { fontSize: 12, fontWeight: "700", color: "#374151" },
  quickCardLabelWhite: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
    marginTop: 4,
  },

  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    gap: 12,
  },
  loadingText: { color: "#6B7280", fontWeight: "600" },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 28,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyHeading: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  emptySubtext: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionBtn: {
    backgroundColor: "#E60012",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyActionBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },

  appCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  appId: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 4 },
  appAmount: { fontSize: 26, fontWeight: "700", color: "#111827" },
  appPurpose: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  progressBg: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E60012",
    borderRadius: 6,
  },
  progressLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 8 },

  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  productIconEmoji: { fontSize: 26 },
  productInfo: { flex: 1 },
  productTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  productBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  productBadgeText: { fontSize: 9, fontWeight: "800", color: "#FFFFFF" },
  productTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  productSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2, marginBottom: 8 },
  productTagsRow: { flexDirection: "row", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: "700" },
  chevron: { fontSize: 24, color: "#D1D5DB", fontWeight: "300" },

  disclosureCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  disclosureText: { fontSize: 12, color: "#6B7280", lineHeight: 18 },
});
