import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { Feather } from "@expo/vector-icons";

export default function Header() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Right Icons */}
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={20} color="#111827" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Feather name="bell" size={20} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  logo: {
    width: 140,
    height: 40,
  },

  rightSection: {
    flexDirection: "row",
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,

    elevation: 3,
  },

  icon: {
    fontSize: 18,
  },
});