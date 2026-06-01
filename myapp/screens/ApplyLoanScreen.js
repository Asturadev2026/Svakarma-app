import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loanService } from "../services/loanService";

export default function ApplyLoanScreen({ navigation }) {
  const [step, setStep] = useState(1);

  // Form States
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("36");
  const [purpose, setPurpose] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [udyamId, setUdyamId] = useState("");
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!amount || Number(amount) < 50000) {
        Alert.alert("Invalid Amount", "Please enter a valid loan amount (Minimum ₹50,000).");
        return;
      }
      if (!purpose.trim()) {
        Alert.alert("Purpose Required", "Please enter the purpose of this loan.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!businessName.trim()) {
        Alert.alert("Business Name Required", "Please enter your business name.");
        return;
      }
      if (!udyamId.trim()) {
        Alert.alert("Udyam ID Required", "Please enter your Udyam Registration ID.");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!pan || pan.length !== 10) {
      Alert.alert("Invalid PAN", "Please enter a valid 10-character PAN number.");
      return;
    }
    if (!aadhaar || aadhaar.length !== 12) {
      Alert.alert("Invalid Aadhaar", "Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    setLoading(true);
    try {
      const response = await loanService.applyForLoan({
        amount: Number(amount),
        tenureMonths: Number(tenure),
        purpose,
        businessName,
        udyamId,
        pan,
        aadhaar,
      });

      setLoading(false);
      if (response.success) {
        Alert.alert(
          "Congratulations! 🎉",
          "Your loan application has been submitted successfully.",
          [
            {
              text: "Track Status",
              onPress: () => navigation.replace("ApplicationStatus"),
            },
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Submission Failed", error.message || "Something went wrong.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Apply for Business Loan</Text>
              <View style={{ width: 42 }} />
            </View>

            {/* Stepper Indicators */}
            <View style={styles.stepperRow}>
              {[1, 2, 3].map((s) => (
                <View key={s} style={styles.stepContainer}>
                  <View
                    style={[
                      styles.stepCircle,
                      step >= s ? styles.stepCircleActive : styles.stepCircleInactive,
                    ]}
                  >
                    <Text style={step >= s ? styles.stepTextActive : styles.stepTextInactive}>
                      {s}
                    </Text>
                  </View>
                  <Text style={step >= s ? styles.stepLabelActive : styles.stepLabelInactive}>
                    {s === 1 ? "Amount" : s === 2 ? "Business" : "KYC"}
                  </Text>
                </View>
              ))}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* STEP 1: AMOUNT & TENURE */}
              {step === 1 && (
                <View style={styles.formSection}>
                  <Text style={styles.sectionHeading}>How much capital do you need?</Text>
                  <Text style={styles.sectionSubheading}>
                    Enter the amount and preferred repayment tenure.
                  </Text>

                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Required Loan Amount (₹)</Text>
                    <Text style={styles.mandatory}>*</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 500000"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />

                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Repayment Tenure (Months)</Text>
                    <Text style={styles.mandatory}>*</Text>
                  </View>
                  <View style={styles.tenureContainer}>
                    {["12", "24", "36", "60"].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.tenureButton,
                          tenure === t && styles.tenureButtonActive,
                        ]}
                        onPress={() => setTenure(t)}
                      >
                        <Text
                          style={[
                            styles.tenureText,
                            tenure === t && styles.tenureTextActive,
                          ]}
                        >
                          {t} Mos
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Purpose of Loan</Text>
                    <Text style={styles.mandatory}>*</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="e.g. Purchase of CNC machines or machinery upgrades"
                    placeholderTextColor="#A0A0A0"
                    multiline
                    numberOfLines={4}
                    value={purpose}
                    onChangeText={setPurpose}
                  />
                </View>
              )}

              {/* STEP 2: BUSINESS PROFILE */}
              {step === 2 && (
                <View style={styles.formSection}>
                  <Text style={styles.sectionHeading}>Tell us about your business</Text>
                  <Text style={styles.sectionSubheading}>
                    We support registered MSMEs and Manufacturing units.
                  </Text>

                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Registered Business Name</Text>
                    <Text style={styles.mandatory}>*</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Mehta CNC Enterprises"
                    placeholderTextColor="#A0A0A0"
                    value={businessName}
                    onChangeText={setBusinessName}
                  />

                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Udyam Registration Number</Text>
                    <Text style={styles.mandatory}>*</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. UDYAM-MH-18-XXXXXXX"
                    placeholderTextColor="#A0A0A0"
                    autoCapitalize="characters"
                    value={udyamId}
                    onChangeText={setUdyamId}
                  />
                </View>
              )}

              {/* STEP 3: IDENTITY & KYC */}
              {step === 3 && (
                <View style={styles.formSection}>
                  <Text style={styles.sectionHeading}>Verify your identity</Text>
                  <Text style={styles.sectionSubheading}>
                    Instant validation via official credit authorities.
                  </Text>

                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>PAN Card Number</Text>
                    <Text style={styles.mandatory}>*</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ABCDE1234F"
                    placeholderTextColor="#A0A0A0"
                    autoCapitalize="characters"
                    maxLength={10}
                    value={pan}
                    onChangeText={setPan}
                  />

                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Aadhaar Card Number</Text>
                    <Text style={styles.mandatory}>*</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="12-digit Aadhaar Number"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    maxLength={12}
                    value={aadhaar}
                    onChangeText={setAadhaar}
                  />

                  <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                      🔒 Your data is fully encrypted and stored securely using banking-grade security protocols.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              {step < 3 ? (
                <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
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
  stepperRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  stepContainer: {
    alignItems: "center",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: "#E60012",
  },
  stepCircleInactive: {
    backgroundColor: "#F0F0F0",
  },
  stepTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  stepTextInactive: {
    color: "#6B7280",
    fontWeight: "600",
  },
  stepLabelActive: {
    color: "#E60012",
    fontWeight: "700",
    fontSize: 12,
  },
  stepLabelInactive: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 12,
  },
  scrollContent: {
    padding: 24,
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  sectionSubheading: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mandatory: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E60012",
    marginLeft: 4,
    marginTop: -2,
  },
  textInput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 22,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  tenureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  tenureButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  tenureButtonActive: {
    backgroundColor: "#E60012",
  },
  tenureText: {
    color: "#374151",
    fontWeight: "600",
  },
  tenureTextActive: {
    color: "#FFFFFF",
  },
  infoCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  infoText: {
    color: "#991B1B",
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  primaryButton: {
    backgroundColor: "#E60012",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#FFB3B8",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});