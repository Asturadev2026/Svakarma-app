import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { applicationService } from '../services/applicationService';
import { StepBar } from './ReferencesScreen';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function SignAgreementScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const applicationId = route.params?.applicationId;

  const [kfs, setKfs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await applicationService.getKfs(applicationId);
        if (res?.success) setKfs(res.data);
      } catch (e) {
        Alert.alert('Error', e.message || 'Could not load the agreement.');
      } finally {
        setLoading(false);
      }
    })();
  }, [applicationId]);

  const esign = async () => {
    if (signing) return;
    setSigning(true);
    try {
      const res = await applicationService.esign(applicationId);
      if (res?.success && res.disbursement) {
        navigation.navigate('Disbursed', { applicationId, disbursement: res.disbursement, loanNumber: res.loanNumber });
      } else {
        throw new Error(res?.message || 'e-Sign failed.');
      }
    } catch (e) {
      Alert.alert('e-Sign failed', e.message || 'Please try again.');
    } finally {
      setSigning(false);
    }
  };

  if (loading || !kfs) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#8B1A1A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} color="#8B1A1A" /></TouchableOpacity>
        <Text style={styles.appBarTitle}>Sign Agreement</Text>
        <View style={{ width: 22 }} />
      </View>
      <StepBar step={2} />

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Aadhaar e-Sign</Text>
        <Text style={styles.subtitle}>Legally binding digital signature. No physical paperwork.</Text>

        <View style={styles.kfsCard}>
          <View style={styles.kfsHead}>
            <Feather name="file-text" size={18} color="#8B1A1A" />
            <Text style={styles.kfsTitle}>Loan Agreement &amp; KFS</Text>
          </View>
          <Row label="Borrower" value={kfs.borrower} />
          <Row label="PAN" value={kfs.pan || '—'} />
          <Row label="Loan Amount" value={fmtINR(kfs.amount)} />
          <Row label="Interest Rate" value={`${kfs.rate}% p.a. (reducing)`} />
          <Row label="Tenor" value={`${kfs.tenorMonths} months`} />
          <Row label="EMI" value={fmtINR(kfs.emi)} />
          <Row label="APR (RBI KFS)" value={`${kfs.apr}%`} />
          <Row label="Cooling-off period" value={`${kfs.coolingOffDays} days`} last />
        </View>

        <TouchableOpacity style={styles.downloadBtn} onPress={() => Alert.alert('Key Fact Statement', 'KFS download is mocked in this build.')}>
          <Feather name="download" size={16} color="#374151" />
          <Text style={styles.downloadText}>Download Key Fact Statement</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.cta, signing && { opacity: 0.6 }]} onPress={esign} disabled={signing}>
          <Feather name="edit-3" size={18} color="#FFF" />
          <Text style={styles.ctaText}>{signing ? 'Signing &amp; disbursing…' : 'e-Sign with Aadhaar'}</Text>
        </TouchableOpacity>
        <Text style={styles.note}>OTP sent to your Aadhaar-registered mobile (mocked).</Text>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  center: { justifyContent: 'center', alignItems: 'center' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  body: { padding: 16, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6, marginBottom: 16, lineHeight: 20 },
  kfsCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18 },
  kfsHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, paddingBottom: 8 },
  kfsTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowLabel: { color: '#6B7280', fontSize: 14 },
  rowVal: { color: '#1a1a1a', fontSize: 14, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFF', borderRadius: 14, height: 48, marginTop: 14 },
  downloadText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  cta: { flexDirection: 'row', gap: 10, backgroundColor: '#8B1A1A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  note: { color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 10 },
});
