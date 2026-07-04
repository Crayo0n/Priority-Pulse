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

export default function TerminosScreen({ navigation }) {
  const secciones = [
    {
      id: '1',
      titulo: '1. Aceptación de los términos',
      icono: 'document-text-outline',
      color: '#6e00ff',
      contenido: 'Al acceder y utilizar Priority Pulse ("el Servicio"), usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de los términos, entonces no podrá acceder al Servicio. Estos términos se aplican a todos los visitantes, usuarios y otras personas que acceden o utilizan el Servicio. Su acceso y uso del Servicio está condicionado a su aceptación y cumplimiento de estos Términos.'
    },
    {
      id: '2',
      titulo: '2. Uso de la plataforma',
      icono: 'desktop-outline',
      color: '#3b82f6',
      contenido: 'Priority Pulse es una herramienta de productividad gamificada. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Acepta asumir la responsabilidad de todas las actividades que ocurran bajo su cuenta.\n\n• No debe usar el servicio para fines ilegales.\n• No debe intentar vulnerar la seguridad del sistema.\n• El uso compartido de cuentas está prohibido.\n\nNos reservamos el derecho de retirar o modificar nuestro servicio, y cualquier servicio o material que proporcionemos, a nuestra entera discreción y sin previo aviso. No seremos responsable si el servicio no está disponible en algún momento.'
    },
    {
      id: '3',
      titulo: '3. Privacidad de datos',
      icono: 'shield-checkmark-outline',
      color: '#10b981',
      contenido: 'Su privacidad es importante para nosotros. Nuestra Política de Privacidad explica cómo recopilamos, usamos y divulgamos información sobre usted. Al utilizar nuestros Servicios, usted acepta que Priority Pulse puede utilizar dichos datos de acuerdo con nuestra política de privacidad.\n\nImplementamos medidas de seguridad diseñadas para proteger su información personal contra pérdidas accidentales y accesos no autorizados. Sin embargo, la seguridad de la información transmitida a través de Internet nunca puede garantizarse al 100%.'
    },
    {
      id: '4',
      titulo: '4. Suscripciones y Pagos',
      icono: 'card-outline',
      color: '#f59e0b',
      contenido: 'Algunas partes del Servicio se facturan mediante suscripción. Se le facturará por adelantado de forma recurrente y periódica ("Ciclo de facturación"). Los ciclos de facturación se establecen de forma mensual o anual, según el tipo de plan de suscripción que seleccione. Al final de cada ciclo de facturación, su suscripción se renovará automáticamente bajo las mismas condiciones exactas a menos que la cancele.'
    },
    {
      id: '5',
      titulo: '5. Terminación',
      icono: 'close-circle-outline',
      color: '#ef4444',
      contenido: 'Podemos cancelar o suspender su cuenta de inmediato, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, si incumple los Términos. Al finalizar, su derecho a utilizar el Servicio cesará inmediatamente. Si desea cancelar su cuenta, simplemente puede dejar de utilizar el Servicio.'
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
        <Text style={styles.headerTitle}>Términos de Servicio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introText}>
            Última actualización: 1 de Julio de 2026. Por favor lea atentamente estos términos de servicio antes de utilizar nuestra aplicación.
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
          <Text style={styles.acceptBtnText}>Entendido y Acepto</Text>
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
    backgroundColor: '#f3ebff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(110, 0, 255, 0.1)',
  },
  introText: {
    fontSize: 13,
    color: '#6e00ff',
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
