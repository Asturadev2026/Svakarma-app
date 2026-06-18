import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { documentService } from '../services/documentService';

// ─────────────────────────────────────────────────────────────────────────────
// Document types configuration
// ─────────────────────────────────────────────────────────────────────────────
const DOC_TYPES = [
  {
    type:        'PAN_CARD',
    label:       'PAN Card',
    description: 'Permanent Account Number card (front side)',
    icon:        'credit-card',
    required:    true,
  },
  {
    type:        'AADHAAR_CARD',
    label:       'Aadhaar Card',
    description: 'Both front and back sides in a single file',
    icon:        'shield',
    required:    true,
  },
  {
    type:        'GST_CERTIFICATE',
    label:       'GST Certificate',
    description: 'GST registration certificate from GST portal',
    icon:        'file-text',
    required:    false,
  },
  {
    type:        'BANK_STATEMENT',
    label:       'Bank Statement',
    description: 'Last 6 months PDF bank statement',
    icon:        'database',
    required:    false,
  },
];

// Status → display config
const STATUS_CONFIG = {
  idle:      { label: 'Not Uploaded',   color: '#9CA3AF', bg: '#F3F4F6' },
  picked:    { label: 'File Selected',  color: '#D97706', bg: '#FEF3C7' },
  uploading: { label: 'Uploading…',     color: '#2563EB', bg: '#EFF6FF' },
  uploaded:  { label: 'Uploaded ✓',     color: '#16A34A', bg: '#F0FDF4' },
  error:     { label: 'Upload Failed',  color: '#DC2626', bg: '#FEF2F2' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardingDocumentUploadScreen() {
  const navigation = useNavigation();

  // Per-doc state: { file: null | Asset, status: 'idle'|'picked'|'uploading'|'uploaded'|'error' }
  const [docStates, setDocStates] = useState(
    Object.fromEntries(DOC_TYPES.map((d) => [d.type, { file: null, status: 'idle' }])),
  );
  const [hydrating, setHydrating] = useState(true);

  // ─── Hydrate from server ─────────────────────────────────────────────────
  // Load already-uploaded documents so revisiting this screen reflects reality
  // instead of resetting everything to "Not Uploaded".
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await documentService.getDocuments();
        const docs = res?.data || [];
        if (!active || docs.length === 0) return;
        setDocStates((prev) => {
          const next = { ...prev };
          for (const doc of docs) {
            if (next[doc.docType]) {
              next[doc.docType] = {
                file: { name: doc.fileName || 'Uploaded document' },
                status: 'uploaded',
              };
            }
          }
          return next;
        });
      } catch (err) {
        console.warn('[DOC_HYDRATE] could not load existing documents:', err.message);
      } finally {
        if (active) setHydrating(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function updateDoc(type, patch) {
    setDocStates((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }));
  }

  // ─── Pick file ─────────────────────────────────────────────────────────────
  async function handlePick(type) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type:                 ['image/jpeg', 'image/png', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple:             false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      // Enforce 10 MB limit on the client side too
      if (asset.size && asset.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Maximum allowed file size is 10 MB.');
        return;
      }

      updateDoc(type, { file: asset, status: 'picked' });
    } catch (err) {
      console.error('[DOC_PICK_ERROR]', err);
      Alert.alert('Error', 'Failed to open file picker. Please try again.');
    }
  }

  // ─── Upload file ───────────────────────────────────────────────────────────
  async function handleUpload(type) {
    const { file } = docStates[type];
    if (!file) return;

    updateDoc(type, { status: 'uploading' });
    try {
      const response = await documentService.uploadDocument(file, type);
      if (response.success) {
        updateDoc(type, { status: 'uploaded' });
      } else {
        throw new Error(response.message || 'Upload failed.');
      }
    } catch (err) {
      console.error('[DOC_UPLOAD_ERROR]', err);
      updateDoc(type, { status: 'error' });
      Alert.alert(
        'Upload Failed',
        err.message || 'Something went wrong. Please check your connection and try again.',
      );
    }
  }

  // ─── Continue ──────────────────────────────────────────────────────────────
  async function handleContinue() {
    const uploadedCount = Object.values(docStates).filter((s) => s.status === 'uploaded').length;
    if (uploadedCount === 0) {
      Alert.alert(
        'No Documents Uploaded',
        'Please upload at least one document before continuing.',
      );
      return;
    }
    const permissionsGranted = await AsyncStorage.getItem('permissions_granted');
    if (permissionsGranted === 'true') {
      navigation.navigate('MainTabs');
    } else {
      navigation.navigate('Permissions');
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  const uploadedCount = Object.values(docStates).filter((s) => s.status === 'uploaded').length;

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>STEP 3 OF 3</Text>
          </View>
          <Text style={styles.title}>Upload Documents</Text>
          <Text style={styles.subtitle}>
            Upload your KYC and business documents. Accepted formats: JPEG, PNG, PDF (max 10 MB each).
          </Text>
        </View>

        {/* Progress row */}
        <View style={styles.progressRow}>
          <View style={styles.progressPill}>
            {hydrating ? (
              <>
                <ActivityIndicator size="small" color="#8B1A1A" />
                <Text style={styles.progressText}>Checking your documents…</Text>
              </>
            ) : (
              <>
                <Feather name="check-circle" size={14} color="#8B1A1A" />
                <Text style={styles.progressText}>{uploadedCount} of {DOC_TYPES.length} uploaded</Text>
              </>
            )}
          </View>
        </View>

        {/* Document cards */}
        {DOC_TYPES.map((doc) => {
          const state  = docStates[doc.type];
          const status = STATUS_CONFIG[state.status] || STATUS_CONFIG.idle;
          const isUploading = state.status === 'uploading';
          const isUploaded  = state.status === 'uploaded';

          return (
            <View key={doc.type} style={styles.card}>
              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, isUploaded && styles.iconCircleSuccess]}>
                  <Feather
                    name={isUploaded ? 'check' : doc.icon}
                    size={20}
                    color={isUploaded ? '#16A34A' : '#8B1A1A'}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.labelRow}>
                    <Text style={styles.cardLabel}>{doc.label}</Text>
                    {doc.required && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>Required</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardDesc}>{doc.description}</Text>
                </View>
              </View>

              {/* Status chip */}
              <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>

              {/* Selected file name */}
              {state.file && !isUploaded && (
                <View style={styles.fileRow}>
                  <Feather name="paperclip" size={13} color="#6B7280" />
                  <Text style={styles.fileName} numberOfLines={1}>{state.file.name}</Text>
                </View>
              )}

              {/* Action buttons */}
              <View style={styles.cardActions}>
                {/* Pick / Re-pick button */}
                {!isUploaded && (
                  <TouchableOpacity
                    style={[styles.pickBtn, isUploading && styles.btnDisabled]}
                    onPress={() => handlePick(doc.type)}
                    disabled={isUploading}
                  >
                    <Feather name="folder" size={15} color="#8B1A1A" />
                    <Text style={styles.pickBtnText}>
                      {state.file ? 'Change File' : 'Select File'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Upload button — only shown when file is selected and not yet uploaded */}
                {state.file && !isUploaded && (
                  <TouchableOpacity
                    style={[styles.uploadBtn, isUploading && styles.btnDisabled]}
                    onPress={() => handleUpload(doc.type)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Feather name="upload" size={15} color="#FFFFFF" />
                        <Text style={styles.uploadBtnText}>Upload</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Uploaded state — re-upload option */}
                {isUploaded && (
                  <TouchableOpacity
                    style={styles.reuploadBtn}
                    onPress={() => {
                      updateDoc(doc.type, { file: null, status: 'idle' });
                    }}
                  >
                    <Feather name="refresh-cw" size={13} color="#6B7280" />
                    <Text style={styles.reuploadText}>Replace</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.continueBtn, uploadedCount === 0 && styles.continueBtnDisabled]}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>Continue to Dashboard</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.skipHint}>
          You can also upload additional documents later from your profile.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4F4',
  },
  scroll: {
    padding: 20,
    paddingBottom: 60,
  },

  // Header
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

  // Hero
  hero: {
    marginBottom: 16,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Progress
  progressRow: {
    marginBottom: 20,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFDADA',
  },
  progressText: {
    color: '#8B1A1A',
    fontSize: 13,
    fontWeight: '600',
  },

  // Document card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconCircleSuccess: {
    backgroundColor: '#F0FDF4',
  },
  cardInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  requiredBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Status chip
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // File name row
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  fileName: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },

  // Action buttons
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderColor: '#8B1A1A',
    borderRadius: 12,
    paddingVertical: 10,
  },
  pickBtnText: {
    color: '#8B1A1A',
    fontWeight: '600',
    fontSize: 14,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#8B1A1A',
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  reuploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  reuploadText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // Continue button
  continueBtn: {
    backgroundColor: '#8B1A1A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  continueBtnDisabled: {
    backgroundColor: '#D4A0A0',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});
