import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { applicationService } from '../services/applicationService';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// Reducing-balance EMI — mirrors the backend so the on-screen estimate matches.
function emiOf(amount, annualRatePct, n) {
  const r = annualRatePct / 12 / 100;
  const e = r === 0 ? amount / n : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(e);
}

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const productKey = route.params?.productKey || 'samridhi';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [tenor, setTenor] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await productService.getProduct(productKey);
        if (res?.success && res.data) {
          setProduct(res.data);
          setAmount(res.data.defaultAmount);
          setTenor(res.data.defaultTenor);
        }
      } catch (e) {
        Alert.alert('Error', e.message || 'Could not load product.');
      } finally {
        setLoading(false);
      }
    })();
  }, [productKey]);

  const step = useMemo(() => {
    if (!product) return 100000;
    const span = product.maxAmount - product.minAmount;
    return Math.max(50000, Math.round(span / 10 / 50000) * 50000);
  }, [product]);

  const indicative = useMemo(() => {
    if (!product) return null;
    const rate = product.maxRate; // conservative estimate until underwriting prices it
    const emi = emiOf(amount, rate, tenor);
    const totalPayable = emi * tenor;
    return { rate, emi, totalPayable, totalInterest: totalPayable - amount };
  }, [product, amount, tenor]);

  const changeAmount = (delta) => {
    if (!product) return;
    const next = Math.min(product.maxAmount, Math.max(product.minAmount, amount + delta));
    setAmount(next);
  };

  const apply = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await applicationService.create({ productKey, amount, tenorMonths: tenor });
      if (res?.success && res.application) {
        navigation.navigate('Verification', { applicationId: res.application.id });
      } else {
        throw new Error(res?.message || 'Could not start application.');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not start application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !product) {
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
        <Text style={styles.appBarTitle}>{product.name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroCat}>{product.category.toUpperCase()}</Text>
          <Text style={styles.heroTagline}>{product.tagline}</Text>
          <View style={styles.heroRow}>
            <View><Text style={styles.heroLabel}>RANGE</Text><Text style={styles.heroVal}>{fmtINR(product.minAmount)} – {fmtINR(product.maxAmount)}</Text></View>
            <View><Text style={styles.heroLabel}>RATE</Text><Text style={styles.heroVal}>{product.minRate}–{product.maxRate}% p.a.</Text></View>
            <View><Text style={styles.heroLabel}>TENOR</Text><Text style={styles.heroVal}>{Math.round(product.minTenor/12)}–{Math.round(product.maxTenor/12)} yrs</Text></View>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardLabel}>LOAN AMOUNT</Text>
            <Text style={styles.cardHint}>{fmtINR(product.minAmount)} – {fmtINR(product.maxAmount)}</Text>
          </View>
          <Text style={styles.amount}>{fmtINR(amount)}</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => changeAmount(-step)}><Feather name="minus" size={20} color="#8B1A1A" /></TouchableOpacity>
            <Text style={styles.stepHint}>± {fmtINR(step)}</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => changeAmount(step)}><Feather name="plus" size={20} color="#8B1A1A" /></TouchableOpacity>
          </View>
        </View>

        {/* Tenor */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TENOR</Text>
          <View style={styles.pillRow}>
            {product.tenorOptions.map((t) => (
              <TouchableOpacity key={t} style={[styles.pill, tenor === t && styles.pillActive]} onPress={() => setTenor(t)}>
                <Text style={[styles.pillText, tenor === t && styles.pillTextActive]}>{t}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Indicative EMI */}
        <View style={styles.emiCard}>
          <Text style={styles.emiLabel}>INDICATIVE EMI</Text>
          <Text style={styles.emiValue}>{fmtINR(indicative.emi)}</Text>
          <Text style={styles.emiSub}>at up to {indicative.rate}% reducing · {tenor} months</Text>
          <View style={styles.emiSplit}>
            <View><Text style={styles.emiSplitLabel}>Total Interest</Text><Text style={styles.emiSplitVal}>{fmtINR(indicative.totalInterest)}</Text></View>
            <View><Text style={styles.emiSplitLabel}>Total Payable</Text><Text style={styles.emiSplitVal}>{fmtINR(indicative.totalPayable)}</Text></View>
          </View>
        </View>

        <Text style={styles.disclaimer}>Final rate and amount depend on AI credit assessment. Processing fee up to {product.processingFeePct}% applicable.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.applyBtn, submitting && { opacity: 0.6 }]} onPress={apply} disabled={submitting}>
          <Text style={styles.applyText}>{submitting ? 'Starting…' : 'Apply Now'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  center: { justifyContent: 'center', alignItems: 'center' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  body: { padding: 16, paddingBottom: 20 },
  hero: { backgroundColor: '#8B1A1A', borderRadius: 20, padding: 20, marginBottom: 16 },
  heroCat: { color: '#FFD7DC', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroTagline: { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 8, lineHeight: 22 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 14 },
  heroLabel: { color: '#FFD7DC', fontSize: 10, fontWeight: '700' },
  heroVal: { color: '#FFF', fontSize: 13, fontWeight: '700', marginTop: 2 },
  card: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, marginBottom: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  cardHint: { fontSize: 12, color: '#9CA3AF' },
  amount: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', marginVertical: 10 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 48, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#8B1A1A', alignItems: 'center', justifyContent: 'center' },
  stepHint: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  pill: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: '#F3F4F6' },
  pillActive: { backgroundColor: '#8B1A1A' },
  pillText: { fontWeight: '700', color: '#374151' },
  pillTextActive: { color: '#FFF' },
  emiCard: { backgroundColor: '#1a1a1a', borderRadius: 18, padding: 20, marginBottom: 14 },
  emiLabel: { color: '#F59E9E', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  emiValue: { color: '#FFF', fontSize: 30, fontWeight: '800', marginTop: 4 },
  emiSub: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  emiSplit: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: 14 },
  emiSplitLabel: { color: '#9CA3AF', fontSize: 12 },
  emiSplitVal: { color: '#FFF', fontSize: 15, fontWeight: '700', marginTop: 2 },
  disclaimer: { fontSize: 12, color: '#9CA3AF', lineHeight: 18 },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  applyBtn: { backgroundColor: '#8B1A1A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  applyText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
