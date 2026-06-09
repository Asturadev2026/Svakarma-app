import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { authService } from '../services/authService';
import { Alert } from 'react-native';

export default function LoginScreen() {
  const navigation = useNavigation();

  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation
  const isValid = mobileNumber.length === 10;

  // Handle Input
  const handleTextChange = (text) => {
    const cleanText = text.replace(/[^0-9]/g, "").slice(0, 10);
    setMobileNumber(cleanText);
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      console.log(`[AUTH] Sending OTP for ${mobileNumber}...`);
      const response = await authService.sendOtp(mobileNumber);
      if (response.success) {
        navigation.navigate("OTP", {
          mobileNumber,
          generatedOtp: "123456",
        });
      } else {
        Alert.alert("Error", response.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.log('[SEND_OTP_ERROR]', error);
      Alert.alert("Network Error", error.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Splash")}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome Text */}
      <Text style={styles.title}>Welcome</Text>

      <Text style={styles.subtitle}>
        Enter your registered mobile number to continue
      </Text>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.countryCode}>+91</Text>

        <TextInput
          placeholder="98765 43210"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          style={styles.input}
          value={mobileNumber}
          onChangeText={handleTextChange}
          maxLength={10}
        />

        <Text style={styles.phoneIcon}>📞</Text>
      </View>

      {/* Terms */}
      <Text style={styles.terms}>
        🔒 By continuing you agree to share your phone
        number for OTP verification per RBI Digital
        Lending norms.
      </Text>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* OTP Button */}
      <TouchableOpacity
        style={[
          styles.button,
          (isValid && !loading) && styles.buttonActive,
        ]}
        onPress={handleSendOTP}
        disabled={!isValid || loading}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {loading ? "Sending..." : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 24,
    paddingTop: 55,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
  },

  backArrow: {
    fontSize: 22,
    color: "#111827",
  },

  logo: {
    width: 170,
    height: 70,
    marginTop: 20,
  },

  title: {
    fontSize: 48,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
  },

  subtitle: {
    fontSize: 20,
    lineHeight: 32,
    color: "#4B5563",
    marginTop: 16,
    width: "90%",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 70,
    marginTop: 36,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  countryCode: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 22,
    color: "#111827",
  },

  phoneIcon: {
    fontSize: 20,
  },

  terms: {
    marginTop: 18,
    fontSize: 13,
    lineHeight: 22,
    color: "#9CA3AF",
  },

  button: {
    backgroundColor: "#E88992",
    height: 65,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 45,
  },

  buttonActive: {
    backgroundColor: "#8B1A1A",
  },

  buttonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
});