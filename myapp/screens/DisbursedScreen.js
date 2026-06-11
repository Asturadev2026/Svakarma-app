import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function DisbursedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const d = route.params?.disbursement || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.check}><Feather name="check" size={46} color="#8B1A1A" /></View>
        <Text style={styles.label}>DISBURSED</Text>
        <Text style={styles.amount}>{fmtINR(d.amount || 0)}</Text>
        <Text style={styles.sub}>
          Sent to your account ending in {d.accountLast4 || '----'}.{'\n'}UTR: {d.utr || '—'}
        </Text>

        <View style={styles.emiCard}>
          <View style={styles.emiRow}>
            <Feather name="calendar" size={18} color="#FFD7DC" />
            <Text style={styles.emiLabel}>FIRST EMI</Text>
          </View>
          <View style={styles.emiBody}>
            <View>
              <Text style={styles.emiDueLabel}>Due on</Text>
              <Text style={styles.emiDate}>{fmtDate(d.firstEmiDate)}</Text>
            </View>
            <Text style={styles.emiAmt}>{fmtINR(d.emi || 0)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.ctaText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('MyApplications')}>
          <Text style={styles.secondaryText}>View my applications</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B1A1A' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  check: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  label: { color: '#FFD7DC', fontSize: 14, fontWeight: '800', letterSpacing: 2, marginTop: 24 },
  amount: { color: '#FFF', fontSize: 44, fontWeight: '800', marginTop: 6 },
  sub: { color: '#FCE7EA', fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  emiCard: { alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 18, marginTop: 32 },
  emiRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emiLabel: { color: '#FFD7DC', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  emiBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  emiDueLabel: { color: '#FCE7EA', fontSize: 12 },
  emiDate: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 2 },
  emiAmt: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  footer: { padding: 16 },
  cta: { backgroundColor: '#FFF', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#8B1A1A', fontSize: 16, fontWeight: '700' },
  secondary: { height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  secondaryText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
