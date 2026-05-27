import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function EMICalculatorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        EMI Calculator Screen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },

  text: {
    fontSize: 24,
    fontWeight: "700",
  },
});