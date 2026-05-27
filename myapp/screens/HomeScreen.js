import React from "react";

import {
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/Header";
import OfferCard from "../components/OfferCard";
import QuickActions from "../components/QuickActions";
import LoanCard from "../components/LoanCard";
import CibilCard from "../components/CibilCard";
import ReferBanner from "../components/ReferBanner";
import NewsCard from "../components/NewsCard";
import WhySvakarmaCard from "../components/WhySvakarmaCard";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header />

        {/* User */}
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              RM
            </Text>
          </View>

          <View>
            <Text style={styles.greeting}>
              Namaste,
            </Text>

            <Text style={styles.username}>
              Rajesh Kumar Mehta
            </Text>

            <Text style={styles.company}>
              Mehta Enterprises · Pune, Maharashtra
            </Text>
          </View>
        </View>

        <OfferCard />

        <QuickActions />
        <LoanCard />

        <CibilCard />
        <ReferBanner />

        <Text style={styles.sectionTitle}>
          News & Insights
        </Text>

        <NewsCard
          category="MSME"
          title="Government launches new MSME financing scheme for manufacturing units"
        />

        <NewsCard
          category="FINTECH"
          title="Digital lending adoption among small businesses rises 38%"
        />

        <WhySvakarmaCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 120,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E60012",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 20,
  },

  greeting: {
    color: "#6B7280",
    fontSize: 14,
  },

  username: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 2,
  },

  company: {
    color: "#6B7280",
    marginTop: 2,
    fontSize: 13,
  },
  sectionTitle: {
  fontSize: 28,
  fontWeight: "700",
  color: "#111827",
  marginBottom: 18,
},
});