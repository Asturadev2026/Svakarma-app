import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { applicationService } from '../services/applicationService';

const RELATIONS = ['Supplier', 'Customer', 'Friend', 'Family'];
const emptyRef = () => ({ name: '', phone: '', relationship: 'Supplier' });

export default function ReferencesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const applicationId = route.params?.applicationId;

  const [refs, setRefs] = useState([emptyRef(), emptyRef()]);
  const [addGuarantor, setAddGuarantor] = useState(false);
  const [guarantor, setGuarantor] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const setRef = (i, patch) => setRefs((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const valid = refs.every((r) => r.name.trim() && r.phone.trim().length === 10);

  const submit = async () => {
    if (!valid) { Alert.alert('Incomplete', 'Add a name and 10-digit mobile for both references.'); return; }
    setSaving(true);
    try {
      const payload = { references: refs };
      if (addGuarantor && guarantor.name.trim() && guarantor.phone.trim().length === 10) payload.guarantor = guarantor;
      const res = await applicationService.saveReferences(applicationId, payload);
      if (res?.success) navigation.navigate('DisbursalAccount', { applicationId });
      else throw new Error(res?.message || 'Could not save references.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not save references.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} color="#8B1A1A" /></TouchableOpacity>
        <Text style={styles.appBarTitle}>References</Text>
        <View style={{ width: 22 }} />
      </View>
      <StepBar step={1} />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add 2 references</Text>
        <Text style={styles.subtitle}>People who know your business — a supplier, customer, or peer entrepreneur.</Text>

        {refs.map((r, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardLabel}>REFERENCE {i + 1}</Text>
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

        <TouchableOpacity style={styles.guarantorCard} onPress={() => setAddGuarantor((v) => !v)} activeOpacity={0.85}>
          <Feather name={addGuarantor ? 'check-square' : 'square'} size={20} color="#8B1A1A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.guarantorTitle}>Add a guarantor (optional)</Text>
            <Text style={styles.guarantorSub}>Get a better rate with a co-applicant or guarantor</Text>
          </View>
        </TouchableOpacity>

        {addGuarantor && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>GUARANTOR</Text>
            <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#9CA3AF"
              value={guarantor.name} onChangeText={(t) => setGuarantor((g) => ({ ...g, name: t }))} />
            <View style={styles.phoneRow}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput style={styles.phoneInput} placeholder="10-digit mobile" placeholderTextColor="#9CA3AF"
                keyboardType="number-pad" maxLength={10} value={guarantor.phone}
                onChangeText={(t) => setGuarantor((g) => ({ ...g, phone: t.replace(/[^0-9]/g, '') }))} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.cta, (!valid || saving) && { opacity: 0.6 }]} onPress={submit} disabled={!valid || saving}>
          <Text style={styles.ctaText}>{saving ? 'Saving…' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function StepBar({ step }) {
  // 4 steps: References · Bank · Sign · Done
  return (
    <View style={styles.stepBar}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.stepSeg, i <= step && styles.stepSegActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  stepBar: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  stepSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  stepSegActive: { backgroundColor: '#8B1A1A' },
  body: { padding: 16, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6, marginBottom: 16, lineHeight: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14 },
  cardLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, color: '#1a1a1a', marginBottom: 10 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, height: 48, marginBottom: 12 },
  prefix: { paddingHorizontal: 12, color: '#374151', fontWeight: '700', borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  phoneInput: { flex: 1, paddingHorizontal: 12, fontSize: 15, color: '#1a1a1a' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#F3F4F6' },
  pillActive: { backgroundColor: '#8B1A1A' },
  pillText: { fontWeight: '600', color: '#374151', fontSize: 13 },
  pillTextActive: { color: '#FFF' },
  guarantorCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14 },
  guarantorTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  guarantorSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  cta: { backgroundColor: '#8B1A1A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
