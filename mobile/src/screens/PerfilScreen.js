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
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function PerfilScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileTab, setProfileTab] = useState('actividad'); // 'actividad' | 'logros'

  // Profile data state
  const [nombre, setNombre] = useState('Mauricio Rodríguez');
  const [username, setUsername] = useState('mauricio_rod');
  const [correo, setCorreo] = useState('mauricio@prioritypulse.com');
  const [tempNombre, setTempNombre] = useState('Mauricio Rodríguez');
  const [tempUsername, setTempUsername] = useState('mauricio_rod');
  const [tempCorreo, setTempCorreo] = useState('mauricio@prioritypulse.com');

  // Password Change modal states
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Helper generator to simulate contribution activity heatmap grid
  const generateMockHeatmap = () => {
    const intensities = ['#f3f4f6', '#e9d5ff', '#d8b4fe', '#a855f7', '#7c3aed', '#5b21b6'];
    const columns = [];
    for (let c = 0; c < 26; c++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const val = Math.floor(Math.random() * intensities.length);
        days.push(intensities[val]);
      }
      columns.push(days);
    }
    return columns;
  };
  const [heatmapData] = useState(generateMockHeatmap());

  const [friendModalVisible, setFriendModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [amigos, setAmigos] = useState([
    {
      id: '1',
      nombre: 'Sarah Jenkins',
      rango: 'NIVEL 8 EXPLORADORA',
      avatarText: 'SJ',
      racha: 8,
      rachaTexto: '¡Está en llamas!',
      tareasTotales: '842',
      horasFoco: '315h',
      meGusta: false
    },
    {
      id: '2',
      nombre: 'Carlos Diaz',
      rango: 'NIVEL 5 INICIADO',
      avatarText: 'CD',
      racha: 0,
      rachaTexto: 'Sin racha activa',
      tareasTotales: '120',
      horasFoco: '45h',
      meGusta: false
    }
  ]);

  // Achievements mockup
  const logros = [
    { id: '1', titulo: 'Racha de Bronce', desc: 'Mantén una racha de 7 días consecutivos.', icono: 'flame', color: '#f97316', unlocked: true },
    { id: '2', titulo: 'Hacedor Maestro', desc: 'Completa 100 tareas en total.', icono: 'checkmark-done', color: '#10b981', unlocked: true },
    { id: '3', titulo: 'Madrugador', desc: 'Completa 1 tarea antes de las 7:00 AM.', icono: 'sunny', color: '#eab308', unlocked: true },
    { id: '4', titulo: 'Enfoque Absoluto', desc: 'Completa una rutina completa sin interrupciones.', icono: 'bulb', color: '#a855f7', unlocked: false },
  ];

  const handleOpenEdit = () => {
    setTempNombre(nombre);
    setTempUsername(username);
    setTempCorreo(correo);
    setModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (!tempNombre.trim() || !tempUsername.trim() || !tempCorreo.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    setNombre(tempNombre);
    setUsername(tempUsername);
    setCorreo(tempCorreo);
    setModalVisible(false);
    Alert.alert('Éxito', 'Perfil actualizado correctamente.');
  };

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      // Ignorar error si no había sesión activa en Google
    }
    logout();
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
          <Text style={styles.profileUsername}>@{username}</Text>
          <Text style={styles.profileSubtitle}>Lvl 12 Arquitecto de Enfoque • Miembro desde Ene 2026</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItemHeader}>
              <Text style={styles.statNumberHeader}>1,248</Text>
              <Text style={styles.statLabelHeader}>Tareas</Text>
            </View>
            <View style={styles.statItemHeader}>
              <Text style={styles.statNumberHeader}>{amigos.length}</Text>
              <Text style={styles.statLabelHeader}>Amigos</Text>
            </View>
            <View style={styles.statItemHeader}>
              <Text style={styles.statNumberHeader}>12</Text>
              <Text style={styles.statLabelHeader}>Racha</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.editBtn} onPress={handleOpenEdit}>
              <Ionicons name="create-outline" size={16} color="#6e00ff" style={{ marginRight: 4 }} />
              <Text style={styles.editBtnText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={16} color="#ef4444" style={{ marginRight: 4 }} />
              <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sub-tabs Selector */}
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTabButton, profileTab === 'actividad' && styles.subTabButtonActive]}
            onPress={() => setProfileTab('actividad')}
          >
            <Ionicons
              name="stats-chart"
              size={16}
              color={profileTab === 'actividad' ? '#6e00ff' : '#6b7280'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.subTabText, profileTab === 'actividad' && styles.subTabTextActive]}>
              Actividad
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabButton, profileTab === 'logros' && styles.subTabButtonActive]}
            onPress={() => setProfileTab('logros')}
          >
            <Ionicons
              name="trophy"
              size={16}
              color={profileTab === 'logros' ? '#6e00ff' : '#6b7280'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.subTabText, profileTab === 'logros' && styles.subTabTextActive]}>
              Logros
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content Render */}
        {profileTab === 'actividad' ? (
          <View style={styles.tabContent}>
            
            {/* Streak Widget */}
            <View style={styles.darkStreakCard}>
              <View style={styles.streakCardHeader}>
                <Ionicons name="flame" size={24} color="#f97316" />
                <Text style={styles.streakCardTitle}>Racha Actual</Text>
              </View>
              <Text style={styles.streakCardVal}>0 Días</Text>
              <Text style={styles.streakCardSubtitle}>Actual Racha de Focus</Text>
              <View style={styles.streakProgressBg}>
                <View style={[styles.streakProgressFill, { width: '10%' }]} />
              </View>
              <Text style={styles.streakProgressText}>5 días de Impasible</Text>
            </View>

            {/* Medallas & Resumen Widgets Row */}
            <View style={styles.widgetsGrid}>
              
              {/* Medallas Widget */}
              <View style={styles.widgetCard}>
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetTitle}>Medallas</Text>
                  <Text style={styles.widgetLink}>Ver todas</Text>
                </View>
                <View style={styles.medalsRow}>
                  <View style={styles.medalItem}>
                    <View style={[styles.medalIconBox, { backgroundColor: '#fefbeb' }]}>
                      <Ionicons name="sunny" size={20} color="#eab308" />
                    </View>
                    <Text style={styles.medalLabel}>Madrugador</Text>
                  </View>
                  <View style={styles.medalItem}>
                    <View style={[styles.medalIconBox, { backgroundColor: '#f5f3ff' }]}>
                      <Ionicons name="ribbon" size={20} color="#8b5cf6" />
                    </View>
                    <Text style={styles.medalLabel}>Trabajador</Text>
                  </View>
                  <View style={styles.medalItem}>
                    <View style={[styles.medalIconBox, { backgroundColor: '#eff6ff' }]}>
                      <Ionicons name="rocket" size={20} color="#3b82f6" />
                    </View>
                    <Text style={styles.medalLabel}>Organizador</Text>
                  </View>
                </View>
              </View>

              {/* Resumen de Actividad Widget */}
              <View style={styles.widgetCard}>
                <Text style={styles.widgetTitle}>Resumen de Actividad</Text>
                <View style={styles.resumenRow}>
                  <View style={styles.resumenIconBox}>
                    <Ionicons name="checkmark-circle" size={26} color="#10b981" />
                  </View>
                  <View>
                    <Text style={styles.resumenLabel}>TOTAL DE ACTIVIDADES</Text>
                    <Text style={styles.resumenVal}>1,248</Text>
                  </View>
                </View>
              </View>

            </View>

            {/* Actividad Heatmap Section */}
            <View style={styles.heatmapCard}>
              <View style={styles.heatmapHeader}>
                <Text style={styles.heatmapTitle}>Actividad</Text>
                <Text style={styles.heatmapSubtitle}>1,248 contribuciones en el año anterior</Text>
              </View>

              <View style={styles.heatmapLayout}>
                {/* Weekday labels */}
                <View style={styles.weekdayLabelsColumn}>
                  <Text style={styles.weekdayLabel}>Lun</Text>
                  <Text style={styles.weekdayLabel}>Mar</Text>
                  <Text style={styles.weekdayLabel}>Mie</Text>
                  <Text style={styles.weekdayLabel}>Jue</Text>
                  <Text style={styles.weekdayLabel}>Vie</Text>
                  <Text style={styles.weekdayLabel}>Sab</Text>
                  <Text style={styles.weekdayLabel}>Dom</Text>
                </View>

                {/* Heatmap Grid */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={styles.heatmapGridRow}>
                    {heatmapData.map((col, cIdx) => (
                      <View key={cIdx} style={styles.heatmapColumn}>
                        {col.map((color, dIdx) => (
                          <View key={dIdx} style={[styles.heatmapSquare, { backgroundColor: color }]} />
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Heatmap Legend */}
              <View style={styles.heatmapLegend}>
                <Text style={styles.legendText}>Menos</Text>
                {['#f3f4f6', '#e9d5ff', '#d8b4fe', '#a855f7', '#7c3aed', '#5b21b6'].map((col, idx) => (
                  <View key={idx} style={[styles.legendSquare, { backgroundColor: col }]} />
                ))}
                <Text style={styles.legendText}>Más</Text>
              </View>
            </View>

            {/* Amigos List */}
            <View style={styles.friendsCard}>
              <Text style={styles.friendsCardTitle}>Amigos</Text>
              
              {amigos.map((amigo, idx) => (
                <View key={amigo.id}>
                  {idx > 0 && <View style={styles.friendDivider} />}
                  <View style={styles.friendRow}>
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendAvatarText}>{amigo.avatarText}</Text>
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{amigo.nombre}</Text>
                      {amigo.racha > 0 ? (
                        <Text style={styles.friendStreakActive}>🔥 {amigo.racha} DÍAS DE RACHA</Text>
                      ) : (
                        <Text style={styles.friendStreakInactive}>SIN RACHA</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedFriend(amigo);
                        setFriendModalVisible(true);
                      }}
                    >
                      <Text style={styles.friendLink}>Ver Perfil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

          </View>
        ) : (
          <View style={styles.tabContent}>
            
            {/* Stats Grid Section */}
            <Text style={styles.sectionTitle}>Tus Estadísticas</Text>
            <View style={styles.statsGrid}>
              {/* Card 1: Level */}
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#f3ebff' }]}>
                  <Ionicons name="trophy" size={20} color="#6e00ff" />
                </View>
                <Text style={styles.statVal}>Nivel 12</Text>
                <Text style={styles.statLabel}>Arquitecto de Enfoque</Text>
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
                <Text style={styles.statVal}>28,000 XP</Text>
                <Text style={styles.statLabel}>Experiencia Total</Text>
              </View>

              {/* Card 4: Completed Tasks */}
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="checkbox" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.statVal}>1,248</Text>
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
            {/* Ajustes y Soporte Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Ajustes y Legal</Text>
              
              <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('AjustesNotificaciones')}>
                <View style={styles.settingRowLeft}>
                  <View style={[styles.settingIconBox, { backgroundColor: '#f3ebff' }]}>
                    <Ionicons name="notifications" size={18} color="#6e00ff" />
                  </View>
                  <Text style={styles.settingRowLabel}>Ajustes de Notificaciones</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Terminos')}>
                <View style={styles.settingRowLeft}>
                  <View style={[styles.settingIconBox, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="document-text" size={18} color="#3b82f6" />
                  </View>
                  <Text style={styles.settingRowLabel}>Términos de Servicio</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Privacidad')}>
                <View style={styles.settingRowLeft}>
                  <View style={[styles.settingIconBox, { backgroundColor: '#ecfdf5' }]}>
                    <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                  </View>
                  <Text style={styles.settingRowLabel}>Política de Privacidad</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>

          </View>
        )}

      </ScrollView>

      {/* Edit Profile Modal Dialog */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Form */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              
              {/* Photo Selector Mock */}
              <View style={styles.photoSelectorContainer}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarLargeText}>{tempNombre.charAt(0).toUpperCase()}</Text>
                  <TouchableOpacity style={styles.cameraBadge} onPress={() => Alert.alert('Cambiar Foto', 'Selecciona una imagen de tu galería.')}>
                    <Ionicons name="camera" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.photoSelectorLabel}>Tu Foto</Text>
              </View>

              <Text style={styles.modalLabel}>Nombre Completo</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre Completo"
                value={tempNombre}
                onChangeText={setTempNombre}
              />

              <Text style={styles.modalLabel}>Nombre de Usuario</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre de Usuario"
                value={tempUsername}
                onChangeText={setTempUsername}
                autoCapitalize="none"
              />

              <Text style={styles.modalLabel}>Correo Electrónico</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                value={tempCorreo}
                onChangeText={setTempCorreo}
              />

              {/* Password Section */}
              <Text style={[styles.modalLabel, { marginTop: 10 }]}>Seguridad</Text>
              <TouchableOpacity
                style={styles.changePwdTriggerBtn}
                onPress={() => {
                  setCurrentPwd('');
                  setNewPwd('');
                  setConfirmNewPwd('');
                  setPwdModalVisible(true);
                }}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#6e00ff" style={{ marginRight: 8 }} />
                <Text style={styles.changePwdTriggerBtnText}>Cambiar Contraseña</Text>
                <Ionicons name="chevron-forward" size={16} color="#6e00ff" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              {/* Action Button */}
              <TouchableOpacity style={[styles.modalSubmitBtn, { marginTop: 24, marginBottom: 20 }]} onPress={handleSaveProfile}>
                <Text style={styles.modalSubmitBtnText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={pwdModalVisible}
        onRequestClose={() => setPwdModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.modalTitle, { fontSize: 20, color: '#6e00ff' }]}>Cambiar Contraseña</Text>
                <Text style={styles.pwdModalSubtitle}>
                  Asegúrate de que tu nueva contraseña sea segura y fácil de recordar.
                </Text>
              </View>
              <TouchableOpacity style={styles.pwdCloseIcon} onPress={() => setPwdModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Modal Form Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              
              {/* Contraseña Actual */}
              <Text style={styles.modalLabel}>CONTRASEÑA ACTUAL</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="********"
                  secureTextEntry={!showCurrentPwd}
                  value={currentPwd}
                  onChangeText={setCurrentPwd}
                />
                <TouchableOpacity onPress={() => setShowCurrentPwd(!showCurrentPwd)} style={styles.passwordEyeBtn}>
                  <Ionicons name={showCurrentPwd ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Nueva Contraseña */}
              <Text style={styles.modalLabel}>NUEVA CONTRASEÑA</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ingresa nueva contraseña"
                  secureTextEntry={!showNewPwd}
                  value={newPwd}
                  onChangeText={setNewPwd}
                />
                <TouchableOpacity onPress={() => setShowNewPwd(!showNewPwd)} style={styles.passwordEyeBtn}>
                  <Ionicons name={showNewPwd ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Confirmar Nueva Contraseña */}
              <Text style={styles.modalLabel}>CONFIRMAR NUEVA CONTRASEÑA</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Repite nueva contraseña"
                  secureTextEntry={!showConfirmPwd}
                  value={confirmNewPwd}
                  onChangeText={setConfirmNewPwd}
                />
                <TouchableOpacity onPress={() => setShowConfirmPwd(!showConfirmPwd)} style={styles.passwordEyeBtn}>
                  <Ionicons name={showConfirmPwd ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Info Warning Box */}
              <View style={styles.pwdInfoBox}>
                <Ionicons name="information-circle-outline" size={18} color="#2563eb" style={{ marginRight: 8, marginTop: 1 }} />
                <Text style={styles.pwdInfoBoxText}>La contraseña debe tener al menos 8 caracteres.</Text>
              </View>

              {/* Actions row */}
              <View style={styles.pwdActionsRow}>
                <TouchableOpacity
                  style={styles.pwdCancelBtn}
                  onPress={() => setPwdModalVisible(false)}
                >
                  <Text style={styles.pwdCancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pwdSubmitBtn}
                  onPress={() => {
                    if (!currentPwd) {
                      Alert.alert('Error', 'Ingresa tu contraseña actual.');
                      return;
                    }
                    if (newPwd.length < 8) {
                      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres.');
                      return;
                    }
                    if (newPwd !== confirmNewPwd) {
                      Alert.alert('Error', 'La nueva contraseña y su confirmación no coinciden.');
                      return;
                    }
                    Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
                    setPwdModalVisible(false);
                  }}
                >
                  <Text style={styles.pwdSubmitBtnText}>Actualizar Contraseña</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Friend Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={friendModalVisible}
        onRequestClose={() => setFriendModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: 28 }]}>
            
            {/* Close Button */}
            <TouchableOpacity
              style={styles.friendModalClose}
              onPress={() => setFriendModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>

            {selectedFriend && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                
                {/* Avatar */}
                <View style={[styles.avatarLarge, { marginTop: 10 }]}>
                  <Text style={styles.avatarLargeText}>{selectedFriend.avatarText}</Text>
                  <View style={styles.activeIndicator} />
                </View>

                {/* Name */}
                <Text style={[styles.profileName, { marginTop: 16 }]}>{selectedFriend.nombre}</Text>
                
                {/* Level badge */}
                <View style={styles.friendLvlBadge}>
                  <Text style={styles.friendLvlBadgeText}>{selectedFriend.rango}</Text>
                </View>

                {/* Flame / Streak */}
                <View style={styles.friendStreakContainer}>
                  <View style={styles.friendStreakIconBox}>
                    <Ionicons name="flame" size={20} color="#ea580c" />
                  </View>
                  <Text style={styles.friendStreakVal}>
                    {selectedFriend.racha > 0 ? `Racha de ${selectedFriend.racha} Días` : 'Sin Racha'}
                  </Text>
                  <Text style={styles.friendStreakSub}>{selectedFriend.rachaTexto}</Text>
                </View>

                {/* Perf Stats Title */}
                <Text style={styles.perfStatsTitle}>ESTADÍSTICAS DE RENDIMIENTO</Text>

                {/* Stats Cards Row */}
                <View style={styles.perfStatsRow}>
                  {/* Card 1: Tareas */}
                  <View style={styles.perfStatCard}>
                    <View style={[styles.perfStatIconBox, { backgroundColor: '#eff6ff' }]}>
                      <Ionicons name="checkmark" size={16} color="#3b82f6" />
                    </View>
                    <Text style={styles.perfStatVal}>{selectedFriend.tareasTotales}</Text>
                    <Text style={styles.perfStatLabel}>Tareas Totales</Text>
                  </View>

                  {/* Card 2: Horas */}
                  <View style={styles.perfStatCard}>
                    <View style={[styles.perfStatIconBox, { backgroundColor: '#f5f3ff' }]}>
                      <Ionicons name="time" size={16} color="#8b5cf6" />
                    </View>
                    <Text style={styles.perfStatVal}>{selectedFriend.horasFoco}</Text>
                    <Text style={styles.perfStatLabel}>Horas de Foco</Text>
                  </View>
                </View>

                {/* Like Button */}
                <TouchableOpacity
                  style={[
                    styles.likeFriendBtn,
                    selectedFriend.meGusta && styles.likeFriendBtnLiked
                  ]}
                  onPress={() => {
                    const updatedAmigos = amigos.map(a => {
                      if (a.id === selectedFriend.id) {
                        return { ...a, meGusta: !a.meGusta };
                      }
                      return a;
                    });
                    setAmigos(updatedAmigos);
                    setSelectedFriend(prev => ({ ...prev, meGusta: !prev.meGusta }));
                  }}
                >
                  <Ionicons
                    name={selectedFriend.meGusta ? "heart" : "heart-outline"}
                    size={18}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.likeFriendBtnText}>
                    {selectedFriend.meGusta ? 'Te Gusta' : 'Dar Me Gusta'}
                  </Text>
                </TouchableOpacity>

              </View>
            )}

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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    fontSize: 20,
    fontWeight: '850',
    color: '#111827',
    marginTop: 12,
  },
  profileSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 32,
  },
  statItemHeader: {
    alignItems: 'center',
  },
  statNumberHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statLabelHeader: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
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
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  subTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  subTabButtonActive: {
    backgroundColor: '#f3ebff',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  subTabTextActive: {
    color: '#6e00ff',
  },
  tabContent: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  darkStreakCard: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 16,
  },
  streakCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  streakCardVal: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 12,
  },
  streakCardSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    marginTop: 2,
  },
  streakProgressBg: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 3,
  },
  streakProgressText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  widgetsGrid: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  widgetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  widgetLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6e00ff',
  },
  medalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  medalItem: {
    alignItems: 'center',
  },
  medalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  medalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
  },
  resumenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  resumenIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resumenLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
  resumenVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  heatmapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 16,
  },
  heatmapHeader: {
    marginBottom: 16,
  },
  heatmapTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  heatmapSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  heatmapLayout: {
    flexDirection: 'row',
  },
  weekdayLabelsColumn: {
    justifyContent: 'space-between',
    marginRight: 10,
    paddingVertical: 1,
  },
  weekdayLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9ca3af',
    height: 10,
    lineHeight: 10,
  },
  heatmapGridRow: {
    flexDirection: 'row',
    gap: 3,
  },
  heatmapColumn: {
    flexDirection: 'column',
    gap: 3,
  },
  heatmapSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    marginHorizontal: 2,
  },
  friendsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 16,
  },
  friendsCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3ebff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6e00ff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  friendStreakActive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ea580c',
    marginTop: 2,
  },
  friendStreakInactive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: 2,
  },
  friendLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
  },
  friendDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
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
    fontSize: 15,
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
  settingsSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingRowLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  friendModalClose: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
  },
  friendLvlBadge: {
    backgroundColor: '#f3ebff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  friendLvlBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6e00ff',
    letterSpacing: 0.5,
  },
  friendStreakContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  friendStreakIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  friendStreakVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
  },
  friendStreakSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 2,
  },
  perfStatsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  perfStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    gap: 12,
  },
  perfStatCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  perfStatIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  perfStatVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
  },
  perfStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 2,
  },
  likeFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6e00ff',
    borderRadius: 14,
    height: 48,
    width: '100%',
    marginTop: 24,
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  likeFriendBtnLiked: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  likeFriendBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '850',
  },
  profileUsername: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  photoSelectorContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoSelectorLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
    marginTop: 8,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6e00ff',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePwdTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3ebff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    marginTop: 4,
  },
  changePwdTriggerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6e00ff',
  },
  pwdModalSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  pwdCloseIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    height: 48,
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  passwordEyeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pwdInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  pwdInfoBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 16,
    fontWeight: '600',
  },
  pwdActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
    gap: 12,
  },
  pwdCancelBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pwdCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4b5563',
  },
  pwdSubmitBtn: {
    flex: 2,
    height: 48,
    backgroundColor: '#6e00ff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  pwdSubmitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '850',
  },
});
