import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

export default function ReferBanner() {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.getParent()?.navigate("Refer");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <View style={styles.left}>
        <Text style={styles.title}>
          Refer & Earn
        </Text>

        <Text style={styles.subtitle}>
          Earn ₹1,000 for every successful
          business referral.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            Refer Now
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.icon}>
        🎁
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF4F4",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
  },

  button: {
    backgroundColor: "#FF001E",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 18,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  icon: {
    fontSize: 52,
  },
});