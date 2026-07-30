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
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthContext } from '../navigation/AppNavigator';
import { API_URL, API_KEY, GOOGLE_WEB_CLIENT_ID } from '../api/config';

WebBrowser.maybeCompleteAuthSession();

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export default function RegistroScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignInNative = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.idToken) {
        handleBackendGoogleLogin(userInfo.idToken);
      } else if (userInfo.data?.idToken) {
        // v13+ uses userInfo.data.idToken
        handleBackendGoogleLogin(userInfo.data.idToken);
      } else {
        Alert.alert('Error', 'No se pudo obtener el token de Google');
        setGoogleLoading(false);
      }
    } catch (error) {
      setGoogleLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // already in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services no disponible');
      } else {
        Alert.alert('Error', 'Hubo un problema al conectar con Google.');
        console.error(error);
      }
    }
  };

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
        Alert.alert('Error', data.detail || 'No se pudo registrar/iniciar sesión con Google.');
      }
    } catch (error) {
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
      console.error(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullname || !email || !username || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Crear usuario
      const createRes = await fetch(`${API_URL}/usuarios/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          correo: email.trim(),
          nombre_usuario: username.trim(),
          password: password,
          rol: "user"
        })
      });

      const createData = await createRes.json();
      
      if (!createRes.ok) {
        let errorMsg = 'No se pudo crear la cuenta';
        if (typeof createData.detail === 'string') {
          errorMsg = createData.detail;
        } else if (Array.isArray(createData.detail)) {
          errorMsg = createData.detail.map(e => e.msg).join('\n');
        } else if (createData.detail && typeof createData.detail === 'object') {
          errorMsg = JSON.stringify(createData.detail);
        }
        
        Alert.alert('Error', errorMsg);
        setLoading(false);
        return;
      }

      // 2. Iniciar sesión automáticamente
      const loginRes = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          correo: email.trim(),
          password: password
        })
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        await AsyncStorage.setItem('userToken', loginData.access_token);
        await AsyncStorage.setItem('userData', JSON.stringify(loginData));
        login(); // Actualiza context
      } else {
        Alert.alert('Error', 'Cuenta creada pero no se pudo iniciar sesión. Por favor inicia sesión manualmente.');
        navigation.navigate('Login');
      }
    } catch (error) {
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
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
            <Text style={styles.tagline}>Únete al juego de la productividad</Text>
          </View>

          {/* Card Form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear Cuenta</Text>
            <Text style={styles.cardSubtitle}>Regístrate gratis y sube de nivel hoy</Text>

            <TouchableOpacity
              style={[styles.googleButton, googleLoading && { opacity: 0.7 }]}
              onPress={handleGoogleSignInNative}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#111827" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#ea4335" style={{ marginRight: 8 }} />
                  <Text style={styles.googleButtonText}>Registrarme con Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O REGÍSTRATE CON CORREO</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Fullname Input */}
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre completo"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                value={fullname}
                onChangeText={setFullname}
              />
            </View>

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

            {/* Username/Tag Input */}
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Nombre de usuario (Nametag)</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="at-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Usuario123"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
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
                placeholder="Mínimo 6 caracteres"
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

            {/* Terms and Privacy Policy statement */}
            <View style={styles.legalNoticeContainer}>
              <Text style={styles.legalNoticeText}>
                Al registrarte, aceptas nuestros{' '}
                <Text style={styles.legalLink} onPress={() => navigation.navigate('Terminos')}>
                  Términos de Servicio
                </Text>{' '}
                y{' '}
                <Text style={styles.legalLink} onPress={() => navigation.navigate('Privacidad')}>
                  Política de Privacidad
                </Text>
                .
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading || googleLoading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Registrarme y empezar</Text>
                  <Ionicons name="chevron-forward" size={18} color="#ffffff" style={{ marginLeft: 4 }} />
                </>
              )}
            </TouchableOpacity>
          </View>


          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Inicia sesión</Text>
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
    paddingTop: 30,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  bgBlob: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
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
    fontSize: 13,
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
    marginBottom: 20,
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
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 14,
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
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '700',
    letterSpacing: 1,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    height: 50,
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
    marginTop: 24,
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
  legalNoticeContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  legalNoticeText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  legalLink: {
    color: '#6e00ff',
    fontWeight: '700',
  },
});
