import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { authService } from '../services/authService';

const APP_VERSION = 'v4.2.1 · Build 2845';

export default function ProfileHubScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);   // from /profile (completion, kyc)
  const [cached, setCached] = useState(null);      // from local login cache (name, company)

  const load = useCallback(async () => {
    // Cached login profile first — so the header is never blank, even if the API fails.
    try {
      const c = await authService.getUserProfile();
      if (c) setCached(c);
    } catch (e) { /* ignore */ }
    // Live profile for completion % + KYC badge (degrades gracefully if it errors).
    try {
      const res = await api.get('/profile');
      if (res?.success) setProfile(res.data);
    } catch (e) { /* keep cached */ }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const personal = profile?.personalDetails;
  const business = profile?.businessDetails;
  const name = (personal?.fullName && personal.fullName !== 'Complete Your Profile')
    ? personal.fullName
    : (cached?.name && cached.name !== 'Complete Your Profile' ? cached.name : 'Complete Your Profile');
  const company = business?.businessName || cached?.companyName || 'Your business';
  const completion = profile?.kycStatus?.completionPercentage ?? cached?.profileCompletion ?? 0;
  const kycVerified = !!(profile?.kycStatus?.panVerified && profile?.kycStatus?.aadhaarVerified);

  const initials = (() => {
    if (!name || name === 'Complete Your Profile') return '?';
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?';
  })();

  const go = (screen, params) => navigation.navigate(screen, params);
  const soon = (label) => Alert.alert(label, 'Coming soon in a future build.');

  const signOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => {
          await authService.logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const GROUPS = [
    {
      title: 'FINANCIAL',
      items: [
        { icon: 'trending-up', label: 'Free CIBIL Report', badge: 'FREE', onPress: () => go('CIBIL') },
        { icon: 'calculator', iconFamily: 'mci', label: 'EMI Calculator', onPress: () => go('EMICalculator') },
        { icon: 'file-text', label: 'My Applications', onPress: () => go('MyApplications') },
        { icon: 'book-open', label: 'Loan documents', onPress: () => go('OnboardingDocumentUpload') },
      ],
    },
    {
      title: 'REWARDS & GROWTH',
      items: [
        { icon: 'gift', label: 'Refer & Earn ₹2,500', onPress: () => go('Refer') },
        { icon: 'award', label: 'My rewards', count: 3, onPress: () => go('Refer') },
        { icon: 'star', label: 'Loyalty benefits', onPress: () => soon('Loyalty benefits') },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { icon: 'help-circle', label: 'Help Center', onPress: () => go('Help') },
        { icon: 'alert-circle', label: 'Raise an issue', onPress: () => go('Help') },
        { icon: 'message-circle', label: 'Chat with RM', onPress: () => Linking.openURL('https://wa.me/919876543210') },
        { icon: 'map-pin', label: 'Branch locator', onPress: () => soon('Branch locator') },
        { icon: 'help-circle', label: 'FAQs', onPress: () => go('Help') },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { icon: 'shield', label: 'Privacy & data', onPress: () => soon('Privacy & data') },
        { icon: 'bell', label: 'Notifications', onPress: () => soon('Notifications') },
        { icon: 'globe', label: 'Language', value: 'English', onPress: () => soon('Language') },
        { icon: 'file', label: 'Terms & Policies', onPress: () => soon('Terms & Policies') },
        { icon: 'log-out', label: 'Sign out', danger: true, onPress: signOut },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <View style={styles.header}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.company} numberOfLines={1}>{company}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.gold}><Text style={styles.goldText}>★ GOLD MEMBER</Text></View>
              {kycVerified && <View style={styles.kyc}><Text style={styles.kycText}>KYC VERIFIED</Text></View>}
            </View>
          </View>
        </View>

        {/* Completion banner → detailed sections screen */}
        <TouchableOpacity style={styles.completion} activeOpacity={0.9} onPress={() => go('ProfileDetails')}>
          <View style={styles.ring}><Text style={styles.ringText}>{completion}%</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.completionTitle}>Complete your profile</Text>
            <Text style={styles.completionSub}>
              {completion >= 100 ? 'All set — you’re fully verified' : 'Finish remaining sections to unlock better rates'}
            </Text>
          </View>
          <Feather name="chevron-right" size={22} color="#8B1A1A" />
        </TouchableOpacity>

        {GROUPS.map((g) => (
          <View key={g.title}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            <View style={styles.groupCard}>
              {g.items.map((it, i) => (
                <TouchableOpacity key={it.label} style={[styles.row, i < g.items.length - 1 && styles.rowBorder]}
                  activeOpacity={0.85} onPress={it.onPress}>
                  <View style={[styles.rowIcon, it.danger && styles.rowIconDanger]}>
                    {it.iconFamily === 'mci'
                      ? <MaterialCommunityIcons name={it.icon} size={18} color={it.danger ? '#DC2626' : '#8B1A1A'} />
                      : <Feather name={it.icon} size={18} color={it.danger ? '#DC2626' : '#8B1A1A'} />}
                  </View>
                  <Text style={[styles.rowLabel, it.danger && { color: '#DC2626' }]}>{it.label}</Text>
                  {it.badge && <View style={styles.freeBadge}><Text style={styles.freeText}>{it.badge}</Text></View>}
                  {it.count != null && <View style={styles.countBadge}><Text style={styles.countText}>{it.count}</Text></View>}
                  {it.value && <Text style={styles.rowValue}>{it.value}</Text>}
                  {!it.danger && <Feather name="chevron-right" size={18} color="#C0C0C0" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footer}>Svakarma {APP_VERSION}</Text>
        <Text style={styles.footerSmall}>RBI Registered NBFC · CIN U74999MH2018PTC306437</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  body: { padding: 16, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, marginTop: 4 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#8B1A1A', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  company: { fontSize: 13, color: '#6B7280', marginTop: 1 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  gold: { backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  goldText: { color: '#92400E', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  kyc: { backgroundColor: '#ECFDF5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  kycText: { color: '#065F46', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  completion: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF0F0', borderColor: '#FCD9D9', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 22 },
  ring: { width: 46, height: 46, borderRadius: 23, borderWidth: 3, borderColor: '#8B1A1A', alignItems: 'center', justifyContent: 'center' },
  ringText: { fontSize: 12, fontWeight: '800', color: '#8B1A1A' },
  completionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  completionSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  groupTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  groupCard: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, marginBottom: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
  rowIconDanger: { backgroundColor: '#FEF2F2' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  rowValue: { fontSize: 13, color: '#9CA3AF', marginRight: 6 },
  freeBadge: { backgroundColor: '#ECFDF5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6 },
  freeText: { color: '#065F46', fontSize: 10, fontWeight: '800' },
  countBadge: { backgroundColor: '#DC2626', borderRadius: 11, minWidth: 22, height: 22, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  countText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  footer: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 6 },
  footerSmall: { textAlign: 'center', color: '#C0C0C0', fontSize: 11, marginTop: 4 },
});
