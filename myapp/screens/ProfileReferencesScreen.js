import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

const RELATIONS = ['Supplier', 'Customer', 'Friend', 'Family'];
const emptyRef = () => ({ name: '', phone: '', relationship: 'Supplier' });

export default function ProfileReferencesScreen() {
  const navigation = useNavigation();
  const [refs, setRefs] = useState([emptyRef(), emptyRef()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/profile');
        const existing = res?.data?.references || [];
        if (existing.length > 0) {
          const filled = existing.slice(0, 4).map((r) => ({
            name: r.name || '', phone: r.phone || '', relationship: r.relationship || 'Supplier',
          }));
          while (filled.length < 2) filled.push(emptyRef());
          setRefs(filled);
        }
      } catch (e) {
        // start with two empty rows
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setRef = (i, patch) => setRefs((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRefs((prev) => (prev.length >= 4 ? prev : [...prev, emptyRef()]));
  const removeRow = (i) => setRefs((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));

  const valid = refs.filter((r) => r.name.trim() && r.phone.trim().length === 10).length >= 2;

  const save = async () => {
    if (!valid) { Alert.alert('Add 2 references', 'Each needs a name and a 10-digit mobile.'); return; }
    setSaving(true);
    try {
      const references = refs.filter((r) => r.name.trim() && r.phone.trim().length === 10);
      const res = await api.post('/profile/references', { references });
      if (res?.success) {
        Alert.alert('Saved!', 'Your references have been saved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        throw new Error(res?.message || 'Could not save references.');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not save references.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <Text style={styles.appBarTitle}>References</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Add at least 2 people who know your business — a supplier, customer, or peer entrepreneur.</Text>

        {refs.map((r, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardLabel}>REFERENCE {i + 1}</Text>
              {refs.length > 2 && (
                <TouchableOpacity onPress={() => removeRow(i)}><Feather name="trash-2" size={16} color="#9CA3AF" /></TouchableOpacity>
              )}
            </View>
            <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#9CA3AF"
              value={r.name} onChangeText={(t) => setRef(i, { name: t })} />
            <View style={styles.phoneRow}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput style={styles.phoneInput} placeholder="10-digit mobile" placeholderTextColor="#9CA3AF"
                keyboardType="number-pad" maxLength={10} value={r.phone}
                onChangeText={(t) => setRef(i, { phone: t.replace(/[^0-9]/g, '') })} />
            </View>
            <View style={styles.pillRow}>
              {RELATIONS.map((rel) => (
                <TouchableOpacity key={rel} style={[styles.pill, r.relationship === rel && styles.pillActive]} onPress={() => setRef(i, { relationship: rel })}>
                  <Text style={[styles.pillText, r.relationship === rel && styles.pillTextActive]}>{rel}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {refs.length < 4 && (
          <TouchableOpacity style={styles.addRow} onPress={addRow}>
            <Feather name="plus" size={18} color="#8B1A1A" />
            <Text style={styles.addText}>Add another reference</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.cta, (!valid || saving) && { opacity: 0.6 }]} onPress={save} disabled={!valid || saving}>
          <Text style={styles.ctaText}>{saving ? 'Saving…' : 'Save references'}</Text>
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
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16, lineHeight: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, color: '#1a1a1a', marginBottom: 10 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, height: 48, marginBottom: 12 },
  prefix: { paddingHorizontal: 12, color: '#374151', fontWeight: '700', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  phoneInput: { flex: 1, paddingHorizontal: 12, fontSize: 15, color: '#1a1a1a' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#F3F4F6' },
  pillActive: { backgroundColor: '#8B1A1A' },
  pillText: { fontWeight: '600', color: '#374151', fontSize: 13 },
  pillTextActive: { color: '#FFF' },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  addText: { color: '#8B1A1A', fontWeight: '700' },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  cta: { backgroundColor: '#8B1A1A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
