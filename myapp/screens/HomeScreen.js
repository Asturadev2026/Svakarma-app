import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

import Header from "../components/Header";
import OfferCard from "../components/OfferCard";
import QuickActions from "../components/QuickActions";
import LoanCard from "../components/LoanCard";
import CibilCard from "../components/CibilCard";
import ReferBanner from "../components/ReferBanner";
import NewsCard from "../components/NewsCard";
import WhySvakarmaCard from "../components/WhySvakarmaCard";

export default function HomeScreen() {
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const [cibil, setCibil] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const fetchData = async () => {
        try {
          const [profileRes, loansRes, cibilRes] = await Promise.all([
            api.get('/profile'),
            api.get('/loans'),
            api.get('/cibil')
          ]);
          if (active) {
            if (profileRes.success) setProfile(profileRes.data);
            if (loansRes.success) setLoans(loansRes.data);
            if (cibilRes.success) setCibil(cibilRes.data);
          }
        } catch (err) {
          console.warn('[HOME] Failed to fetch dashboard data:', err.message);
        } finally {
          if (active) setLoading(false);
        }
      };
      fetchData();
      return () => {
        active = false;
      };
    }, [])
  );

  const personal = profile?.personalDetails;
  const business = profile?.businessDetails;

  const displayName = personal?.fullName && personal.fullName !== 'Complete Your Profile' 
    ? personal.fullName 
    : 'Complete Your Profile';

  const displayCompany = business?.businessName 
    ? business.businessName 
    : 'Complete Your Profile';

  const displayLocation = business?.city && business?.state
    ? `${business.city}, ${business.state}`
    : (business?.location ? business.location : 'Location Pending');

  const getInitials = (name) => {
    if (!name || name === 'Complete Your Profile') return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0] ? parts[0][0].toUpperCase() : "?";
  };

  const initials = getInitials(displayName);
  const activeLoan = loans && loans.length > 0 ? loans[0] : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#8B1A1A" size="large" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            {/* User */}
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {initials}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>
                  Namaste,
                </Text>

                <Text style={styles.username} numberOfLines={1}>
                  {displayName}
                </Text>

                <Text style={styles.company} numberOfLines={1}>
                  {displayCompany} · {displayLocation}
                </Text>
              </View>
            </View>

            <OfferCard activeLoan={activeLoan} />

            <QuickActions />
            <LoanCard activeLoan={activeLoan} />

            <CibilCard cibil={cibil} />

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
          </>
        )}
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
  loadingBox: {
    paddingVertical: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
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
    backgroundColor: "#8B1A1A",
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
    marginTop: 10,
  },
});