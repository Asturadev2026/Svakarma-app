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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { businessService } from '../services/businessService';

const BUSINESS_TYPE_LABELS = {
  PROPRIETORSHIP: 'Proprietorship',
  LLP: 'LLP',
  PRIVATE_LIMITED: 'Private Limited',
};

// Government ID formats
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;                                   // ABCDE1234F
const AADHAAR_RE = /^[0-9]{12}$/;                                           // 12 digits
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;         // 15-char GSTIN
const PIN_RE = /^[0-9]{6}$/;                                               // 6 digits
const UDYAM_RE = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/;                     // UDYAM-MH-18-0034521

// transform: 'upper' uppercases, 'digits' strips non-digits.
// validate: returns an error string for a NON-EMPTY value, or null if ok.
const FIELDS = [
  { key: 'businessName',   label: 'Business Name',    placeholder: 'e.g. Alpha Ventures',        required: true,  keyboardType: 'default', autoCap: 'words' },
  { key: 'gstNumber',      label: 'GSTIN',             placeholder: 'e.g. 27ABCDE1234F1Z5',         required: false, keyboardType: 'default', autoCap: 'characters', transform: 'upper', maxLength: 15,
    validate: (v) => GST_RE.test(v) ? null : 'GSTIN must be 15 characters (e.g. 27ABCDE1234F1Z5).' },
  { key: 'panNumber',      label: 'PAN Number',        placeholder: 'e.g. ABCDE1234F',              required: false, keyboardType: 'default', autoCap: 'characters', transform: 'upper', maxLength: 10,
    validate: (v) => PAN_RE.test(v) ? null : 'PAN must be 10 characters (e.g. ABCDE1234F).' },
  { key: 'aadhaarNumber',  label: 'Aadhaar Number',    placeholder: '12-digit Aadhaar',             required: false, keyboardType: 'numeric', transform: 'digits', maxLength: 12,
    validate: (v) => AADHAAR_RE.test(v) ? null : 'Aadhaar must be exactly 12 digits.' },
  { key: 'industry',       label: 'Industry / Sector', placeholder: 'e.g. CNC & Tooling Units',     required: false, keyboardType: 'default', autoCap: 'words' },
  { key: 'annualTurnover', label: 'Annual Turnover',   placeholder: 'e.g. 4500000',                 required: false, keyboardType: 'numeric', transform: 'digits', maxLength: 12 },
  { key: 'udyamNumber',    label: 'Udyam Number',      placeholder: 'e.g. UDYAM-MH-18-0034521',     required: false, keyboardType: 'default', autoCap: 'characters', transform: 'upper', maxLength: 19,
    validate: (v) => UDYAM_RE.test(v) ? null : 'Format: UDYAM-XX-00-0000000.' },
  { key: 'addressLine1',   label: 'Address Line 1',    placeholder: 'Street / Building',            required: false, keyboardType: 'default', autoCap: 'words' },
  { key: 'addressLine2',   label: 'Address Line 2',    placeholder: 'Area / Landmark (optional)',   required: false, keyboardType: 'default', autoCap: 'words' },
  { key: 'city',           label: 'City',              placeholder: 'e.g. Pune',                    required: false, keyboardType: 'default', autoCap: 'words' },
  { key: 'state',          label: 'State',             placeholder: 'e.g. Maharashtra',             required: false, keyboardType: 'default', autoCap: 'words' },
  { key: 'pincode',        label: 'Pincode',           placeholder: 'e.g. 411001',                  required: false, keyboardType: 'numeric', transform: 'digits', maxLength: 6,
    validate: (v) => PIN_RE.test(v) ? null : 'Pincode must be 6 digits.' },
];

export default function OnboardingBusinessDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { businessType: routeBusinessType } = route.params || {};

  const [loading, setLoading] = useState(false);
  // Business type comes from the type-picker (new onboarding) OR from the saved
  // profile (when editing from the Profile screen).
  const [businessType, setBusinessType] = useState(routeBusinessType || null);
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
  const [errors, setErrors] = useState({});

  const FIELD_BY_KEY = React.useMemo(() => Object.fromEntries(FIELDS.map((f) => [f.key, f])), []);

  // Preload any existing business profile so this screen works for EDITING
  // (e.g. opened from the Profile screen's Financial / Address sections), not
  // just first-time onboarding.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await businessService.getBusinessProfile();
        const p = res?.data;
        if (!active || !p) return;
        setForm((prev) => ({
          ...prev,
          businessName: p.businessName ?? prev.businessName,
          gstNumber: p.gstNumber ?? '',
          panNumber: p.panNumber ?? '',
          aadhaarNumber: p.aadhaarNumber ?? '',
          industry: p.industry ?? '',
          annualTurnover: p.annualTurnover ?? '',
          udyamNumber: p.udyamNumber ?? '',
          addressLine1: p.address?.line1 ?? '',
          addressLine2: p.address?.line2 ?? '',
          city: p.address?.city ?? '',
          state: p.address?.state ?? '',
          pincode: p.address?.pincode ?? '',
        }));
        // Keep the type chosen at onboarding; otherwise use the saved one.
        if (!routeBusinessType && p.businessType) setBusinessType(p.businessType);
      } catch (err) {
        console.warn('[BUSINESS_PRELOAD] could not load profile:', err.message);
      }
    })();
    return () => { active = false; };
  }, [routeBusinessType]);

  const handleChange = (key, value) => {
    const f = FIELD_BY_KEY[key];
    let v = value;
    if (f?.transform === 'upper') v = v.toUpperCase();
    else if (f?.transform === 'digits') v = v.replace(/[^0-9]/g, '');
    if (f?.maxLength) v = v.slice(0, f.maxLength);
    setForm((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Validate every field with a validator that has a non-empty value.
  const validateAll = () => {
    const next = {};
    for (const f of FIELDS) {
      if (!f.validate) continue;
      const val = (form[f.key] || '').trim();
      if (!val) continue; // optional — only validate when filled
      const err = f.validate(val);
      if (err) next[f.key] = err;
    }
    setErrors(next);
    return next;
  };

  const handleSubmit = async () => {
    if (!form.businessName.trim()) {
      Alert.alert('Required', 'Business name is required to continue.');
      return;
    }
    if (!businessType) {
      Alert.alert('Required', 'Please select your business type first.');
      navigation.navigate('OnboardingSelectType');
      return;
    }

    const fieldErrors = validateAll();
    const firstError = Object.values(fieldErrors)[0];
    if (firstError) {
      Alert.alert('Check your details', firstError);
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
                  style={[styles.input, errors[field.key] && styles.inputError]}
                  placeholder={field.placeholder}
                  placeholderTextColor="#B0B0B0"
                  keyboardType={field.keyboardType}
                  value={form[field.key]}
                  onChangeText={(val) => handleChange(field.key, val)}
                  autoCapitalize={field.autoCap || (field.keyboardType === 'default' ? 'words' : 'none')}
                  maxLength={field.maxLength}
                />
                {errors[field.key] && <Text style={styles.errorText}>{errors[field.key]}</Text>}
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
  inputError: {
    color: '#B91C1C',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
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
