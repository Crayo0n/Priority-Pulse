import React, { createContext, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// Screens (we will create these next)
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import InicioScreen from '../screens/InicioScreen';
import ClasificacionScreen from '../screens/ClasificacionScreen';
import PerfilScreen from '../screens/PerfilScreen';
import AjustesNotificacionesScreen from '../screens/AjustesNotificacionesScreen';
import TerminosScreen from '../screens/TerminosScreen';
import PrivacidadScreen from '../screens/PrivacidadScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Mock Auth Context to allow switching between Auth and App screens
export const AuthContext = createContext();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Clasificacion') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6e00ff',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          ...Platform.select({
            ios: {
              height: 88,
              paddingBottom: 28,
            },
            android: {
              height: 68,
              paddingBottom: 12,
            },
            default: {
              height: 60,
              paddingBottom: 8,
            }
          }),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Clasificacion" component={ClasificacionScreen} options={{ title: 'Clasificación' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            // Auth Screens
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Registro" component={RegistroScreen} />
              <Stack.Screen name="Terminos" component={TerminosScreen} />
              <Stack.Screen name="Privacidad" component={PrivacidadScreen} />
            </>
          ) : (
            // Main App Tab Navigator
            <>
              <Stack.Screen name="MainApp" component={AppTabs} />
              <Stack.Screen name="AjustesNotificaciones" component={AjustesNotificacionesScreen} />
              <Stack.Screen name="Terminos" component={TerminosScreen} />
              <Stack.Screen name="Privacidad" component={PrivacidadScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
