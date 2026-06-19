import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { applicationService } from '../services/applicationService';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function ApplicationFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { productKey, amount, tenorMonths } = route.params || {};

  const [product, setProduct] = useState(route.params?.product || null);
  const [loading, setLoading] = useState(!route.params?.product);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) return;
    (async () => {
      try {
        const res = await productService.getProduct(productKey);
        if (res?.success) setProduct(res.data);
      } catch (e) {
        Alert.alert('Error', e.message || 'Could not load the form.');
      } finally {
        setLoading(false);
      }
    })();
  }, [productKey, product]);

  const fields = product?.formFields || [];
  const setVal = (key, v) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async () => {
    // Validate required fields.
    const next = {};
    for (const f of fields) {
      if (f.required && !String(values[f.key] ?? '').trim()) next[f.key] = 'Required';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      Alert.alert('Incomplete', 'Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await applicationService.create({ productKey, amount, tenorMonths, formData: values });
      if (res?.success && res.application) {
        navigation.navigate('Verification', { applicationId: res.application.id });
      } else {
        throw new Error(res?.message || 'Could not start the application.');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not start the application.');
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
        <Text style={styles.appBarTitle}>Application</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Selected product summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryIcon}>{product.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryName}>{product.name}</Text>
            <Text style={styles.summaryMeta}>{fmtINR(amount)} · {tenorMonths} months</Text>
          </View>
        </View>

        <Text style={styles.heading}>Tell us about your {product.category.toLowerCase()} need</Text>
        <Text style={styles.sub}>These details are specific to the {product.name} and help us tailor your offer.</Text>

        {fields.map((f) => (
          <View key={f.key} style={styles.field}>
            <Text style={styles.label}>
              {f.label}{f.required ? <Text style={styles.req}> *</Text> : null}
            </Text>

            {f.type === 'select' ? (
              <View style={styles.pillRow}>
                {f.options.map((opt) => (
                  <TouchableOpacity key={opt} style={[styles.pill, values[f.key] === opt && styles.pillActive]} onPress={() => setVal(f.key, opt)}>
                    <Text style={[styles.pillText, values[f.key] === opt && styles.pillTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={[styles.input, errors[f.key] && styles.inputError]}
                placeholder={f.placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType={f.type === 'number' ? 'numeric' : 'default'}
                value={values[f.key] || ''}
                onChangeText={(t) => setVal(f.key, f.type === 'number' ? t.replace(/[^0-9]/g, '') : t)}
              />
            )}
            {errors[f.key] && <Text style={styles.errorText}>{errors[f.key]}</Text>}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.cta, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting}>
          <Text style={styles.ctaText}>{submitting ? 'Submitting…' : 'Submit & Continue'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  center: { justifyContent: 'center', alignItems: 'center' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  body: { padding: 16, paddingBottom: 24 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 18 },
  summaryIcon: { fontSize: 30 },
  summaryName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  summaryMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  heading: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  sub: { fontSize: 13, color: '#6B7280', marginTop: 6, marginBottom: 16, lineHeight: 19 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  req: { color: '#DC2626' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 50, fontSize: 15, color: '#1a1a1a' },
  inputError: { borderColor: '#FCA5A5' },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: 4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 11, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB' },
  pillActive: { backgroundColor: '#8B1A1A', borderColor: '#8B1A1A' },
  pillText: { fontWeight: '600', color: '#374151', fontSize: 13 },
  pillTextActive: { color: '#FFF' },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  cta: { backgroundColor: '#8B1A1A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
