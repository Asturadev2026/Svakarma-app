import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { authService } from '../services/authService';

export default function OtpScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mobileNumber, generatedOtp } = route.params || {};
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const isValid = otp.length === 6 && /^\d+$/.test(otp);

  const handleVerify = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Call standard verifyOtp service
      const response = await authService.verifyOtp(mobileNumber || '9999999999', otp);
      if (response.success) {
        navigation.navigate('Permissions');
      } else {
        Alert.alert('Verification Failed', response.message || 'Invalid OTP code. Please try again.');
      }
    } catch (error) {
      console.log('[AUTH_ERROR]', error);
      Alert.alert('Verification Error', error.message || 'Something went wrong. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(30);
    console.log(`[AUTH] Resent OTP for ${mobileNumber}: 123456`);
    Alert.alert('OTP Resent', 'A new OTP has been sent to your mobile number.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Verify Mobile</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit verification code to +91 {mobileNumber || 'XXXXXXXXXX'}
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="• • • • • •"
                placeholderTextColor="#a0a0a0"
                keyboardType="numeric"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                textAlign="center"
              />
            </View>

            <View style={styles.resendContainer}>
              {timer > 0 ? (
                <Text style={styles.resendText}>Resend code in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={!isValid || loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Proceed'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#e63946',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
    borderRadius: 16,
    backgroundColor: '#f9f9f9',
    height: 60,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    fontSize: 24,
    letterSpacing: 8,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 'auto',
  },
  resendText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 14,
    color: '#e63946',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e63946',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ffb3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});