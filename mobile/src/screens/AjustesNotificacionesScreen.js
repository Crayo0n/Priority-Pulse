import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AjustesNotificacionesScreen({ navigation }) {
  // Canales State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [appEnabled, setAppEnabled] = useState(true);

  // Eventos State
  const [rachaEnabled, setRachaEnabled] = useState(true);
  const [rachaFreq, setRachaFreq] = useState('Instantáneo'); // 'Instantáneo' | 'Diario'

  const [logrosEnabled, setLogrosEnabled] = useState(true);
  const [logrosFreq, setLogrosFreq] = useState('Instantáneo'); // 'Instantáneo' | 'Semanal'

  const [amigosEnabled, setAmigosEnabled] = useState(true);
  const [amigosFreq, setAmigosFreq] = useState('Instantáneo'); // 'Instantáneo' | 'Diario'

  const [iaEnabled, setIaEnabled] = useState(true);
  const [iaFreq, setIaFreq] = useState('Diario'); // 'Diario' | 'Semanal'

  const handleSave = () => {
    Alert.alert(
      'Ajustes Guardados',
      'Tus preferencias de notificaciones han sido actualizadas con éxito.',
      [{ text: 'Excelente', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave}>
          <Text style={styles.saveHeaderBtnText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Canales de Notificación</Text>
        <Text style={styles.sectionSubtitle}>Elige por qué medios deseas recibir actualizaciones importantes.</Text>

        <View style={styles.card}>
          {/* Canales: Push */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#f3ebff' }]}>
                <Ionicons name="notifications-outline" size={20} color="#6e00ff" />
              </View>
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowTitle}>Notificaciones Push</Text>
                <Text style={styles.rowDesc}>Alertas en tu celular y barra de estado</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#e5e7eb', true: '#c084fc' }}
              thumbColor={pushEnabled ? '#6e00ff' : '#f3f4f6'}
            />
          </View>

          <View style={styles.divider} />

          {/* Canales: Email */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="mail-outline" size={20} color="#3b82f6" />
              </View>
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowTitle}>Correo Electrónico</Text>
                <Text style={styles.rowDesc}>Resúmenes semanales e invitaciones</Text>
              </View>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={emailEnabled ? '#3b82f6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.divider} />

          {/* Canales: App */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                <Ionicons name="apps-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowTitle}>Dentro de la App</Text>
                <Text style={styles.rowDesc}>Burbujas e historial de alertas internas</Text>
              </View>
            </View>
            <Switch
              value={appEnabled}
              onValueChange={setAppEnabled}
              trackColor={{ false: '#e5e7eb', true: '#a7f3d0' }}
              thumbColor={appEnabled ? '#10b981' : '#f3f4f6'}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Eventos y Disparadores</Text>
        <Text style={styles.sectionSubtitle}>Personaliza qué eventos generan alertas y su frecuencia.</Text>

        {/* Event 1: Racha */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                <Ionicons name="flame-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowTitle}>Racha en peligro</Text>
                <Text style={styles.rowDesc}>Aviso cuando estés por perder la racha</Text>
              </View>
            </View>
            <Switch
              value={rachaEnabled}
              onValueChange={setRachaEnabled}
              trackColor={{ false: '#e5e7eb', true: '#ffedd5' }}
              thumbColor={rachaEnabled ? '#f97316' : '#f3f4f6'}
            />
          </View>
          {rachaEnabled && (
            <View style={styles.frequencyRow}>
              <Text style={styles.freqLabel}>Frecuencia:</Text>
              <View style={styles.freqPills}>
                {['Instantáneo', 'Diario'].map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.freqPill, rachaFreq === f && styles.freqPillActive]}
                    onPress={() => setRachaFreq(f)}
                  >
                    <Text style={[styles.freqPillText, rachaFreq === f && styles.freqPillTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Event 2: Logros */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fef9c3' }]}>
                <Ionicons name="trophy-outline" size={20} color="#ca8a04" />
              </View>
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowTitle}>Nuevos logros</Text>
                <Text style={styles.rowDesc}>Al subir de nivel u obtener medallas</Text>
              </View>
            </View>
            <Switch
              value={logrosEnabled}
              onValueChange={setLogrosEnabled}
              trackColor={{ false: '#e5e7eb', true: '#fef08a' }}
              thumbColor={logrosEnabled ? '#ca8a04' : '#f3f4f6'}
            />
          </View>
          {logrosEnabled && (
            <View style={styles.frequencyRow}>
              <Text style={styles.freqLabel}>Frecuencia:</Text>
              <View style={styles.freqPills}>
                {['Instantáneo', 'Semanal'].map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.freqPill, logrosFreq === f && styles.freqPillActive]}
                    onPress={() => setLogrosFreq(f)}
                  >
                    <Text style={[styles.freqPillText, logrosFreq === f && styles.freqPillTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Event 3: Amigos */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fdf2f8' }]}>
                <Ionicons name="people-outline" size={20} color="#db2777" />
              </View>
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowTitle}>Actividad de amigos</Text>
                <Text style={styles.rowDesc}>Likes, retos y nuevos seguidores</Text>
              </View>
            </View>
            <Switch
              value={amigosEnabled}
              onValueChange={setAmigosEnabled}
              trackColor={{ false: '#e5e7eb', true: '#fbcfe8' }}
              thumbColor={amigosEnabled ? '#db2777' : '#f3f4f6'}
            />
          </View>
          {amigosEnabled && (
            <View style={styles.frequencyRow}>
              <Text style={styles.freqLabel}>Frecuencia:</Text>
              <View style={styles.freqPills}>
                {['Instantáneo', 'Diario'].map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.freqPill, amigosFreq === f && styles.freqPillActive]}
                    onPress={() => setAmigosFreq(f)}
                  >
                    <Text style={[styles.freqPillText, amigosFreq === f && styles.freqPillTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Event 4: IA */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#f3ebff' }]}>
                <Ionicons name="sparkles-outline" size={20} color="#6e00ff" />
              </View>
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowTitle}>Recordatorios de IA</Text>
                <Text style={styles.rowDesc}>Sugerencias inteligentes basadas en hábitos</Text>
              </View>
            </View>
            <Switch
              value={iaEnabled}
              onValueChange={setIaEnabled}
              trackColor={{ false: '#e5e7eb', true: '#c084fc' }}
              thumbColor={iaEnabled ? '#6e00ff' : '#f3f4f6'}
            />
          </View>
          {iaEnabled && (
            <View style={styles.frequencyRow}>
              <Text style={styles.freqLabel}>Frecuencia:</Text>
              <View style={styles.freqPills}>
                {['Diario', 'Semanal'].map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.freqPill, iaFreq === f && styles.freqPillActive]}
                    onPress={() => setIaFreq(f)}
                  >
                    <Text style={[styles.freqPillText, iaFreq === f && styles.freqPillTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar Ajustes</Text>
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
  saveHeaderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3ebff',
    borderRadius: 12,
  },
  saveHeaderBtnText: {
    color: '#6e00ff',
    fontSize: 14,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTextGroup: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  rowDesc: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 14,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
  },
  freqLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  freqPills: {
    flexDirection: 'row',
    gap: 8,
  },
  freqPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  freqPillActive: {
    backgroundColor: '#6e00ff',
  },
  freqPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
  },
  freqPillTextActive: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: '#6e00ff',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
