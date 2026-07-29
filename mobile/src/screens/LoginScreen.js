import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { AuthContext } from '../navigation/AppNavigator';
import { API_URL, API_KEY, GOOGLE_WEB_CLIENT_ID } from '../api/config';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectUri = makeRedirectUri();
  console.log("GOOGLE OAUTH REDIRECT URI (LoginScreen):", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    responseType: 'id_token',
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const id_token = response.params?.id_token || response.authentication?.idToken;
      if (id_token) {
        handleBackendGoogleLogin(id_token);
      } else {
        Alert.alert('Error', 'No se pudo extraer el id_token');
      }
    } else if (response?.type === 'error') {
      Alert.alert('Error de autenticación', 'Ocurrió un problema con Google Login.');
    }
  }, [response]);

  const handleBackendGoogleLogin = async (idToken) => {
    setGoogleLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({ id_token: idToken })
      });

      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem('userToken', data.access_token);
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        login();
      } else {
        Alert.alert('Error', data.detail || 'No se pudo iniciar sesión con Google.');
      }
    } catch (error) {
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
      console.error(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({ correo: email.trim(), password: password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.access_token);
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        login(); // Actualiza el context para ir a MainApp
      } else {
        let errorMsg = 'Credenciales inválidas';
        if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMsg = data.detail.map(e => e.msg).join('\n');
        } else if (data.detail && typeof data.detail === 'object') {
          errorMsg = JSON.stringify(data.detail);
        }
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Decorative background blur circle simulation */}
          <View style={styles.bgBlob} />

          {/* Logo & Header */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/Logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Organiza. Juega. Gana.</Text>
          </View>

          {/* Card Form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Iniciar Sesión</Text>
            <Text style={styles.cardSubtitle}>Hola de nuevo, ¡te extrañamos!</Text>

            {/* Email Input */}
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={loading || googleLoading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Entrar al juego</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O O O</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity
              style={[styles.googleButton, (googleLoading || !request) && { opacity: 0.7 }]}
              onPress={() => promptAsync()}
              disabled={googleLoading || !request}
            >
              {googleLoading ? (
                <ActivityIndicator color="#111827" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#ea4335" style={{ marginRight: 8 }} />
                  <Text style={styles.googleButtonText}>Continuar con Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>


          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
              <Text style={styles.footerLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcfaff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  bgBlob: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#d9baff',
    opacity: 0.35,
    transform: [{ scaleX: 1.5 }],
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 200,
    height: 200,
    marginBottom: 0,
  },
  tagline: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 0,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(110, 0, 255, 0.05)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    fontWeight: '500',
  },
  inputLabelContainer: {
    width: '100%',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    color: '#6e00ff',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#6e00ff',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 2,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  googleButtonText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    color: '#6e00ff',
    fontWeight: '700',
  },
});

