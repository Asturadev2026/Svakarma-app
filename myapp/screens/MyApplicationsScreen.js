import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { applicationService } from '../services/applicationService';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// stage → { label, color, resumeScreen }
const STAGE = {
  verifying:    { label: 'Verification pending', color: '#1D4ED8', bg: '#EFF6FF', resume: 'Verification' },
  underwriting: { label: 'Ready for assessment', color: '#1D4ED8', bg: '#EFF6FF', resume: 'AIUnderwriting' },
  offer:        { label: 'Offer ready',          color: '#854D0E', bg: '#FEF9C3', resume: 'AIUnderwriting' },
  references:   { label: 'Add references',        color: '#854D0E', bg: '#FEF9C3', resume: 'References' },
  bank:         { label: 'Add bank account',      color: '#854D0E', bg: '#FEF9C3', resume: 'DisbursalAccount' },
  esign:        { label: 'Sign agreement',        color: '#854D0E', bg: '#FEF9C3', resume: 'SignAgreement' },
  disbursed:    { label: 'Disbursed',             color: '#065F46', bg: '#ECFDF5', resume: null },
  rejected:     { label: 'Not approved',          color: '#991B1B', bg: '#FEF2F2', resume: null },
  draft:        { label: 'Draft',                 color: '#6B7280', bg: '#F3F4F6', resume: 'Verification' },
};

export default function MyApplicationsScreen() {
  const navigation = useNavigation();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await applicationService.list();
      if (res?.success) setApps(res.data || []);
    } catch (e) {
      // empty state on failure
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = (app) => {
    const s = STAGE[app.stage] || STAGE.draft;
    if (!s.resume) { Alert.alert(app.purpose, `Status: ${s.label}`); return; }
    navigation.navigate(s.resume, { applicationId: app.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} color="#8B1A1A" /></TouchableOpacity>
        <Text style={styles.appBarTitle}>My Applications</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#8B1A1A" /></View>
      ) : apps.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No applications yet</Text>
          <Text style={styles.emptySub}>Apply for a loan from the Loans tab to get started.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#8B1A1A" />}
        >
          {apps.map((app) => {
            const s = STAGE[app.stage] || STAGE.draft;
            const amount = app.offer?.amount ?? app.requestedAmount;
            return (
              <View key={app.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.product}>{app.purpose}</Text>
                    <Text style={styles.date}>{fmtDate(app.createdAt)}</Text>
                  </View>
                  <Text style={styles.amount}>{fmtINR(amount)}</Text>
                </View>
                <View style={styles.cardBottom}>
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                  <TouchableOpacity onPress={() => open(app)}>
                    <Text style={styles.view}>{s.resume ? 'Resume ›' : 'View ›'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 6 },
  body: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  product: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  date: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  amount: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  view: { color: '#8B1A1A', fontWeight: '700', fontSize: 14 },
});
