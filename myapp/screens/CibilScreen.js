import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { cibilService } from "../services/cibilService";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function CibilScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  const fetchCibilScore = async () => {
    setLoading(true);
    try {
      const response = await cibilService.getCibilScore();
      if (response && response.success) {
        setScoreData(response.data);
      } else {
        Alert.alert("Failed", response.message || "Unable to fetch CIBIL score.");
      }
    } catch (error) {
      console.log("[CIBIL_ERROR]", error);
      Alert.alert("Network Error", error.message || "Failed to fetch CIBIL score from backend.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "excellent":
      case "good":
      case "high":
        return "#10B981"; // green
      case "medium":
      case "fair":
        return "#F59E0B"; // amber
      default:
        return "#EF4444"; // red
    }
  };

  const getStatusBg = (status) => {
    switch (status?.toLowerCase()) {
      case "excellent":
      case "good":
      case "high":
        return "#ECFDF5";
      case "medium":
      case "fair":
        return "#FFFBEB";
      default:
        return "#FEF2FE";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {scoreData ? "My Credit Report" : "Free CIBIL Score"}
        </Text>

        <View style={{ width: 42 }} />
      </View>

      {scoreData ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Score Gauge Card */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>TRANSUNION CIBIL SCORE</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreText}>{scoreData.score}</Text>
              <Text style={styles.maxScoreText}>/{scoreData.maxScore}</Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusBg(scoreData.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(scoreData.status) }]}>
                {scoreData.status?.toUpperCase()}
              </Text>
            </View>

            <View style={styles.gaugeContainer}>
              <View style={styles.gaugeTrack}>
                <View style={[styles.gaugeFill, { width: `${(scoreData.score / scoreData.maxScore) * 100}%`, backgroundColor: getStatusColor(scoreData.status) }]} />
              </View>
            </View>

            <Text style={styles.updatedText}>Last Updated: {scoreData.lastUpdated}</Text>
          </View>

          {/* Key Factors */}
          <Text style={styles.sectionHeading}>Credit Impact Factors</Text>
          {scoreData.factors?.map((factor, index) => (
            <View key={index} style={styles.factorCard}>
              <View style={styles.factorInfo}>
                <Text style={styles.factorName}>{factor.name}</Text>
                <Text style={styles.factorRating}>{factor.rating}</Text>
              </View>
              <View style={[styles.impactBadge, { backgroundColor: getStatusBg(factor.status) }]}>
                <Text style={[styles.impactText, { color: getStatusColor(factor.status) }]}>
                  {factor.status?.toUpperCase()} IMPACT
                </Text>
              </View>
            </View>
          ))}

          {/* Expert Insights */}
          <Text style={styles.sectionHeading}>Repayment Insights</Text>
          <View style={styles.insightsCard}>
            {scoreData.insights?.map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <Feather name="check-circle" size={16} color="#FF001E" style={{ marginRight: 10, marginTop: 3 }} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>

          {/* Check again button */}
          <TouchableOpacity style={styles.resetButton} onPress={() => setScoreData(null)}>
            <Text style={styles.resetButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.landingContent}>
          {/* Top Icon */}
          <View style={styles.iconCircle}>
            <Feather name="trending-up" size={44} color="#FF001E" />
          </View>

          {/* Main Title */}
          <Text style={styles.title}>Check your free CIBIL</Text>

          <Text style={styles.subtitle}>
            Your full credit report and score, free forever. No impact on your score.
          </Text>

          {/* Provider Card */}
          <View style={styles.providerCard}>
            <Text style={styles.poweredBy}>POWERED BY</Text>

            <View style={styles.providerRow}>
              <View style={styles.cibilLogo}>
                <Text style={styles.cibilText}>CIBIL</Text>
              </View>

              <View>
                <Text style={styles.providerName}>TransUnion CIBIL</Text>
                <Text style={styles.providerDescription}>India's most trusted credit bureau</Text>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
              <Feather name="check" size={16} color="#15803D" style={{ marginRight: 6 }} />
              <Text style={styles.infoBannerText}>
                This is a soft pull · Will not affect your score
              </Text>
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            {[
              "Updated monthly, free forever",
              "Detailed report with credit lines",
              "Personalized tips to improve score",
              "Alerts on score changes",
            ].map((text, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Feather name="check" size={16} color="#FF001E" style={{ marginRight: 8 }} />
                <Text style={styles.benefitText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* CTA */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={fetchCibilScore}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Get my free score</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backArrow: {
    fontSize: 22,
    color: "#111827",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  landingContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF1F2",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 40,
  },
  icon: {
    fontSize: 42,
  },
  title: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 34,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 14,
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  providerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  poweredBy: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 14,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cibilLogo: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cibilText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 16,
  },
  providerName: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  providerDescription: {
    marginTop: 2,
    color: "#9CA3AF",
    fontSize: 13,
  },
  infoBanner: {
    backgroundColor: "#ECFDF3",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  infoBannerText: {
    color: "#15803D",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
  benefitsContainer: {
    marginTop: 24,
    paddingHorizontal: 6,
  },
  benefitText: {
    color: "#4B5563",
    fontSize: 15,
  },
  button: {
    height: 60,
    borderRadius: 20,
    backgroundColor: "#FF001E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#FF001E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  
  // Detailed score styles
  scoreCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  scoreLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 10,
    marginBottom: 10,
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "800",
  },
  maxScoreText: {
    color: "#6B7280",
    fontSize: 20,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  gaugeContainer: {
    width: "100%",
    height: 10,
    backgroundColor: "#374151",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  gaugeTrack: {
    width: "100%",
    height: "100%",
  },
  gaugeFill: {
    height: "100%",
    borderRadius: 10,
  },
  updatedText: {
    color: "#4B5563",
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
    marginTop: 6,
  },
  factorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  factorInfo: {
    flex: 1,
  },
  factorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  factorRating: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  impactBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  impactText: {
    fontSize: 10,
    fontWeight: "800",
  },
  insightsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  insightBullet: {
    fontSize: 18,
    color: "#FF001E",
    marginRight: 10,
    lineHeight: 22,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  resetButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  resetButtonText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "700",
  },
});