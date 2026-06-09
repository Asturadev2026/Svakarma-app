import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { loanService } from "../services/loanService";

export default function EMICalculatorScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(14.5);
  const [tenure, setTenure] = useState(36);

  const [emi, setEmi] = useState(0);
  const [interest, setInterest] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [apiLoading, setApiLoading] = useState(false);

  // Calculate EMI — tries API first, falls back to local formula
  const calculate = async () => {
    setApiLoading(true);
    try {
      const response = await loanService.calculateEMI(amount, rate, tenure);
      if (response?.success && response?.data) {
        setEmi(response.data.monthlyEMI);
        setInterest(response.data.totalInterest);
        setTotalPayable(response.data.totalPayable);
      }
    } catch {
      // Local fallback — works offline
      const p = Number(amount);
      const r = Number(rate) / 12 / 100;
      const n = Number(tenure);
      const calcEmi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = calcEmi * n;
      setEmi(Math.round(calcEmi));
      setInterest(Math.round(total - p));
      setTotalPayable(Math.round(total));
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [amount, rate, tenure]);

  const adjustAmount = (delta) => {
    const next = amount + delta;
    if (next >= 50000 && next <= 10000000) setAmount(next);
  };

  const adjustRate = (delta) => {
    const next = parseFloat((rate + delta).toFixed(1));
    if (next >= 5 && next <= 36) setRate(next);
  };

  const adjustTenure = (delta) => {
    const next = tenure + delta;
    if (next >= 6 && next <= 120) setTenure(next);
  };

  const principalPct = Math.round((amount / totalPayable) * 100) || 0;
  const interestPct = 100 - principalPct;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={styles.pageTitle}>EMI Calculator</Text>
        <Text style={styles.pageSubtitle}>
          Adjust sliders to see your repayment breakdown
        </Text>

        {/* EMI Result Card */}
        <View style={styles.resultCard}>
          <Text style={styles.emiLabel}>MONTHLY EMI</Text>
          <Text style={styles.emiValue}>
            {apiLoading ? "—" : `₹${emi.toLocaleString("en-IN")}`}
          </Text>

          {/* Pie-like split bar */}
          <View style={styles.splitBarBg}>
            <View style={[styles.splitBarPrincipal, { flex: principalPct || 1 }]} />
            <View style={[styles.splitBarInterest, { flex: interestPct || 1 }]} />
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FFFFFF" }]} />
              <Text style={styles.legendTextWhite}>Principal  {principalPct}%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FF8090" }]} />
              <Text style={styles.legendTextWhite}>Interest  {interestPct}%</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Principal</Text>
              <Text style={styles.summaryValue}>
                ₹{amount.toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Interest</Text>
              <Text style={styles.summaryValue}>
                ₹{interest.toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Payable</Text>
              <Text style={styles.summaryValue}>
                ₹{totalPayable.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsCard}>
          {/* Loan Amount */}
          <View style={styles.controlBlock}>
            <View style={styles.controlHeader}>
              <Text style={styles.controlLabel}>Loan Amount</Text>
              <Text style={styles.controlValueText}>
                ₹{amount.toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.stepperRow}>
              {[50000, 100000, 500000].map((step) => (
                <TouchableOpacity
                  key={`am-${step}`}
                  style={styles.stepBtn}
                  onPress={() => adjustAmount(-step)}
                >
                  <Text style={styles.stepBtnText}>-{step >= 100000 ? `${step / 100000}L` : `${step / 1000}K`}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.stepSpacer} />
              {[50000, 100000, 500000].map((step) => (
                <TouchableOpacity
                  key={`ap-${step}`}
                  style={[styles.stepBtn, styles.stepBtnAdd]}
                  onPress={() => adjustAmount(step)}
                >
                  <Text style={[styles.stepBtnText, styles.stepBtnAddText]}>+{step >= 100000 ? `${step / 100000}L` : `${step / 1000}K`}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.controlDivider} />

          {/* Interest Rate */}
          <View style={styles.controlBlock}>
            <View style={styles.controlHeader}>
              <Text style={styles.controlLabel}>Interest Rate (p.a.)</Text>
              <Text style={styles.controlValueText}>{rate}%</Text>
            </View>
            <View style={styles.stepperRow}>
              {[0.5, 1, 2].map((step) => (
                <TouchableOpacity
                  key={`rm-${step}`}
                  style={styles.stepBtn}
                  onPress={() => adjustRate(-step)}
                >
                  <Text style={styles.stepBtnText}>-{step}%</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.stepSpacer} />
              {[0.5, 1, 2].map((step) => (
                <TouchableOpacity
                  key={`rp-${step}`}
                  style={[styles.stepBtn, styles.stepBtnAdd]}
                  onPress={() => adjustRate(step)}
                >
                  <Text style={[styles.stepBtnText, styles.stepBtnAddText]}>+{step}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.controlDivider} />

          {/* Tenure */}
          <View style={styles.controlBlock}>
            <View style={styles.controlHeader}>
              <Text style={styles.controlLabel}>Tenure</Text>
              <Text style={styles.controlValueText}>{tenure} Months</Text>
            </View>
            <View style={styles.tenureChips}>
              {[6, 12, 24, 36, 60, 84].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.chip,
                    tenure === t && styles.chipActive,
                  ]}
                  onPress={() => setTenure(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      tenure === t && styles.chipTextActive,
                    ]}
                  >
                    {t}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Smart Tips */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Smart Tip</Text>
          <Text style={styles.tipText}>
            At your current rate of {rate}%, every 1% reduction saves{" "}
            <Text style={{ fontWeight: "700" }}>
              ₹{Math.round((interest * 0.01) / rate).toLocaleString("en-IN")}
            </Text>{" "}
            in interest over the tenure. Maintain a CIBIL score above 750 to
            negotiate better rates.
          </Text>
        </View>

        {/* Apply CTA */}
        <TouchableOpacity
          style={styles.applyBtn}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("ApplyLoan")}
        >
          <Text style={styles.applyBtnText}>
            Apply Now · ₹{emi.toLocaleString("en-IN")}/mo
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scrollContent: { padding: 20, paddingBottom: 120 },

  pageTitle: { fontSize: 30, fontWeight: "700", color: "#111827" },
  pageSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 4, marginBottom: 24 },

  resultCard: {
    backgroundColor: "#8B1A1A",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#8B1A1A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  emiLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  emiValue: {
    color: "#FFFFFF",
    fontSize: 52,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 8,
  },
  splitBarBg: {
    flexDirection: "row",
    height: 8,
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 14,
  },
  splitBarPrincipal: { backgroundColor: "#FFFFFF" },
  splitBarInterest: { backgroundColor: "#FF8090" },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 18,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTextWhite: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600" },
  summaryRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 14,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 4 },
  summaryLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 4 },
  summaryValue: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },

  controlsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  controlBlock: { paddingVertical: 4 },
  controlHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  controlLabel: { fontSize: 15, fontWeight: "600", color: "#374151" },
  controlValueText: { fontSize: 16, fontWeight: "700", color: "#8B1A1A" },
  controlDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 16 },

  stepperRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  stepBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  stepBtnAdd: { backgroundColor: "#FEF2F2" },
  stepBtnText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  stepBtnAddText: { color: "#8B1A1A" },
  stepSpacer: { width: 8 },

  tenureChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  chipActive: { backgroundColor: "#8B1A1A" },
  chipText: { fontSize: 13, fontWeight: "700", color: "#374151" },
  chipTextActive: { color: "#FFFFFF" },

  tipCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  tipTitle: { fontSize: 14, fontWeight: "700", color: "#92400E", marginBottom: 6 },
  tipText: { fontSize: 13, color: "#78350F", lineHeight: 20 },

  applyBtn: {
    backgroundColor: "#8B1A1A",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#8B1A1A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  applyBtnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
});