import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { verificationService } from '../services/verificationService';

export default function VerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const applicationId = route.params?.applicationId;

  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // sourceType currently connecting
  const [connectingAll, setConnectingAll] = useState(false);

  const connected = sources.filter((s) => s.status === 'verified').length;
  const remaining = sources.length - connected;

  const load = useCallback(async () => {
    try {
      const res = await verificationService.getSources(applicationId);
      if (res?.success) setSources(res.sources || []);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not load verification.');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => { load(); }, [load]);

  const connectOne = async (sourceType) => {
    setBusy(sourceType);
    try {
      const res = await verificationService.connect(applicationId, sourceType);
      if (res?.success) setSources(res.summary.sources);
    } catch (e) {
      Alert.alert('Verification failed', e.message || 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const connectAll = async () => {
    setConnectingAll(true);
    try {
      const pending = sources.filter((s) => s.status !== 'verified');
      for (const s of pending) {
        setBusy(s.sourceType);
        const res = await verificationService.connect(applicationId, s.sourceType);
        if (res?.success) setSources(res.summary.sources);
        await new Promise((r) => setTimeout(r, 350)); // visible progressive connect
      }
    } catch (e) {
      Alert.alert('Verification failed', e.message || 'Please try again.');
    } finally {
      setBusy(null);
      setConnectingAll(false);
    }
  };

  const proceed = () => navigation.navigate('AIUnderwriting', { applicationId });

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
        <Text style={styles.appBarTitle}>Verification</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>AI assessment in <Text style={{ color: '#8B1A1A' }}>under 3 minutes</Text></Text>
        <Text style={styles.subtitle}>We pull data directly from official sources. No paper, no signatures.</Text>

        {/* AI engine card */}
        <View style={styles.engine}>
          <Text style={styles.engineLabel}>⚡ AI UNDERWRITING ENGINE</Text>
          <Text style={styles.engineText}>CIBIL · GST · ITR · Bank statements · Udyam · MSME — analysed in real time for the best offer.</Text>
          <View style={styles.engineBadge}>
            <Text style={styles.engineBadgeText}>{connected} of {sources.length} data sources connected</Text>
          </View>
        </View>

        {/* Source rows */}
        {sources.map((s) => {
          const done = s.status === 'verified';
          const isBusy = busy === s.sourceType;
          return (
            <TouchableOpacity
              key={s.sourceType}
              style={styles.sourceRow}
              activeOpacity={done ? 1 : 0.8}
              onPress={() => !done && !isBusy && connectOne(s.sourceType)}
              disabled={done || isBusy || connectingAll}
            >
              <View style={[styles.sourceIcon, done && styles.sourceIconDone]}>
                {isBusy ? <ActivityIndicator size="small" color="#8B1A1A" />
                  : <Feather name={done ? 'check' : 'shield'} size={18} color={done ? '#16A34A' : '#8B1A1A'} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sourceTitle}>{s.label}</Text>
                <Text style={styles.sourceProvider}>{s.providerLabel}</Text>
              </View>
              {done
                ? <Text style={styles.connectedTag}>Connected</Text>
                : <Feather name="chevron-right" size={20} color="#C0C0C0" />}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity onPress={() => navigation.navigate('OnboardingDocumentUpload')}>
          <Text style={styles.manualLink}>Upload documents manually instead</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        {remaining > 0 ? (
          <TouchableOpacity style={[styles.cta, connectingAll && { opacity: 0.7 }]} onPress={connectAll} disabled={connectingAll}>
            <Text style={styles.ctaText}>{connectingAll ? 'Connecting…' : `Connect ${remaining} source${remaining > 1 ? 's' : ''}`}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cta} onPress={proceed}>
            <Text style={styles.ctaText}>Continue to assessment →</Text>
          </TouchableOpacity>
        )}
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
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', lineHeight: 32 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, marginBottom: 16, lineHeight: 20 },
  engine: { backgroundColor: '#1a1a1a', borderRadius: 18, padding: 18, marginBottom: 16 },
  engineLabel: { color: '#F59E9E', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  engineText: { color: '#D1D5DB', fontSize: 13, marginTop: 8, lineHeight: 19 },
  engineBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(139,26,26,0.4)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 },
  engineBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12 },
  sourceIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
  sourceIconDone: { backgroundColor: '#F0FDF4' },
  sourceTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  sourceProvider: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  connectedTag: { color: '#16A34A', fontWeight: '700', fontSize: 13 },
  manualLink: { color: '#8B1A1A', textAlign: 'center', fontWeight: '600', marginTop: 8, paddingVertical: 8 },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  cta: { backgroundColor: '#8B1A1A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
