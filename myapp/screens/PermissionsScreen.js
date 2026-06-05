import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons";

import * as Location from "expo-location";
import * as Contacts from "expo-contacts";
import * as Notifications from "expo-notifications";

export default function PermissionsScreen() {
  const navigation = useNavigation();

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [contactsEnabled, setContactsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // LOCATION
  const requestLocationPermission = async () => {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      setLocationEnabled(true);
    } else {
      Alert.alert(
        "Permission Denied",
        "Location permission was denied."
      );
    }
  };

  // CONTACTS
  const requestContactsPermission = async () => {
    const { status } =
      await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      setContactsEnabled(true);
    } else {
      Alert.alert(
        "Permission Denied",
        "Contacts permission was denied."
      );
    }
  };

  // NOTIFICATIONS
  const requestNotificationPermission = async () => {
    const { status } =
      await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      setNotificationsEnabled(true);
    } else {
      Alert.alert(
        "Permission Denied",
        "Notification permission was denied."
      );
    }
  };

  // CONTINUE
  const handleContinue = () => {
    navigation.replace("MainTabs");
  };
    // Future:
    // navigation.navigate("Home");
  return (
    <SafeAreaView style={styles.container}>
      {/* Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Heading */}
      <Text style={styles.title}>
        A few permissions
      </Text>

      <Text style={styles.subtitle}>
        Per RBI digital lending guidelines,
        we ask only for what's strictly needed.
      </Text>

      {/* Location */}
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Feather name="map-pin" size={22} color="#FF001E" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>
            Location
          </Text>

          <Text style={styles.cardDescription}>
            For nearest branch and serviceability
            check. Used only at app open.
          </Text>
        </View>

        <Switch
          value={locationEnabled}
          onValueChange={requestLocationPermission}
          trackColor={{
            false: "#E5E5E5",
            true: "#FF001E",
          }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Contacts */}
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Feather name="users" size={22} color="#FF001E" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>
            Contacts
          </Text>

          <Text style={styles.cardDescription}>
            To pre-fill reference contacts.
            We never store your full address book.
          </Text>
        </View>

        <Switch
          value={contactsEnabled}
          onValueChange={requestContactsPermission}
          trackColor={{
            false: "#E5E5E5",
            true: "#FF001E",
          }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Notifications */}
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Feather name="bell" size={22} color="#FF001E" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>
            Notifications
          </Text>

          <Text style={styles.cardDescription}>
            EMI reminders, application
            status and OTPs.
          </Text>
        </View>

        <Switch
          value={notificationsEnabled}
          onValueChange={requestNotificationPermission}
          trackColor={{
            false: "#E5E5E5",
            true: "#FF001E",
          }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Feather name="shield" size={20} color="#FF001E" style={{ marginRight: 10, marginTop: 2 }} />
        <Text style={styles.infoText}>
          We do not access your photos,
          media or full contact list. Bank SMS
          access is not required — we use the
          Account Aggregator framework instead.
        </Text>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Continue */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          Continue
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 22,
    paddingTop: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
  },

  backArrow: {
    fontSize: 22,
    color: "#111827",
  },

  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#111827",
    marginTop: 26,
  },

  subtitle: {
    marginTop: 14,
    fontSize: 17,
    lineHeight: 28,
    color: "#4B5563",
    marginBottom: 30,
  },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  icon: {
    fontSize: 22,
  },

  textContainer: {
    flex: 1,
    paddingRight: 10,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6B7280",
  },

  infoBox: {
    backgroundColor: "#FFF4F4",
    borderWidth: 1,
    borderColor: "#FFB8C0",
    borderRadius: 18,
    padding: 18,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 24,
    flex: 1,
  },

  button: {
    backgroundColor: "#FF001E",
    height: 65,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,

    shadowColor: "#FF001E",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,

    elevation: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
});