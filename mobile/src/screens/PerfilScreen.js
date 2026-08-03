import React, { useState, useEffect, useContext } from 'react';
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
  Platform,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { API_URL, API_KEY } from '../api/config';
import * as ImagePicker from 'expo-image-picker';

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
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        const token = await AsyncStorage.getItem('userToken');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserData(parsed);
          setNombre(parsed.nombre || parsed.nombre_usuario || '');
          setUsername(parsed.nombre_usuario || '');
          setCorreo(parsed.correo || '');
          
          if (parsed.id) {
            const response = await fetch(`${API_URL}/usuarios/${parsed.id}`, {
              headers: { 
                'x-api-key': API_KEY,
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const freshData = await response.json();
              setUserData(freshData);
              setNombre(freshData.nombre || freshData.nombre_usuario || '');
              setUsername(freshData.nombre_usuario || '');
              setCorreo(freshData.correo || '');
              await AsyncStorage.setItem('userData', JSON.stringify(freshData));
              
              // Fetch Medallas
              try {
                const medallasRes = await fetch(`${API_URL}/medallas`, {
                  headers: { 'x-api-key': API_KEY, 'Authorization': `Bearer ${token}` }
                });
                const misMedallasRes = await fetch(`${API_URL}/medallas/usuario/${parsed.id}`, {
                  headers: { 'x-api-key': API_KEY, 'Authorization': `Bearer ${token}` }
                });
                if (medallasRes.ok && misMedallasRes.ok) {
                  const todas = await medallasRes.json();
                  const mias = await misMedallasRes.json();
                  const unlockedIds = mias.map(m => m.medalla_id);
                  
                  const formatedMedals = todas.map(m => ({
                    id: String(m.id),
                    titulo: m.nombre,
                    desc: m.descripcion,
                    icono: m.url_icono || 'trophy',
                    color: m.valor_requerido > 50 ? '#f97316' : (m.valor_requerido > 10 ? '#10b981' : '#a855f7'),
                    unlocked: unlockedIds.includes(m.id)
                  }));
                  setLogros(formatedMedals);
                }
              } catch (e) { console.error("Error fetching medals", e); }

              // Fetch Amigos
              try {
                const amigosRes = await fetch(`${API_URL}/amistades/usuario/${parsed.id}`, {
                  headers: { 'x-api-key': API_KEY, 'Authorization': `Bearer ${token}` }
                });
                if (amigosRes.ok) {
                  const listAmigos = await amigosRes.json();
                  const aceptadas = listAmigos.filter(a => a.estado === 'aceptada');
                  const pendientes = listAmigos.filter(a => a.estado === 'pendiente' && a.usuario_id_2 === parsed.id);
                  
                  const friendsData = await Promise.all(
                    aceptadas.map(a => {
                      const fid = a.usuario_id_1 === parsed.id ? a.usuario_id_2 : a.usuario_id_1;
                      return fetch(`${API_URL}/usuarios/${fid}`, {
                        headers: { 'x-api-key': API_KEY, 'Authorization': `Bearer ${token}` }
                      }).then(r => r.json()).then(u => ({ ...u, amistad_id: a.id }));
                    })
                  );
                  
                  const formattedFriends = friendsData.map(f => ({
                    id: String(f.id),
                    amistad_id: f.amistad_id,
                    nombre: f.nombre_usuario,
                    rango: f.nivel_actual ? `Lvl ${f.nivel_actual.numero_nivel} ${f.nivel_actual.nombre}` : 'Iniciado',
                    avatarText: f.nombre_usuario.substring(0, 2).toUpperCase(),
                    racha: f.racha_actual,
                    rachaTexto: f.racha_actual > 0 ? '¡Está en llamas!' : 'Sin racha activa',
                    tareasTotales: Math.floor(f.xp_total / 50),
                    horasFoco: Math.floor(f.xp_total / 100),
                    meGusta: false,
                    raw: f
                  }));
                  setAmigos(formattedFriends);

                  const solicitudesData = await Promise.all(
                    pendientes.map(p => fetch(`${API_URL}/usuarios/${p.usuario_id_1}`, {
                      headers: { 'x-api-key': API_KEY, 'Authorization': `Bearer ${token}` }
                    }).then(r => r.json()).then(u => ({ ...u, amistad_id: p.id })))
                  );
                  const formattedSolicitudes = solicitudesData.map(f => ({
                    id: String(f.id),
                    amistad_id: f.amistad_id,
                    nombre: f.nombre_usuario,
                    avatarText: f.nombre_usuario.substring(0, 2).toUpperCase()
                  }));
                  setSolicitudesPendientes(formattedSolicitudes);
                }
              } catch (e) { console.error("Error fetching friends", e); }

              // Fetch Tareas for Heatmap
              try {
                const tareasRes = await fetch(`${API_URL}/tareas/usuario/${parsed.id}`, {
                  headers: { 'x-api-key': API_KEY, 'Authorization': `Bearer ${token}` }
                });
                if (tareasRes.ok) {
                  const tareasData = await tareasRes.json();
                  const cal = {};
                  tareasData.forEach(t => {
                    if (t.fecha_limite) {
                      const dateStr = t.fecha_limite.substring(0, 10);
                      cal[dateStr] = (cal[dateStr] || 0) + 1;
                    }
                  });
                  const intensities = ['#f3f4f6', '#e9d5ff', '#d8b4fe', '#a855f7', '#7c3aed', '#5b21b6'];
                  const columns = [];
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const startDate = new Date(today);
                  startDate.setDate(today.getDate() - (26 * 7) + 1);
                  
                  let currDate = new Date(startDate);
                  for (let c = 0; c < 26; c++) {
                    const days = [];
                    for (let d = 0; d < 7; d++) {
                      const ds = currDate.toISOString().substring(0, 10);
                      const count = cal[ds] || 0;
                      let intensity = 0;
                      if (count > 0) intensity = 1;
                      if (count > 2) intensity = 2;
                      if (count > 4) intensity = 3;
                      if (count > 6) intensity = 4;
                      if (count > 8) intensity = 5;
                      days.push(intensities[intensity]);
                      currDate.setDate(currDate.getDate() + 1);
                    }
                    columns.push(days);
                  }
                  setHeatmapData(columns);
                  setTotalActividades(tareasData.length);
                }
              } catch (e) { console.error("Error fetching tasks for heatmap", e); }
            }
          }
        }
      } catch (e) {
        console.error("Error loading profile data", e);
      }
    };
    fetchUserData();
  }, []);

  // Password Change modal states
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [friendModalVisible, setFriendModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [amigos, setAmigos] = useState([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [logros, setLogros] = useState([]);
  const [totalActividades, setTotalActividades] = useState(0);
  const [heatmapData, setHeatmapData] = useState([]);

  const handleOpenEdit = () => {
    setTempNombre(nombre);
    setTempUsername(username);
    setTempCorreo(correo);
    setModalVisible(true);
  };
  
  const handleSelectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && userData) {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop();
        const match = /\\.(\\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        const formData = new FormData();
        formData.append('file', {
          uri,
          name: filename,
          type,
        });

        const response = await fetch(`${API_URL}/usuarios/${userData.id}/avatar`, {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (response.ok) {
          const updatedUser = await response.json();
          setUserData(updatedUser);
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          Alert.alert('Éxito', 'Foto de perfil actualizada correctamente.');
        } else {
          Alert.alert('Error', 'No se pudo subir la imagen.');
        }
      } catch (error) {
        console.error('Upload Error:', error);
        Alert.alert('Error', 'Problema de conexión al subir la imagen.');
      }
    }
  };

  const handleAcceptRequest = async (amistad_id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/amistades/solicitudes/${amistad_id}/aceptar`, {
        method: 'PUT',
        headers: { 'x-api-key': API_KEY, 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.alert("Éxito", "Solicitud aceptada");
        setSolicitudesPendientes(prev => prev.filter(p => p.amistad_id !== amistad_id));
      } else {
        Alert.alert("Error", "No se pudo aceptar la solicitud.");
      }
    } catch(e) { console.error(e); }
  };

  const handleRejectRequest = async (amistad_id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/amistades/solicitudes/${amistad_id}/rechazar`, {
        method: 'PUT',
        headers: { 'x-api-key': API_KEY, 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.alert("Éxito", "Solicitud rechazada");
        setSolicitudesPendientes(prev => prev.filter(p => p.amistad_id !== amistad_id));
      } else {
        Alert.alert("Error", "No se pudo rechazar la solicitud.");
      }
    } catch(e) { console.error(e); }
  };

  const handleDeleteFriend = (amistad_id) => {
    Alert.alert(
      "Eliminar Amigo",
      "¿Estás seguro de que quieres eliminar a esta persona de tus amigos?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const response = await fetch(`${API_URL}/amistades/${amistad_id}`, {
                method: 'DELETE',
                headers: { 'x-api-key': API_KEY, 'Authorization': `Bearer ${token}` }
              });
              if (response.ok) {
                Alert.alert("Éxito", "Amigo eliminado");
                setAmigos(prev => prev.filter(a => a.amistad_id !== amistad_id));
              } else {
                Alert.alert("Error", "No se pudo eliminar al amigo.");
              }
            } catch(e) { console.error(e); }
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!tempNombre.trim() || !tempUsername.trim() || !tempCorreo.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/usuarios/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: tempNombre.trim(),
          nombre_usuario: tempUsername.trim(),
          correo: tempCorreo.trim()
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        setNombre(updatedUser.nombre || updatedUser.nombre_usuario || '');
        setUsername(updatedUser.nombre_usuario || '');
        setCorreo(updatedUser.correo || '');
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        
        setModalVisible(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      } else {
        const err = await response.json();
        Alert.alert('Error', err.detail || 'No se pudo actualizar el perfil');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Problema de conexión.');
    }
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
          <Text style={styles.profileSubtitle}>Lvl {userData?.nivel_actual?.numero_nivel || 1} {userData?.nivel_actual?.nombre || 'Iniciado'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItemHeader}>
              <Text style={styles.statNumberHeader}>{userData?.xp_total || 0}</Text>
              <Text style={styles.statLabelHeader}>XP Total</Text>
            </View>
            <View style={styles.statItemHeader}>
              <Text style={styles.statNumberHeader}>{amigos.length}</Text>
              <Text style={styles.statLabelHeader}>Amigos</Text>
            </View>
            <View style={styles.statItemHeader}>
              <Text style={styles.statNumberHeader}>{userData?.racha_actual || 0}</Text>
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
              <Text style={styles.streakCardVal}>{userData?.racha_actual || 0} Días</Text>
              <View style={styles.streakProgressBg}>
                <View style={[styles.streakProgressFill, { width: '10%' }]} />
              </View>
            </View>

            {/* Medallas & Resumen Widgets Row */}
            <View style={styles.widgetsGrid}>
              
              {/* Resumen de Actividad Widget */}
              <View style={styles.widgetCard}>
                <Text style={styles.widgetTitle}>Resumen de Actividad</Text>
                <View style={styles.resumenRow}>
                  <View style={styles.resumenIconBox}>
                    <Ionicons name="checkmark-circle" size={26} color="#10b981" />
                  </View>
                  <View>
                    <Text style={styles.resumenLabel}>TOTAL DE ACTIVIDADES</Text>
                    <Text style={styles.resumenVal}>{totalActividades}</Text>
                  </View>
                </View>
              </View>

            </View>

            {/* Actividad Heatmap Section */}
            <View style={styles.heatmapCard}>
              <View style={styles.heatmapHeader}>
                <Text style={styles.heatmapTitle}>Actividad</Text>
                <Text style={styles.heatmapSubtitle}>{totalActividades} contribuciones en el periodo</Text>
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

            {/* Solicitudes List */}
            {solicitudesPendientes.length > 0 && (
              <View style={[styles.friendsCard, { marginBottom: 16 }]}>
                <Text style={styles.friendsCardTitle}>Solicitudes Pendientes</Text>
                {solicitudesPendientes.map((sol, idx) => (
                  <View key={sol.id}>
                    {idx > 0 && <View style={styles.friendDivider} />}
                    <View style={styles.friendRow}>
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendAvatarText}>{sol.avatarText}</Text>
                      </View>
                      <View style={[styles.friendInfo, {flex: 1}]}>
                        <Text style={styles.friendName}>{sol.nombre}</Text>
                        <Text style={styles.friendStreakInactive}>Te envió una solicitud</Text>
                      </View>
                      <View style={{flexDirection: 'row', gap: 10}}>
                        <TouchableOpacity onPress={() => handleAcceptRequest(sol.amistad_id)}>
                          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleRejectRequest(sol.amistad_id)}>
                          <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

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
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
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
                </View>
              ))}
            </View>

          </View>
        ) : (
          <View style={styles.tabContent}>
            
            {/* Level Widget Section */}
            {userData && (
              <View style={styles.levelWidgetContainer}>
                <View style={styles.levelCircleWrapper}>
                  <View style={styles.levelCircle}>
                    <Text style={styles.levelNumber}>{userData.nivel_actual?.numero_nivel || 1}</Text>
                    <Text style={styles.levelLabel}>NIVEL</Text>
                  </View>
                </View>
                
                <Text style={styles.levelTitle}>{userData.nivel_actual?.nombre || 'Iniciado del Enfoque'}</Text>
                
                <Text style={styles.xpText}>
                  <Text style={styles.xpValue}>{userData.xp_total || 0}</Text> / {userData.nivel_siguiente?.xp_requerida || 'MAX'} XP
                </Text>
                
                {userData.nivel_siguiente && (
                  <Text style={styles.motivationText}>
                    ¡A MITAD DE CAMINO AL NIVEL {userData.nivel_siguiente.numero_nivel}!
                  </Text>
                )}
                
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${(userData.progreso_pct || 0) * 100}%` }]} />
                </View>

                <View style={styles.xpInfoBox}>
                  <Text style={styles.xpInfoText}>Gana XP completando tareas y manteniendo tu racha de días activos. ¡Sube de nivel para desbloquear nuevos rangos!</Text>
                </View>
              </View>
            )}

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
              

              {/* Photo Selector */}
              <View style={styles.photoSelectorContainer}>
                <TouchableOpacity style={styles.avatarLarge} onPress={handleSelectImage}>
                  {userData?.foto_perfil ? (
                    <Image 
                      source={{ uri: userData.foto_perfil.startsWith('http') ? userData.foto_perfil : `${API_URL.replace('/api/v1', '')}${userData.foto_perfil}` }} 
                      style={{ width: 100, height: 100, borderRadius: 50 }} 
                    />
                  ) : (
                    <Text style={styles.avatarLargeText}>{tempNombre.charAt(0).toUpperCase()}</Text>
                  )}
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={16} color="#ffffff" />
                  </View>
                </TouchableOpacity>
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
        animationType="fade"
        transparent={true}
        visible={friendModalVisible}
        onRequestClose={() => setFriendModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFriendModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { padding: 24, paddingBottom: 32 }]}>
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setFriendModalVisible(false)}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>

            {selectedFriend && selectedFriend.raw && (
              <View style={styles.modalInner}>
                
                <View style={[styles.modalAvatarContainer, !selectedFriend.raw.foto_perfil && { backgroundColor: '#6e00ff', borderWidth: 0 }]}>
                  {selectedFriend.raw.foto_perfil ? (
                    <Image 
                      source={{ uri: selectedFriend.raw.foto_perfil.startsWith('http') ? selectedFriend.raw.foto_perfil : `${API_URL.replace('/api/v1', '')}${selectedFriend.raw.foto_perfil}` }} 
                      style={styles.modalAvatarImage} 
                    />
                  ) : (
                    <Text style={styles.modalAvatarText}>{selectedFriend.avatarText}</Text>
                  )}
                </View>

                <View style={styles.modalHeaderInfo}>
                  <Text style={styles.modalName}>{selectedFriend.nombre}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: (selectedFriend.raw.nivel_actual?.color_hex || '#6e00ff') + '15' }]}>
                    <Ionicons name={selectedFriend.raw.nivel_actual?.icono || "diamond"} size={12} color={selectedFriend.raw.nivel_actual?.color_hex || "#6e00ff"} />
                    <Text style={[styles.levelBadgeText, { color: selectedFriend.raw.nivel_actual?.color_hex || "#6e00ff" }]}>
                      Lvl {selectedFriend.raw.nivel_actual?.numero_nivel || 1} {selectedFriend.raw.nivel_actual?.nombre || 'Iniciado del Enfoque'}
                    </Text>
                  </View>
                </View>

                <View style={styles.rachaContainer}>
                  <View style={styles.fireIconContainer}>
                    <Ionicons name="flame" size={24} color="#f97316" />
                  </View>
                  <Text style={styles.rachaTitle}>Racha de {selectedFriend.raw.racha_actual} Días</Text>
                  <Text style={styles.rachaSubtitle}>
                    {selectedFriend.raw.racha_actual > 0 ? "¡Está en llamas!" : "Aún sin racha."}
                  </Text>
                </View>

                <Text style={styles.statsSectionTitle}>ESTADÍSTICAS DE RENDIMIENTO</Text>
                <View style={styles.statsCardsRow}>
                  <View style={styles.statCard}>
                    <View style={[styles.statIconWrapper, { backgroundColor: '#f3ebff' }]}>
                      <Ionicons name="star" size={16} color="#6e00ff" />
                    </View>
                    <Text style={styles.statValue}>{selectedFriend.raw.xp_total.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>XP Total</Text>
                  </View>
                  <View style={styles.statCard}>
                    <View style={[styles.statIconWrapper, { backgroundColor: '#e0f2fe' }]}>
                      <Ionicons name="checkmark-circle" size={16} color="#0ea5e9" />
                    </View>
                    <Text style={styles.statValue}>{Math.floor(selectedFriend.raw.xp_total / 50)}</Text>
                    <Text style={styles.statLabel}>Tareas (Aprox)</Text>
                  </View>
                </View>

                <View style={{ marginTop: 24, width: '100%' }}>
                  <TouchableOpacity 
                    style={[styles.addFriendButton, { backgroundColor: '#ef4444' }]}
                    onPress={() => {
                      setFriendModalVisible(false);
                      setTimeout(() => {
                        handleDeleteFriend(selectedFriend.amistad_id);
                      }, 300);
                    }}
                  >
                    <Ionicons name="person-remove" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.addFriendText}>Eliminar Amigo</Text>
                  </TouchableOpacity>
                </View>

              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
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
    backgroundColor: '#fff7ed',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  streakCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ea580c',
    textTransform: 'uppercase',
  },
  streakCardVal: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ea580c',
    marginTop: 12,
  },
  streakCardSubtitle: {
    fontSize: 12,
    color: '#fb923c',
    fontWeight: '600',
    marginTop: 2,
  },
  streakProgressBg: {
    height: 6,
    backgroundColor: '#ffedd5',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    backgroundColor: '#ea580c',
    borderRadius: 3,
  },
  streakProgressText: {
    fontSize: 11,
    color: '#ea580c',
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
  levelWidgetContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  levelCircleWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#6e00ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 52,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 2,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  xpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6e00ff',
    marginBottom: 4,
  },
  xpValue: {
    fontWeight: '900',
  },
  motivationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6e00ff',
    borderRadius: 6,
  },
  xpInfoBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  xpInfoText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
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
    fontSize: 15,
    fontWeight: '800'
  },
  modalInner: {
    alignItems: 'center',
    paddingTop: 10
  },
  modalAvatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 32,
    backgroundColor: '#6e00ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#f3ebff',
    overflow: 'hidden'
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  modalAvatarText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff'
  },
  modalHeaderInfo: {
    alignItems: 'center',
    marginBottom: 24
  },
  modalName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3ebff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4
  },
  rachaContainer: {
    alignItems: 'center',
    marginBottom: 28
  },
  fireIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffedd5'
  },
  rachaTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827'
  },
  rachaSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2
  },
  statsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    alignSelf: 'flex-start',
    marginBottom: 12,
    letterSpacing: 0.5
  },
  statsCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center'
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280'
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  addFriendText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
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
