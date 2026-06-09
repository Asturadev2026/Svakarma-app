import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

export default function SplashScreen() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      {/* Top Red Line */}
      <View style={styles.topLine} />

      {/* Logo */}
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Small Red Divider */}
      <View style={styles.divider} />

      {/* Heading */}
      <Text style={styles.heading}>
        Democratising opportunities{"\n"}for India's MSMEs
      </Text>

      {/* Subheading */}
      <Text style={styles.subheading}>
        Working capital · Machinery · Asset finance
      </Text>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGetStarted}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          Get Started →
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footer}>
        RBI REGISTERED NBFC · ISO 27001
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 24,
  },

  topLine: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 4,
    backgroundColor: "#D6001C",
  },

  logo: {
    width: 260,
    height: 260,
    marginTop: 120,
  },

  divider: {
    width: 50,
    height: 3,
    backgroundColor: "#D6001C",
    borderRadius: 10,
    marginBottom: 24,
  },

  heading: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 38,
  },

  subheading: {
    marginTop: 20,
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
  },

  button: {
    width: "100%",
    backgroundColor: "#8B1A1A",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 18,

    shadowColor: "#8B1A1A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,

    elevation: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },

  footer: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 20,
  },
});