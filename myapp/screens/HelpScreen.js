import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const TOPICS = [
  { icon: 'credit-card', label: 'EMI & Payments' },
  { icon: 'file-text', label: 'Documents' },
  { icon: 'trending-up', label: 'Credit Score' },
  { icon: 'shield', label: 'Account Security' },
];

const FAQS = [
  { q: 'How fast can I get a loan?', a: 'With the AI verification flow, eligible applicants get an offer in under 3 minutes and disbursal can happen the same day once e-Sign is complete.' },
  { q: 'What documents do I need?', a: 'Most data is pulled digitally (PAN, Aadhaar, GST, bank statements via Account Aggregator). You only upload documents manually if a source can’t be fetched.' },
  { q: 'Can I prepay my loan?', a: 'Yes. You can prepay part or all of your outstanding anytime from the loan details screen; no foreclosure penalty on most products.' },
  { q: 'What is the Account Aggregator framework?', a: 'It’s an RBI-regulated, consent-based way to share your bank statement data securely with lenders — we never see your banking credentials.' },
];

const ISSUE_CATEGORIES = ['Payments', 'Documents', 'Application', 'Other'];

export default function HelpScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState('help'); // help | issue | contact
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  // Raise-issue form
  const [issueCat, setIssueCat] = useState('Payments');
  const [issueText, setIssueText] = useState('');

  const faqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  const submitIssue = () => {
    if (!issueText.trim()) { Alert.alert('Add details', 'Please describe your issue.'); return; }
    Alert.alert('Issue raised', 'Our team will get back to you within 24 hours. (Mocked in this build.)');
    setIssueText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} color="#8B1A1A" /></TouchableOpacity>
        <Text style={styles.appBarTitle}>Help & Support</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[['help', 'Help'], ['issue', 'Raise Issue'], ['contact', 'Contact']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {tab === 'help' && (
          <>
            <View style={styles.search}>
              <Feather name="search" size={18} color="#9CA3AF" />
              <TextInput style={styles.searchInput} placeholder="Search help articles…" placeholderTextColor="#9CA3AF"
                value={query} onChangeText={setQuery} />
            </View>

            <Text style={styles.section}>POPULAR TOPICS</Text>
            <View style={styles.topicGrid}>
              {TOPICS.map((t) => (
                <TouchableOpacity key={t.label} style={styles.topicCard} activeOpacity={0.85}
                  onPress={() => setQuery(t.label)}>
                  <View style={styles.topicIcon}><Feather name={t.icon} size={20} color="#8B1A1A" /></View>
                  <Text style={styles.topicLabel}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.section}>FREQUENTLY ASKED</Text>
            {faqs.map((f, i) => (
              <TouchableOpacity key={i} style={styles.faq} activeOpacity={0.9}
                onPress={() => setOpenFaq(openFaq === i ? null : i)}>
                <View style={styles.faqRow}>
                  <Text style={styles.faqQ}>{f.q}</Text>
                  <Feather name={openFaq === i ? 'chevron-up' : 'chevron-down'} size={18} color="#9CA3AF" />
                </View>
                {openFaq === i && <Text style={styles.faqA}>{f.a}</Text>}
              </TouchableOpacity>
            ))}
            {faqs.length === 0 && <Text style={styles.empty}>No articles match “{query}”.</Text>}
          </>
        )}

        {tab === 'issue' && (
          <>
            <Text style={styles.section}>CATEGORY</Text>
            <View style={styles.pillRow}>
              {ISSUE_CATEGORIES.map((c) => (
                <TouchableOpacity key={c} style={[styles.pill, issueCat === c && styles.pillActive]} onPress={() => setIssueCat(c)}>
                  <Text style={[styles.pillText, issueCat === c && styles.pillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.section}>DESCRIBE YOUR ISSUE</Text>
            <TextInput style={styles.textarea} placeholder="Tell us what happened…" placeholderTextColor="#9CA3AF"
              multiline value={issueText} onChangeText={setIssueText} />
            <TouchableOpacity style={styles.cta} onPress={submitIssue}>
              <Text style={styles.ctaText}>Submit issue</Text>
            </TouchableOpacity>
          </>
        )}

        {tab === 'contact' && (
          <>
            <ContactRow icon="phone" label="Call us" value="1800-123-4567" onPress={() => Linking.openURL('tel:18001234567')} />
            <ContactRow icon="mail" label="Email" value="support@svakarma.finance" onPress={() => Linking.openURL('mailto:support@svakarma.finance')} />
            <ContactRow icon="message-circle" label="WhatsApp" value="+91 98765 43210" onPress={() => Linking.openURL('https://wa.me/919876543210')} />
            <View style={styles.hours}>
              <Feather name="clock" size={16} color="#8B1A1A" />
              <Text style={styles.hoursText}>Support hours: Mon–Sat, 9 AM – 7 PM IST</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({ icon, label, value, onPress }) {
  return (
    <TouchableOpacity style={styles.contactRow} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.contactIcon}><Feather name={icon} size={20} color="#8B1A1A" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#C0C0C0" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  appBarTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center' },
  tabActive: { backgroundColor: '#8B1A1A' },
  tabText: { fontWeight: '700', color: '#374151', fontSize: 13 },
  tabTextActive: { color: '#FFF' },
  body: { padding: 16, paddingBottom: 24 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 14, height: 50, marginBottom: 18 },
  searchInput: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  section: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 12, marginTop: 6 },
  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  topicCard: { width: '47%', backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  topicIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  topicLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  faq: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 10 },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1a1a1a', paddingRight: 10 },
  faqA: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginTop: 10 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 12 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#FFF' },
  pillActive: { backgroundColor: '#8B1A1A' },
  pillText: { fontWeight: '600', color: '#374151' },
  pillTextActive: { color: '#FFF' },
  textarea: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, minHeight: 120, textAlignVertical: 'top', fontSize: 15, color: '#1a1a1a', marginBottom: 16 },
  cta: { backgroundColor: '#8B1A1A', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 12 },
  contactIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 13, color: '#6B7280' },
  contactValue: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginTop: 2 },
  hours: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingHorizontal: 4 },
  hoursText: { color: '#374151', fontSize: 13 },
});
