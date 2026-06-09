import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const BUSINESS_TYPES = [
  {
    type: 'PROPRIETORSHIP',
    label: 'Proprietorship',
    description: 'Sole owner managing a single business',
    icon: 'user',
  },
  {
    type: 'LLP',
    label: 'LLP',
    description: 'Limited Liability Partnership with shared ownership',
    icon: 'users',
  },
  {
    type: 'PRIVATE_LIMITED',
    label: 'Private Limited',
    description: 'Registered Pvt. Ltd. company with limited liability',
    icon: 'briefcase',
  },
];

export default function OnboardingSelectTypeScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) {
      Alert.alert('Select Business Type', 'Please select your business structure to continue.');
      return;
    }
    navigation.navigate('OnboardingBusinessDetails', { businessType: selected });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#8B1A1A" />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>STEP 1 OF 2</Text>
          </View>
          <Text style={styles.title}>What type of{'\n'}business do you run?</Text>
          <Text style={styles.subtitle}>
            Select the legal structure that best describes your business.
          </Text>
        </View>

        {/* Business Type Cards */}
        <View style={styles.cards}>
          {BUSINESS_TYPES.map((item) => {
            const isSelected = selected === item.type;
            return (
              <TouchableOpacity
                key={item.type}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(item.type)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                  <Feather name={item.icon} size={26} color={isSelected ? '#FFFFFF' : '#8B1A1A'} />
                </View>

                <View style={styles.cardText}>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.cardDesc, isSelected && styles.cardDescSelected]}>
                    {item.description}
                  </Text>
                </View>

                {isSelected && (
                  <Feather name="check-circle" size={22} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120,
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
    marginBottom: 32,
  },
  stepBadge: {
    backgroundColor: '#FFF0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 14,
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
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  cards: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  cardSelected: {
    backgroundColor: '#8B1A1A',
    borderColor: '#8B1A1A',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  cardLabelSelected: {
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  cardDescSelected: {
    color: 'rgba(255,255,255,0.75)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#F8F4F4',
  },
  continueBtn: {
    backgroundColor: '#8B1A1A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
});
