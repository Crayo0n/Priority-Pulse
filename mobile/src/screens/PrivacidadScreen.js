import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacidadScreen({ navigation }) {
  const secciones = [
    {
      id: '1',
      titulo: '1. Recolección de Datos',
      icono: 'database-outline',
      color: '#6e00ff',
      contenido: 'Recopilamos información que usted nos proporciona directamente, como cuando crea una cuenta, actualiza su perfil, utiliza las funciones interactivas de nuestros Servicios o se comunica con nosotros. La información que podemos recopilar incluye su nombre, dirección de correo electrónico, contraseña y cualquier otra información que decida proporcionar.'
    },
    {
      id: '2',
      titulo: '2. Uso de la Información',
      icono: 'analytics-outline',
      color: '#3b82f6',
      contenido: 'Utilizamos la información recopilada para diversos fines, principalmente para proporcionar y mantener nuestro Servicio. Esto incluye:\n\n• Notificarle sobre cambios en nuestro Servicio.\n• Permita participar en funciones interactivas.\n• Proporcionar soporte al cliente.\n\nTambién utilizamos los datos para recopilar análisis o información valiosa que nos permita mejorar nuestro Servicio, controlar el uso y prevenir problemas técnicos o de seguridad.'
    },
    {
      id: '3',
      titulo: '3. Protección de Datos',
      icono: 'lock-closed-outline',
      color: '#10b981',
      contenido: 'La seguridad de sus datos es muy importante para nosotros. Nos esforzamos por utilizar medios comercialmente aceptables para proteger sus datos personales, implementando encriptación y protocolos de seguridad robustos.\n\nSin embargo, recuerde que ningún método de transmisión a través de Internet o de almacenamiento electrónico es 100% seguro y no podemos garantizar su seguridad absoluta.'
    },
    {
      id: '4',
      titulo: '4. Compartir Información',
      icono: 'share-social-outline',
      color: '#f59e0b',
      contenido: 'No vendemos, comercializamos ni transferimos a terceros su información de identificación personal. Esto no incluye a los socios de confianza que nos ayudan a operar el sistema, realizar nuestro negocio o brindarle servicio, siempre que acuerden mantener la confidencialidad. También podemos divulgar información para cumplir con la ley, hacer cumplir políticas o proteger derechos y seguridad.'
    },
    {
      id: '5',
      titulo: '5. Derechos del Usuario',
      icono: 'people-outline',
      color: '#ef4444',
      contenido: 'Usted tiene derechos relacionados con su información personal, incluyendo el derecho a acceder, corregir o eliminar los datos personales que tenemos sobre usted. Si desea ejercer alguno de estos derechos, póngase en contacto con nosotros a través de los canales de soporte oficiales.'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidad</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introText}>
            Su privacidad es nuestra prioridad. Entérese de cómo recopilamos, protegemos y gestionamos su información de manera transparente.
          </Text>
        </View>

        {/* Sections */}
        {secciones.map(sec => (
          <View key={sec.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: sec.color + '15' }]}>
                <Ionicons name={sec.icono} size={20} color={sec.color} />
              </View>
              <Text style={styles.cardTitle}>{sec.titulo}</Text>
            </View>
            <Text style={styles.cardContent}>{sec.contenido}</Text>
          </View>
        ))}

        {/* Footer */}
        <TouchableOpacity style={styles.acceptBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.acceptBtnText}>Aceptar y Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcfaff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introContainer: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  introText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  cardContent: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
    fontWeight: '500',
  },
  acceptBtn: {
    backgroundColor: '#6e00ff',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
