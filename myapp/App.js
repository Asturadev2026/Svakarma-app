import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import OtpScreen from "./screens/OtpScreen";
import PermissionsScreen from "./screens/PermissionsScreen";


import MainTabs from "./navigation/MainTabs";
import ApplyLoanScreen from "./screens/ApplyLoanScreen";
import CibilScreen from "./screens/CibilScreen";
import EMICalculatorScreen from "./screens/EMICalculatorScreen";
import ApplicationStatusScreen from "./screens/ApplicationStatusScreen";
import ReferScreen from "./screens/ReferScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="OTP"
          component={OtpScreen}
        />

        <Stack.Screen
          name="Permissions"
          component={PermissionsScreen}
        />

        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
        />
        <Stack.Screen
          name="ApplyLoan"
          component={ApplyLoanScreen}
        />

        <Stack.Screen
          name="CIBIL"
          component={CibilScreen}
        />

        <Stack.Screen
          name="EMICalculator"
          component={EMICalculatorScreen}
        />
        <Stack.Screen
          name="Refer"
          component={ReferScreen}
        />

        <Stack.Screen
          name="ApplicationStatus"
          component={ApplicationStatusScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}