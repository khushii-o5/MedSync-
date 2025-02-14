
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Store authentication token
import { Ionicons } from "@expo/vector-icons";

import AuthScreen from "./screens/AuthScreen";
import DashboardScreen from "./screens/DashboardScreen";
import PetScreen from "./screens/PetScreen";
import Chatbot from "./screens/chatbot";
import PrescriptionChecklist from "./screens/meds";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Main Tab Navigator (After Login)
const MainApp = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Pet":
              iconName = "paw";
              break;
            case "Chatbot":
              iconName = "chatbubbles";
              break;
              case "meds":
              iconName = "medkit";
              break;
            default:
              iconName = "question-circle";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "#0D47A1",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Pet" component={PetScreen} />
      <Tab.Screen name="meds" component={PrescriptionChecklist} />
      <Tab.Screen name="Chatbot" component={Chatbot} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Check authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken"); // Get stored token
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
      setLoading(false); // Stop loading once check is done
    };
    checkAuth();
  }, []);

  // ✅ Show loading screen until check is complete
  if (loading) {
    return null; // You can add a splash screen here if needed
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">
            {(props) => <AuthScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainApp" component={MainApp} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
