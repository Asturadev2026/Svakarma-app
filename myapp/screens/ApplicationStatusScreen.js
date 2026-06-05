import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loanService } from "../services/loanService";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function ApplicationStatusScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await loanService.getApplications();
      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (e) {
      console.log("Failed to fetch applications:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E60012" />
        <Text style={styles.loadingText}>Fetching your application details...</Text>
      </SafeAreaView>
    );
  }

  const activeApp = applications[0]; // Fetch the most recent application

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Status</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!activeApp ? (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={64} color="#9CA3AF" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyHeading}>No Applications Found</Text>
            <Text style={styles.emptySubheading}>
              You haven't submitted any loan applications yet. Apply now to get quick financing.
            </Text>
            <TouchableOpacity style={styles.applyBtn} onPress={() => navigation.navigate("ApplyLoan")}>
              <Text style={styles.applyBtnText}>Apply for a Loan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Status Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>APPLICATION ID: {activeApp.id}</Text>
              <Text style={styles.cardAmount}>₹{activeApp.amount.toLocaleString("en-IN")}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{activeApp.status}</Text>
              </View>
              <Text style={styles.cardSubmitted}>Submitted on {activeApp.submittedAt}</Text>
            </View>

            {/* Stepper Timeline */}
            <Text style={styles.sectionHeading}>Verification Timeline</Text>
            <View style={styles.timelineCard}>
              {activeApp.statusSteps.map((step, index) => {
                const isCompleted = step.completed;
                const isLast = index === activeApp.statusSteps.length - 1;

                return (
                  <View key={index} style={styles.timelineItem}>
                    {/* Vertical line connection */}
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          isCompleted ? styles.lineCompleted : styles.linePending,
                        ]}
                      />
                    )}

                    {/* Timeline dot */}
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted ? styles.dotCompleted : styles.dotPending,
                      ]}
                    >
                      {isCompleted && <Feather name="check" size={14} color="#FFFFFF" />}
                    </View>

                    {/* Details content */}
                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.stepLabel,
                          isCompleted ? styles.labelCompleted : styles.labelPending,
                        ]}
                      >
                        {step.label}
                      </Text>
                      {step.subtitle && <Text style={styles.stepSubtitle}>{step.subtitle}</Text>}
                      {step.date && <Text style={styles.stepDate}>{step.date}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 22,
    color: "#111827",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    padding: 24,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  statusBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 14,
  },
  statusText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 14,
  },
  cardSubmitted: {
    fontSize: 13,
    color: "#6B7280",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 28,
    minHeight: 60,
  },
  timelineLine: {
    position: "absolute",
    left: 14,
    top: 28,
    bottom: -28,
    width: 2,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: "#E60012",
  },
  linePending: {
    backgroundColor: "#E5E7EB",
  },
  timelineDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    marginRight: 18,
  },
  dotCompleted: {
    backgroundColor: "#E60012",
  },
  dotPending: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  dotCheck: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  timelineContent: {
    flex: 1,
    justifyContent: "center",
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  labelCompleted: {
    color: "#111827",
  },
  labelPending: {
    color: "#9CA3AF",
  },
  stepSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  stepDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubheading: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  applyBtn: {
    backgroundColor: "#E60012",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});