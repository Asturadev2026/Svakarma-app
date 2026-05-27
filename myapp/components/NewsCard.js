import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function NewsCard({
  title,
  category,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
    >
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>
          NEWS
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>
          {category}
        </Text>

        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.readMore}>
          Read More →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 18,
  },

  imagePlaceholder: {
    height: 160,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  imageText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6B7280",
  },

  content: {
    padding: 18,
  },

  category: {
    color: "#FF001E",
    fontWeight: "700",
    marginBottom: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 28,
  },

  readMore: {
    marginTop: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
});