import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import * as Contacts from "expo-contacts";
import * as Notifications from "expo-notifications";

export default function PermissionsScreen() {
  const navigation = useNavigation();

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [contactsEnabled, setContactsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const allPermissionsGranted =
    locationEnabled && contactsEnabled && notificationsEnabled;

  const showPermissionRequiredAlert = (permissionName, canAskAgain = true) => {
    const message = `${permissionName} permission is required to continue to the dashboard.`;

    if (!canAskAgain) {
      Alert.alert(
        "Permission Required",
        `${message} Please enable it from app settings.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    Alert.alert("Permission Required", message);
  };

  // LOCATION
  const requestLocationPermission = async () => {
    const { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      setLocationEnabled(true);
    } else {
      setLocationEnabled(false);
      showPermissionRequiredAlert("Location", canAskAgain);
    }
  };

  // CONTACTS
  const requestContactsPermission = async () => {
    const { status, canAskAgain } =
      await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      setContactsEnabled(true);
    } else {
      setContactsEnabled(false);
      showPermissionRequiredAlert("Contacts", canAskAgain);
    }
  };

  // NOTIFICATIONS
  const requestNotificationPermission = async () => {
    const { status, canAskAgain } =
      await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
      showPermissionRequiredAlert("Notification", canAskAgain);
    }
  };

  // CONTINUE
  const handleContinue = async () => {
    if (!allPermissionsGranted) {
      Alert.alert(
        "Permissions Required",
        "Please allow Location, Contacts, and Notifications permissions to continue."
      );
      return;
    }

    await AsyncStorage.setItem('permissions_granted', 'true');
    navigation.replace("MainTabs");
  };
    // Future:
    // navigation.navigate("Home");
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Feather name="map-pin" size={22} color="#8B1A1A" />
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
            onValueChange={(value) =>
              value
                ? requestLocationPermission()
                : showPermissionRequiredAlert("Location")
            }
            trackColor={{
              false: "#E5E5E5",
              true: "#8B1A1A",
            }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Contacts */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Feather name="users" size={22} color="#8B1A1A" />
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
            onValueChange={(value) =>
              value
                ? requestContactsPermission()
                : showPermissionRequiredAlert("Contacts")
            }
            trackColor={{
              false: "#E5E5E5",
              true: "#8B1A1A",
            }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Feather name="bell" size={22} color="#8B1A1A" />
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
            onValueChange={(value) =>
              value
                ? requestNotificationPermission()
                : showPermissionRequiredAlert("Notification")
            }
            trackColor={{
              false: "#E5E5E5",
              true: "#8B1A1A",
            }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Feather name="shield" size={20} color="#8B1A1A" style={{ marginRight: 10, marginTop: 2 }} />
          <Text style={styles.infoText}>
            We do not access your photos,
            media or full contact list. Bank SMS
            access is not required — we use the
            Account Aggregator framework instead.
          </Text>
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={[
            styles.button,
            !allPermissionsGranted && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!allPermissionsGranted}
        >
          <Text style={styles.buttonText}>
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
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
    backgroundColor: "#8B1A1A",
    height: 65,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,

    shadowColor: "#8B1A1A",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,

    elevation: 10,
  },

  buttonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
});
