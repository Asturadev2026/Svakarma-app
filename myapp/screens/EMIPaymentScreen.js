import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { paymentService } from '../services/paymentService';

const formatINR = (paise) =>
  '₹' + (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/**
 * Razorpay-style EMI checkout.
 *
 * Flow mirrors a real gateway integration end-to-end:
 *   1. create order on the backend
 *   2. "pay" -> obtain { paymentId, signature }
 *        - mock provider: simulated on the backend
 *        - live provider: real Razorpay checkout would return these
 *   3. verify the signature on the backend -> EMI recorded, schedule advanced
 */
export default function EMIPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const loanId = route.params?.loanId;

  const [phase, setPhase] = useState('loading'); // loading | ready | processing | success | error
  const [order, setOrder] = useState(null);
  const [meta, setMeta] = useState(null); // { keyId, provider, canSimulate, loan }
  const [error, setError] = useState(null);
  const [nextDueDate, setNextDueDate] = useState(null);

  const createOrder = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      const res = await paymentService.createEmiOrder(loanId);
      if (res?.success) {
        setOrder(res.order);
        setMeta({ keyId: res.keyId, provider: res.provider, canSimulate: res.canSimulate, loan: res.loan });
        setPhase('ready');
      } else {
        throw new Error(res?.message || 'Could not create payment order.');
      }
    } catch (e) {
      setError(e.message || 'Could not start payment.');
      setPhase('error');
    }
  }, [loanId]);

  useEffect(() => {
    createOrder();
  }, [createOrder]);

  const handlePay = async () => {
    if (!order) return;
    setPhase('processing');
    try {
      let paymentId, signature;

      if (meta?.canSimulate) {
        // MOCK provider: backend simulates a successful gateway checkout.
        const sim = await paymentService.mockPay(order.id);
        paymentId = sim.paymentId;
        signature = sim.signature;
      } else {
        // LIVE provider: this is where the real Razorpay checkout SDK opens and
        // returns razorpay_payment_id + razorpay_signature. Wire it here when
        // going live (e.g. react-native-razorpay) using meta.keyId + order.id.
        throw new Error('Live Razorpay checkout is not wired in this build.');
      }

      const verifyRes = await paymentService.verify({ orderId: order.id, paymentId, signature });
      if (verifyRes?.success) {
        setNextDueDate(verifyRes?.payment ? meta?.loan?.nextDueDate : null);
        setPhase('success');
      } else {
        throw new Error(verifyRes?.message || 'Verification failed.');
      }
    } catch (e) {
      setError(e.message || 'Payment failed.');
      setPhase('error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Pay EMI</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {phase === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#8B1A1A" />
            <Text style={styles.muted}>Creating secure payment order…</Text>
          </View>
        )}

        {phase === 'error' && (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.muted}>{error}</Text>
            <TouchableOpacity style={styles.payButton} onPress={createOrder}>
              <Text style={styles.payButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {(phase === 'ready' || phase === 'processing') && order && (
          <View style={styles.sheet}>
            {/* Razorpay-style checkout header */}
            <View style={styles.merchantRow}>
              <View style={styles.logo}><Text style={styles.logoText}>S</Text></View>
              <View>
                <Text style={styles.merchant}>Svakarma Finance</Text>
                <Text style={styles.muted}>EMI repayment</Text>
              </View>
            </View>

            <View style={styles.amountBox}>
              <Text style={styles.muted}>Amount due</Text>
              <Text style={styles.amount}>{formatINR(order.amount)}</Text>
            </View>

            <Row label="Order ID" value={order.id} mono />
            {meta?.loan?.loanNumber ? <Row label="Loan" value={meta.loan.loanNumber} /> : null}
            <Row label="Gateway" value={meta?.provider === 'mock' ? 'Razorpay (mock)' : 'Razorpay'} />

            {meta?.provider === 'mock' && (
              <View style={styles.demoNote}>
                <Text style={styles.demoNoteLabel}>DEMO MODE</Text>
                <Text style={styles.demoNoteText}>
                  No real charge. The backend simulates a signed payment and verifies it exactly as it
                  would with live Razorpay keys.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.payButton, phase === 'processing' && styles.payButtonDisabled]}
              onPress={handlePay}
              disabled={phase === 'processing'}
            >
              <Text style={styles.payButtonText}>
                {phase === 'processing' ? 'Processing…' : `Pay ${formatINR(order.amount)}`}
              </Text>
            </TouchableOpacity>
            <Text style={styles.secure}>🔒 Secured payment · HMAC-SHA256 signature verified</Text>
          </View>
        )}

        {phase === 'success' && (
          <View style={styles.center}>
            <View style={styles.successCircle}><Text style={styles.successTick}>✓</Text></View>
            <Text style={styles.successTitle}>Payment successful</Text>
            <Text style={styles.muted}>Your EMI of {order ? formatINR(order.amount) : ''} has been recorded.</Text>
            {nextDueDate ? (
              <Text style={styles.muted}>Next EMI due: {formatDate(nextDueDate)}</Text>
            ) : null}
            <TouchableOpacity style={styles.payButton} onPress={() => navigation.goBack()}>
              <Text style={styles.payButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, mono }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  appBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  back: { color: '#8B1A1A', fontSize: 16, fontWeight: '600', width: 48 },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  body: { padding: 16, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  muted: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
  sheet: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, gap: 4 },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logo: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#8B1A1A', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  merchant: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  amountBox: { alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F0F0F0', marginBottom: 12 },
  amount: { fontSize: 34, fontWeight: '800', color: '#1a1a1a', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { color: '#6B7280', fontSize: 14 },
  rowValue: { color: '#1a1a1a', fontSize: 14, fontWeight: '600', maxWidth: '60%' },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  demoNote: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  demoNoteLabel: { fontSize: 11, fontWeight: '700', color: '#C2410C', marginBottom: 4, letterSpacing: 0.5 },
  demoNoteText: { fontSize: 13, color: '#7C2D12', lineHeight: 18 },
  payButton: { backgroundColor: '#8B1A1A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 18, paddingHorizontal: 24 },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secure: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 10 },
  successCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#10B981' },
  successTick: { fontSize: 44, color: '#10B981', fontWeight: '800' },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#065F46', marginTop: 6 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#991B1B' },
});
