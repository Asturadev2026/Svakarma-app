import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { applicationService } from '../services/applicationService';
import { StepBar } from './ReferencesScreen';

export default function DisbursalAccountScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const applicationId = route.params?.applicationId;

  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(null); // { accountName, accountLast4, bank }
  const [proceeding, setProceeding] = useState(false);

  const canVerify = account.replace(/\s/g, '').length >= 6 && ifsc.trim().length >= 8;

  const verify = async () => {
    if (!canVerify || verifying) return;
    setVerifying(true);
    try {
      await applicationService.saveBankAccount(applicationId, { accountNumber: account, ifsc });
      const res = await applicationService.pennyDrop(applicationId);
      if (res?.success && res.verified) setVerified(res);
      else throw new Error(res?.message || 'Verification failed.');
    } catch (e) {
      Alert.alert('Verification failed', e.message || 'Please check the details and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const proceed = async () => {
    if (!verified || proceeding) return;
    setProceeding(true);
    try {
      const res = await applicationService.setupNach(applicationId);
      if (res?.success) navigation.navigate('SignAgreement', { applicationId });
      else throw new Error(res?.message || 'Could not set up mandate.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not set up mandate.');
    } finally {
      setProceeding(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} color="#8B1A1A" /></TouchableOpacity>
        <Text style={styles.appBarTitle}>Disbursal Account</Text>
        <View style={{ width: 22 }} />
      </View>
      <StepBar step={1} />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Where should we send the money?</Text>
        <Text style={styles.subtitle}>We verify with a ₹1 penny drop via NPCI. The amount comes back instantly.</Text>

        <Text style={styles.label}>ACCOUNT NUMBER</Text>
        <TextInput style={styles.input} placeholder="0123 4567 8901 2345" placeholderTextColor="#9CA3AF"
          keyboardType="number-pad" value={account} editable={!verified}
          onChangeText={(t) => setAccount(t.replace(/[^0-9]/g, ''))} />

        <Text style={styles.label}>IFSC CODE</Text>
        <TextInput style={styles.input} placeholder="HDFC0001234" placeholderTextColor="#9CA3AF"
          autoCapitalize="characters" value={ifsc} editable={!verified}
          onChangeText={(t) => setIfsc(t.toUpperCase())} />

        {!verified ? (
          <TouchableOpacity style={[styles.verifyBtn, (!canVerify || verifying) && { opacity: 0.5 }]} onPress={verify} disabled={!canVerify || verifying}>
            {verifying ? <ActivityIndicator size="small" color="#8B1A1A" />
              : <Text style={styles.verifyText}>Verify with ₹1 Penny Drop</Text>}
          </TouchableOpacity>
        ) : (
          <View style={styles.verifiedCard}>
            <Feather name="check-circle" size={20} color="#16A34A" />
            <View>
              <Text style={styles.verifiedName}>{verified.accountName}</Text>
              <Text style={styles.verifiedSub}>{verified.bank} · ••••{verified.accountLast4} · name matched</Text>
            </View>
          </View>
        )}

        <View style={styles.note}>
          <Feather name="shield" size={16} color="#8B1A1A" />
          <Text style={styles.noteText}>NACH e-mandate will be set up — EMIs auto-debited each month. You can cancel anytime via the app.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.cta, (!verified || proceeding) && { opacity: 0.5 }]} onPress={proceed} disabled={!verified || proceeding}>
          <Text style={styles.ctaText}>{proceeding ? 'Setting up mandate…' : 'Proceed to Sign'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  body: { padding: 16, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', lineHeight: 30 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 52, fontSize: 16, color: '#1a1a1a', marginBottom: 18 },
  verifyBtn: { borderWidth: 1.5, borderColor: '#8B1A1A', borderRadius: 14, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  verifyText: { color: '#8B1A1A', fontWeight: '700', fontSize: 15 },
  verifiedCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F0FDF4', borderColor: '#86EFAC', borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 4 },
  verifiedName: { fontSize: 15, fontWeight: '700', color: '#065F46' },
  verifiedSub: { fontSize: 12, color: '#15803D', marginTop: 2 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginTop: 18 },
  noteText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  cta: { backgroundColor: '#8B1A1A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
