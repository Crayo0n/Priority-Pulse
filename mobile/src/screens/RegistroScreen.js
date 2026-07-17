import React, { useState, useContext } from 'react';
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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../navigation/AppNavigator';

export default function RegistroScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
            <TouchableOpacity style={styles.primaryButton} onPress={login}>
              <Text style={styles.primaryButtonText}>Registrarme y empezar</Text>
              <Ionicons name="chevron-forward" size={18} color="#ffffff" style={{ marginLeft: 4 }} />
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
