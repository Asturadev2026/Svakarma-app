import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { applicationService } from '../services/applicationService';

const STEPS = [
  'Aggregating verified data…',
  'Running cash-flow model on 12-month bank data…',
  'Cross-checking GST vs declared turnover…',
  'Pricing risk against bureau & MSME profile…',
  'Finalizing your offer…',
];
const STEP_MS = 700;
const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function AIUnderwritingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const applicationId = route.params?.applicationId;

  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState('processing'); // processing | offer | rejected | error
  const [offer, setOffer] = useState(null);
  const [reason, setReason] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const apiDone = useRef(null); // holds the api result once it arrives

  const acceptOffer = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      const res = await applicationService.accept(applicationId);
      if (res?.success) navigation.navigate('References', { applicationId });
      else throw new Error(res?.message || 'Could not continue.');
    } catch (e) {
      setAccepting(false);
      Alert.alert('Error', e.message || 'Could not continue.');
    }
  };

  useEffect(() => {
    let cancelled = false;

    // Kick off the real underwriting call immediately.
    applicationService.underwrite(applicationId)
      .then((res) => { apiDone.current = res?.success ? res : { error: res?.message || 'Underwriting failed' }; })
      .catch((e) => { apiDone.current = { error: e.message || 'Underwriting failed' }; });

    // Advance the step animation; reveal the result only after the last step.
    let i = 0;
    const tick = setInterval(() => {
      i += 1;
      if (cancelled) return;
      if (i < STEPS.length) {
        setStepIdx(i);
      } else {
        clearInterval(tick);
        const settle = setInterval(() => {
          if (apiDone.current) {
            clearInterval(settle);
            const r = apiDone.current;
            if (r.error) { setPhase('error'); setReason(r.error); }
            else if (r.rejected) { setPhase('rejected'); setReason(r.reason); }
            else { setOffer(r.offer); setPhase('offer'); }
          }
        }, 200);
      }
    }, STEP_MS);

    return () => { cancelled = true; clearInterval(tick); };
  }, [applicationId]);

  if (phase === 'processing') {
    return (
      <SafeAreaView style={styles.darkContainer}>
        <View style={styles.center}>
          <View style={styles.brainOuter}><View style={styles.brainInner}><Feather name="cpu" size={32} color="#FFF" /></View></View>
          <Text style={styles.engineTag}>AI UNDERWRITING</Text>
          <Text style={styles.buildTitle}>Building your offer</Text>
          <View style={styles.steps}>
            {STEPS.map((s, idx) => (
              <View key={idx} style={styles.stepRow}>
                {idx < stepIdx
                  ? <Feather name="check-circle" size={16} color="#16A34A" />
                  : idx === stepIdx
                    ? <ActivityIndicator size="small" color="#8B1A1A" />
                    : <Feather name="circle" size={16} color="#444" />}
                <Text style={[styles.stepText, idx <= stepIdx && styles.stepActive]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'offer' && offer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultBody}>
          <View style={styles.successCircle}><Feather name="check" size={40} color="#16A34A" /></View>
          <Text style={styles.approvedLabel}>OFFER APPROVED</Text>
          <Text style={styles.approvedAmt}>{fmtINR(offer.amount)}</Text>
          <Text style={styles.approvedSub}>at {offer.rate}% p.a. (reducing) · {offer.tenorMonths} months</Text>

          <View style={styles.offerCard}>
            <Row label="Monthly EMI" value={fmtINR(offer.emi)} strong />
            <Row label="APR (RBI KFS)" value={`${offer.apr}%`} />
            <Row label="Total interest" value={fmtINR(offer.totalInterest)} />
            <Row label="Total payable" value={fmtINR(offer.totalPayable)} />
            <Row label="Processing fee" value={`${offer.processingFeePct}%`} />
          </View>

          <TouchableOpacity style={[styles.cta, accepting && { opacity: 0.6 }]} onPress={acceptOffer} disabled={accepting}>
            <Text style={styles.ctaText}>{accepting ? 'Continuing…' : 'Accept & Continue →'}</Text>
          </TouchableOpacity>
          <Text style={styles.note}>Next: references, bank account, and Aadhaar e-Sign.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // rejected / error
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.resultBody}>
        <View style={[styles.successCircle, { backgroundColor: '#FEF2F2', borderColor: '#DC2626' }]}>
          <Feather name="x" size={40} color="#DC2626" />
        </View>
        <Text style={[styles.approvedLabel, { color: '#991B1B' }]}>
          {phase === 'rejected' ? 'NOT APPROVED' : 'SOMETHING WENT WRONG'}
        </Text>
        <Text style={styles.rejectReason}>{reason}</Text>
        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.ctaText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowVal, strong && { fontSize: 18, color: '#8B1A1A' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  darkContainer: { flex: 1, backgroundColor: '#0F0F10' },
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  brainOuter: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(139,26,26,0.25)', alignItems: 'center', justifyContent: 'center' },
  brainInner: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#8B1A1A', alignItems: 'center', justifyContent: 'center' },
  engineTag: { color: '#8B1A1A', fontSize: 12, fontWeight: '800', letterSpacing: 2, marginTop: 28 },
  buildTitle: { color: '#FFF', fontSize: 26, fontWeight: '800', marginTop: 8, marginBottom: 24 },
  steps: { alignSelf: 'stretch', gap: 14, paddingHorizontal: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepText: { color: '#555', fontSize: 14, flex: 1 },
  stepActive: { color: '#E5E7EB' },
  resultBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#ECFDF5', borderWidth: 2, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  approvedLabel: { color: '#065F46', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginTop: 16 },
  approvedAmt: { color: '#1a1a1a', fontSize: 40, fontWeight: '800', marginTop: 4 },
  approvedSub: { color: '#6B7280', fontSize: 14, marginTop: 4, textAlign: 'center' },
  offerCard: { alignSelf: 'stretch', backgroundColor: '#FFF', borderRadius: 18, padding: 18, marginTop: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { color: '#6B7280', fontSize: 14 },
  rowVal: { color: '#1a1a1a', fontSize: 14, fontWeight: '700' },
  cta: { alignSelf: 'stretch', backgroundColor: '#8B1A1A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  note: { color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 12 },
  rejectReason: { color: '#6B7280', fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 21 },
});
