import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

const FIELDS = [
  {
    key: 'fullName',
    label: 'Full Name',
    placeholder: 'e.g. Arjun Sharma',
    keyboardType: 'default',
    editable: true,
    autoCapitalize: 'words',
  },
  {
    key: 'email',
    label: 'Email',
    placeholder: 'e.g. you@business.in',
    keyboardType: 'email-address',
    editable: true,
    autoCapitalize: 'none',
  },
  {
    key: 'mobile',
    label: 'Mobile Number',
    placeholder: '10-digit mobile number',
    keyboardType: 'phone-pad',
    editable: false, // Phone is immutable — set at login
    autoCapitalize: 'none',
  },
  {
    key: 'pan',
    label: 'PAN Number',
    placeholder: 'e.g. ABCDE1234F',
    keyboardType: 'default',
    editable: false, // PAN is stored on BusinessProfile, not editable here
    autoCapitalize: 'characters',
  },
  {
    key: 'aadhaar',
    label: 'Aadhaar Number',
    placeholder: '12-digit Aadhaar',
    keyboardType: 'numeric',
    editable: false, // Aadhaar stored on BusinessProfile, not editable here
    autoCapitalize: 'none',
  },
];

export default function PersonalDetailsScreen() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    pan: '',
    aadhaar: '',
  });
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');

  // ── Fetch profile on mount ───────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.success) {
          const p = response.data?.personalDetails ?? {};
          const name = (p.fullName && p.fullName !== 'Complete Your Profile') ? p.fullName : '';
          const email = p.email ?? '';
          setOriginalName(name);
          setOriginalEmail(email);
          setForm({
            fullName:  name,
            email,
            mobile:    p.mobile   ?? '',
            pan:       p.pan      ?? '',
            aadhaar:   p.aadhaar  ?? '',
          });
        }
      } catch (err) {
        console.warn('[PERSONAL_DETAILS] fetch failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const trimmedName = form.fullName.trim();
    if (!trimmedName) {
      Alert.alert('Required', 'Full name cannot be empty.');
      return;
    }

    const trimmedEmail = form.email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/profile', {
        personalDetails: { fullName: trimmedName, email: trimmedEmail },
      });

      if (response.success) {
        Alert.alert('Saved!', 'Your personal details have been updated.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to save. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanged = form.fullName.trim() !== originalName || form.email.trim() !== originalEmail;

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8B1A1A" />
      </SafeAreaView>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color="#8B1A1A" />
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.badgeRow}>
              <View style={styles.stepBadge}>
                <Feather name="user" size={12} color="#8B1A1A" />
                <Text style={styles.stepText}>PERSONAL DETAILS</Text>
              </View>
            </View>
            <Text style={styles.title}>Your Details</Text>
            <Text style={styles.subtitle}>
              Keep your profile up-to-date for faster loan processing.
            </Text>
          </View>

          {/* Avatar Circle */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>
                {form.fullName ? form.fullName.trim().charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={styles.avatarName}>
              {form.fullName || 'Your Name'}
            </Text>
            {form.mobile ? (
              <Text style={styles.avatarPhone}>+91 {form.mobile}</Text>
            ) : null}
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {FIELDS.map((field, index) => {
              const isLocked = !field.editable;
              const isEmpty = !form[field.key];

              return (
                <View
                  key={field.key}
                  style={[styles.fieldGroup, index === 0 && { marginTop: 0 }]}
                >
                  <View style={styles.labelRow}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    {isLocked && (
                      <View style={styles.lockBadge}>
                        <Feather name="lock" size={10} color="#9CA3AF" />
                        <Text style={styles.lockText}>Read only</Text>
                      </View>
                    )}
                  </View>

                  <TextInput
                    style={[
                      styles.input,
                      isLocked && styles.inputLocked,
                      isEmpty && styles.inputEmpty,
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor="#C0C0C0"
                    keyboardType={field.keyboardType}
                    value={form[field.key]}
                    onChangeText={(val) => field.editable && handleChange(field.key, val)}
                    autoCapitalize={field.autoCapitalize}
                    editable={field.editable}
                    selectTextOnFocus={field.editable}
                  />

                  {index < FIELDS.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>

          {/* Info note about locked fields */}
          <View style={styles.infoBox}>
            <Feather name="info" size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              PAN and Aadhaar details are linked to your business profile. To update them, go to{' '}
              <Text style={styles.infoLink}>Business Info</Text>.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (!hasChanged || saving) && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanged || saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Save Changes</Text>
                <Feather name="check" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4F4',
  },
  scroll: {
    padding: 20,
    paddingBottom: 60,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  headerRow: {
    marginBottom: 8,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFDADA',
  },
  stepText: {
    color: '#8B1A1A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // ── Avatar ───────────────────────────────────────────────────────────────
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  avatarPhone: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },

  // ── Form Card ────────────────────────────────────────────────────────────
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldGroup: {
    marginTop: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lockText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  input: {
    fontSize: 15,
    color: '#111827',
    paddingVertical: 8,
  },
  inputLocked: {
    color: '#9CA3AF',
  },
  inputEmpty: {
    color: '#C0C0C0',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 14,
  },

  // ── Info Box ─────────────────────────────────────────────────────────────
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  infoLink: {
    color: '#8B1A1A',
    fontWeight: '700',
  },

  // ── Save Button ──────────────────────────────────────────────────────────
  saveBtn: {
    backgroundColor: '#8B1A1A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnDisabled: {
    backgroundColor: '#D4A0A0',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
