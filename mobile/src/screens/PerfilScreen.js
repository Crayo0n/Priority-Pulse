import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../navigation/AppNavigator';

export default function PerfilScreen() {
  const { logout } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  // Profile data state
  const [nombre, setNombre] = useState('Mauricio');
  const [correo, setCorreo] = useState('mauricio@prioritypulse.com');
  const [tempNombre, setTempNombre] = useState('Mauricio');
  const [tempCorreo, setTempCorreo] = useState('mauricio@prioritypulse.com');

  // Achievements mockup
  const logros = [
    { id: '1', titulo: 'Racha de Bronce', desc: 'Mantén una racha de 7 días consecutivos.', icono: 'flame', color: '#f97316', unlocked: true },
    { id: '2', titulo: 'Hacedor Maestro', desc: 'Completa 100 tareas en total.', icono: 'checkmark-done', color: '#10b981', unlocked: true },
    { id: '3', titulo: 'Madrugador', desc: 'Completa 1 tarea antes de las 7:00 AM.', icono: 'sunny', color: '#eab308', unlocked: true },
    { id: '4', titulo: 'Enfoque Absoluto', desc: 'Completa una rutina completa sin interrupciones.', icono: 'bulb', color: '#a855f7', unlocked: false },
  ];

  const handleOpenEdit = () => {
    setTempNombre(nombre);
    setTempCorreo(correo);
    setModalVisible(true);
  };

  const handleSaveProfile = () => {
    setNombre(tempNombre);
    setCorreo(tempCorreo);
    setModalVisible(false);
    Alert.alert('Éxito', 'Perfil actualizado correctamente.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Banner header decoration */}
        <View style={styles.profileBanner}>
          <View style={styles.bgBlob} />
        </View>

        {/* Profile Avatar & Info Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{nombre.charAt(0).toUpperCase()}</Text>
            <View style={styles.activeIndicator} />
          </View>

          <Text style={styles.profileName}>{nombre}</Text>
          <Text style={styles.profileEmail}>{correo}</Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.editBtn} onPress={handleOpenEdit}>
              <Ionicons name="create-outline" size={16} color="#6e00ff" style={{ marginRight: 4 }} />
              <Text style={styles.editBtnText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Ionicons name="log-out-outline" size={16} color="#ef4444" style={{ marginRight: 4 }} />
              <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid Section */}
        <Text style={styles.sectionTitle}>Tus Estadísticas</Text>
        <View style={styles.statsGrid}>
          {/* Card 1: Level */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f3ebff' }]}>
              <Ionicons name="trophy" size={20} color="#6e00ff" />
            </View>
            <Text style={styles.statVal}>Nivel 4</Text>
            <Text style={styles.statLabel}>Rango Actual</Text>
          </View>

          {/* Card 2: Streak */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="flame" size={20} color="#f97316" />
            </View>
            <Text style={styles.statVal}>12 Días</Text>
            <Text style={styles.statLabel}>Racha de Tareas</Text>
          </View>

          {/* Card 3: Total XP */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="star" size={20} color="#10b981" />
            </View>
            <Text style={styles.statVal}>2,500 XP</Text>
            <Text style={styles.statLabel}>Experiencia Total</Text>
          </View>

          {/* Card 4: Completed Tasks */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="checkbox" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.statVal}>148</Text>
            <Text style={styles.statLabel}>Tareas Completadas</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Logros Desbloqueados</Text>
          
          {logros.map(logro => (
            <View key={logro.id} style={[styles.logroRow, !logro.unlocked && styles.logroLocked]}>
              <View style={[styles.logroIconBox, { backgroundColor: logro.unlocked ? logro.color + '15' : '#f3f4f6' }]}>
                <Ionicons
                  name={logro.unlocked ? logro.icono : 'lock-closed'}
                  size={20}
                  color={logro.unlocked ? logro.color : '#9ca3af'}
                />
              </View>
              <View style={styles.logroTextGroup}>
                <Text style={[styles.logroTitle, !logro.unlocked && styles.logroTitleLocked]}>
                  {logro.titulo}
                </Text>
                <Text style={styles.logroDesc}>{logro.desc}</Text>
              </View>
              {logro.unlocked ? (
                <View style={styles.unlockedBadge}>
                  <Text style={styles.unlockedBadgeText}>Completado</Text>
                </View>
              ) : (
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>Bloqueado</Text>
                </View>
              )}
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Edit Profile Modal Dialog */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Form */}
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Nombre de usuario</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre"
                value={tempNombre}
                onChangeText={setTempNombre}
              />

              <Text style={styles.modalLabel}>Correo electrónico</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                value={tempCorreo}
                onChangeText={setTempCorreo}
              />

              {/* Action Button */}
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveProfile}>
                <Text style={styles.modalSubmitBtnText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcfaff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  profileBanner: {
    height: 120,
    backgroundColor: '#6e00ff',
    overflow: 'hidden',
    position: 'relative',
  },
  bgBlob: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: -50,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f3ebff',
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
  },
  avatarLargeText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#6e00ff',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },
  profileEmail: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6e00ff',
    backgroundColor: '#ffffff',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6e00ff',
  },
  logoutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  achievementsSection: {
    marginTop: 8,
  },
  logroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  logroLocked: {
    opacity: 0.65,
  },
  logroIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logroTextGroup: {
    flex: 1,
    paddingRight: 6,
  },
  logroTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  logroTitleLocked: {
    color: '#6b7280',
  },
  logroDesc: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 14,
  },
  unlockedBadge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 0.5,
    borderColor: '#a7f3d0',
  },
  unlockedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  lockedBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  lockedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalBody: {
    width: '100%',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
  },
  modalSubmitBtn: {
    backgroundColor: '#6e00ff',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSubmitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
