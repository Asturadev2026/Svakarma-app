import React, { useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { businessService } from '../services/businessService';

const BUSINESS_TYPE_LABELS = {
  PROPRIETORSHIP: 'Proprietorship',
  LLP: 'LLP',
  PRIVATE_LIMITED: 'Private Limited',
};

const FIELDS = [
  { key: 'businessName',   label: 'Business Name',    placeholder: 'e.g. Alpha Ventures',        required: true,  keyboardType: 'default' },
  { key: 'gstNumber',      label: 'GSTIN',             placeholder: 'e.g. 27ABCDE1234F1Z5',          required: false, keyboardType: 'default' },
  { key: 'panNumber',      label: 'PAN Number',        placeholder: 'e.g. ABCDE1234F',               required: false, keyboardType: 'default' },
  { key: 'aadhaarNumber',  label: 'Aadhaar Number',    placeholder: '12-digit Aadhaar',              required: false, keyboardType: 'numeric' },
  { key: 'industry',       label: 'Industry / Sector', placeholder: 'e.g. CNC & Tooling Units',      required: false, keyboardType: 'default' },
  { key: 'annualTurnover', label: 'Annual Turnover',   placeholder: 'e.g. ₹45,00,000',               required: false, keyboardType: 'default' },
  { key: 'udyamNumber',    label: 'Udyam Number',      placeholder: 'e.g. UDYAM-MH-18-0034521',      required: false, keyboardType: 'default' },
  { key: 'addressLine1',   label: 'Address Line 1',    placeholder: 'Street / Building',             required: false, keyboardType: 'default' },
  { key: 'addressLine2',   label: 'Address Line 2',    placeholder: 'Area / Landmark (optional)',    required: false, keyboardType: 'default' },
  { key: 'city',           label: 'City',              placeholder: 'e.g. Pune',                    required: false, keyboardType: 'default' },
  { key: 'state',          label: 'State',             placeholder: 'e.g. Maharashtra',             required: false, keyboardType: 'default' },
  { key: 'pincode',        label: 'Pincode',           placeholder: 'e.g. 411001',                  required: false, keyboardType: 'numeric' },
];

export default function OnboardingBusinessDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { businessType } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    gstNumber: '',
    panNumber: '',
    aadhaarNumber: '',
    industry: '',
    annualTurnover: '',
    udyamNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.businessName.trim()) {
      Alert.alert('Required', 'Business name is required to continue.');
      return;
    }

    setLoading(true);
    try {
      const response = await businessService.saveBusinessProfile({
        businessType,
        businessName: form.businessName.trim(),
        gstNumber: form.gstNumber.trim() || undefined,
        panNumber: form.panNumber.trim() || undefined,
        aadhaarNumber: form.aadhaarNumber.trim() || undefined,
        industry: form.industry.trim() || undefined,
        annualTurnover: form.annualTurnover.trim() || undefined,
        udyamNumber: form.udyamNumber.trim() || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
      });

      if (response.success) {
        Alert.alert(
          'Profile Saved! 🎉',
          'Your business profile has been saved. Now upload your documents.',
          [
            {
              text: 'Upload Documents',
              onPress: () => navigation.navigate('OnboardingDocumentUpload'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('[ONBOARDING_ERROR]', error);
      Alert.alert('Error', error.message || 'Something went wrong. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

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

          <View style={styles.hero}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>STEP 2 OF 2</Text>
            </View>
            <Text style={styles.title}>Business Details</Text>
            <View style={styles.typeBadge}>
              <Feather name="briefcase" size={13} color="#8B1A1A" />
              <Text style={styles.typeLabel}>{BUSINESS_TYPE_LABELS[businessType] || businessType}</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {FIELDS.map((field, index) => (
              <View key={field.key} style={[styles.fieldGroup, index === 0 && { marginTop: 0 }]}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#B0B0B0"
                  keyboardType={field.keyboardType}
                  value={form[field.key]}
                  onChangeText={(val) => handleChange(field.key, val)}
                  autoCapitalize={field.keyboardType === 'default' ? 'words' : 'none'}
                />
                {/* Divider between fields but not after last */}
                {index < FIELDS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Save Business Profile</Text>
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
  hero: {
    marginBottom: 24,
  },
  stepBadge: {
    backgroundColor: '#FFF0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
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
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeLabel: {
    color: '#8B1A1A',
    fontWeight: '600',
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  fieldGroup: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: '#8B1A1A',
  },
  input: {
    fontSize: 15,
    color: '#111827',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 14,
  },
  submitBtn: {
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
  submitBtnDisabled: {
    backgroundColor: '#D4A0A0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
