import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  StatusBar,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_KEY } from '../api/config';

export default function ClasificacionScreen() {
  const [topUsers, setTopUsers] = useState([]);
  const [restUsers, setRestUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [friendshipId, setFriendshipId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('userToken');
      let myId = null;
      if (userStr) {
        const userObj = JSON.parse(userStr);
        myId = userObj.id;
        setCurrentUserId(myId);
      }

      const response = await fetch(`${API_URL}/usuarios/leaderboard?limit=50`, {
        headers: { 
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Formatear data
        const formattedData = data.map((u, index) => ({
          id: u.id,
          rank: index + 1,
          name: u.nombre_usuario,
          level: u.nivel_actual ? u.nivel_actual.numero_nivel : 1,
          xp: u.xp_total,
          avatar: u.foto_perfil,
          initials: u.nombre_usuario.substring(0, 2).toUpperCase(),
          isCurrentUser: u.id === myId,
          color: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#b45309' : '#e5e7eb'
        }));

        setTopUsers(formattedData.slice(0, 3));
        setRestUsers(formattedData.slice(3));
      }
    } catch (error) {
      console.log('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProfileModal = async (user) => {
    if (user.isCurrentUser) return;

    setSelectedUser(user);
    setModalVisible(true);
    setLoadingProfile(true);
    setSelectedUserStats(null);
    setFriendshipStatus('ninguna');
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 
        'x-api-key': API_KEY, 
        'Usuario-Id': String(currentUserId),
        'Authorization': `Bearer ${token}`
      };
      
      const [userRes, friendRes] = await Promise.all([
        fetch(`${API_URL}/usuarios/${user.id}`, { headers }),
        fetch(`${API_URL}/amistades/estado/${user.id}`, { headers })
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setSelectedUserStats(userData);
      }
      
      if (friendRes.ok) {
        const friendData = await friendRes.json();
        setFriendshipStatus(friendData.estado);
        setFriendshipId(friendData.id);
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAddFriend = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 
        'x-api-key': API_KEY, 
        'Usuario-Id': String(currentUserId),
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const payload = {
        usuario_id_1: currentUserId,
        usuario_id_2: selectedUser.id
      };
      
      const response = await fetch(`${API_URL}/amistades/solicitudes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (response.status === 201) {
        setFriendshipStatus('pendiente_enviada');
        Alert.alert('Éxito', 'Solicitud de amistad enviada.');
      } else {
        const err = await response.json();
        Alert.alert('Error', err.detail?.mensaje || err.detail || 'No se pudo enviar la solicitud.');
      }
    } catch (error) {
      Alert.alert('Error', 'Problema de conexión.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderAvatar = (user, size, fontSize) => {
    if (user.avatar) {
      return (
        <Image 
          source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${API_URL.replace('/api/v1', '')}${user.avatar}` }} 
          style={{ width: size, height: size, borderRadius: size / 2 }} 
        />
      );
    }
    return <Text style={[styles.rowAvatarText, { fontSize, color: user.color || '#6e00ff' }]}>{user.initials}</Text>;
  };

  const renderLeaderboardItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[styles.rankRow, item.isCurrentUser && styles.currentUserRow]}
        onPress={() => openProfileModal(item)}
        activeOpacity={item.isCurrentUser ? 1 : 0.7}
      >
        <View style={styles.rankNumContainer}>
          <Text style={[styles.rankNum, item.isCurrentUser && styles.currentUserText]}>
            {item.rank}
          </Text>
        </View>

        <View style={[styles.rowAvatar, item.isCurrentUser && styles.currentUserAvatar, !item.avatar && { backgroundColor: item.isCurrentUser ? '#ffffff' : '#f3f4f6' }]}>
          {renderAvatar(item, 38, 15)}
        </View>

        <View style={styles.rowInfo}>
          <Text style={[styles.rowName, item.isCurrentUser && styles.currentUserName]}>
            {item.name} {item.isCurrentUser && <Text style={styles.meTag}>(Tú)</Text>}
          </Text>
          <Text style={styles.rowLevel}>Nivel {item.level}</Text>
        </View>

        <Text style={[styles.rowXp, item.isCurrentUser && styles.currentUserText]}>
          {item.xp.toLocaleString()} XP
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Clasificación Global</Text>
          <Text style={styles.subtitle}>Mira tu posición frente a la comunidad global</Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6e00ff" />
          </View>
        ) : (
          <FlatList
            data={restUsers}
            renderItem={renderLeaderboardItem}
            keyExtractor={item => item.rank.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              topUsers.length > 0 ? (
                <View style={styles.podiumContainer}>
                  {/* 2nd Place */}
                  {topUsers[1] && (
                    <TouchableOpacity style={styles.podiumCol} onPress={() => openProfileModal(topUsers[1])} activeOpacity={topUsers[1].isCurrentUser ? 1 : 0.7}>
                      <View style={[styles.podiumAvatarContainer, { borderColor: '#d1d5db' }]}>
                        {renderAvatar(topUsers[1], 54, 20)}
                        <View style={[styles.medalBadge, { backgroundColor: '#9ca3af' }]}>
                          <Text style={styles.medalBadgeText}>2</Text>
                        </View>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{topUsers[1].name}</Text>
                      <Text style={styles.podiumXp}>{topUsers[1].xp.toLocaleString()} XP</Text>
                    </TouchableOpacity>
                  )}

                  {/* 1st Place */}
                  {topUsers[0] && (
                    <TouchableOpacity style={[styles.podiumCol, styles.firstPlaceCol]} onPress={() => openProfileModal(topUsers[0])} activeOpacity={topUsers[0].isCurrentUser ? 1 : 0.7}>
                      <View style={styles.crownContainer}>
                        <Ionicons name="ribbon" size={24} color="#fbbf24" />
                      </View>
                      <View style={[styles.podiumAvatarContainer, styles.firstPlaceAvatar]}>
                        {renderAvatar(topUsers[0], 64, 24)}
                        <View style={[styles.medalBadge, { backgroundColor: '#fbbf24' }]}>
                          <Text style={styles.medalBadgeText}>1</Text>
                        </View>
                      </View>
                      <Text style={[styles.podiumName, styles.firstPlaceName]} numberOfLines={1}>
                        {topUsers[0].name}
                      </Text>
                      <Text style={[styles.podiumXp, styles.firstPlaceXp]}>{topUsers[0].xp.toLocaleString()} XP</Text>
                    </TouchableOpacity>
                  )}

                  {/* 3rd Place */}
                  {topUsers[2] && (
                    <TouchableOpacity style={styles.podiumCol} onPress={() => openProfileModal(topUsers[2])} activeOpacity={topUsers[2].isCurrentUser ? 1 : 0.7}>
                      <View style={[styles.podiumAvatarContainer, { borderColor: '#d97706' }]}>
                        {renderAvatar(topUsers[2], 54, 20)}
                        <View style={[styles.medalBadge, { backgroundColor: '#b45309' }]}>
                          <Text style={styles.medalBadgeText}>3</Text>
                        </View>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{topUsers[2].name}</Text>
                      <Text style={styles.podiumXp}>{topUsers[2].xp.toLocaleString()} XP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Profile Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>

            {selectedUser && (
              <View style={styles.modalInner}>
                <View style={[styles.modalAvatarContainer, !selectedUser.avatar && { backgroundColor: '#6e00ff', borderWidth: 0 }]}>
                  {selectedUser.avatar ? (
                    <Image 
                      source={{ uri: selectedUser.avatar.startsWith('http') ? selectedUser.avatar : `${API_URL.replace('/api/v1', '')}${selectedUser.avatar}` }} 
                      style={styles.modalAvatarImage} 
                    />
                  ) : (
                    <Text style={styles.modalAvatarText}>{selectedUser.initials}</Text>
                  )}
                </View>

                {loadingProfile || !selectedUserStats ? (
                  <ActivityIndicator size="large" color="#6e00ff" style={{ marginVertical: 40 }} />
                ) : (
                  <>
                    <View style={styles.modalHeaderInfo}>
                      <Text style={styles.modalName}>{selectedUser.name}</Text>
                      <View style={[styles.levelBadge, { backgroundColor: (selectedUserStats.nivel_actual?.color_hex || '#6e00ff') + '15' }]}>
                        <Ionicons name={selectedUserStats.nivel_actual?.icono || "diamond"} size={12} color={selectedUserStats.nivel_actual?.color_hex || "#6e00ff"} />
                        <Text style={[styles.levelBadgeText, { color: selectedUserStats.nivel_actual?.color_hex || "#6e00ff" }]}>
                          Lvl {selectedUserStats.nivel_actual?.numero_nivel || 1} {selectedUserStats.nivel_actual?.nombre || 'Iniciado del Enfoque'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rachaContainer}>
                      <View style={styles.fireIconContainer}>
                        <Ionicons name="flame" size={24} color="#f97316" />
                      </View>
                      <Text style={styles.rachaTitle}>Racha de {selectedUserStats.racha_actual} Días</Text>
                      <Text style={styles.rachaSubtitle}>
                        {selectedUserStats.racha_actual > 0 ? "¡Está en llamas!" : "Aún sin racha."}
                      </Text>
                    </View>

                    <Text style={styles.statsSectionTitle}>ESTADÍSTICAS DE RENDIMIENTO</Text>
                    <View style={styles.statsCardsRow}>
                      <View style={styles.statCard}>
                        <View style={[styles.statIconWrapper, { backgroundColor: '#f3ebff' }]}>
                          <Ionicons name="star" size={16} color="#6e00ff" />
                        </View>
                        <Text style={styles.statValue}>{selectedUserStats.xp_total.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>XP Total</Text>
                      </View>
                      <View style={styles.statCard}>
                        <View style={[styles.statIconWrapper, { backgroundColor: '#e0f2fe' }]}>
                          <Ionicons name="checkmark-circle" size={16} color="#0ea5e9" />
                        </View>
                        <Text style={styles.statValue}>{Math.floor(selectedUserStats.xp_total / 50)}</Text>
                        <Text style={styles.statLabel}>Tareas (Aprox)</Text>
                      </View>
                    </View>

                    {/* Botón Dinámico de Amistad */}
                    <View style={{ marginTop: 24, width: '100%' }}>
                      {friendshipStatus === 'ninguna' && (
                        <TouchableOpacity 
                          style={styles.addFriendButton} 
                          onPress={handleAddFriend}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 8 }} />
                              <Text style={styles.addFriendText}>Añadir amigo</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                      
                      {(friendshipStatus === 'pendiente_enviada' || friendshipStatus === 'pendiente') && (
                        <View style={[styles.addFriendButton, { backgroundColor: '#f3f4f6' }]}>
                          <Ionicons name="time" size={18} color="#6b7280" style={{ marginRight: 8 }} />
                          <Text style={[styles.addFriendText, { color: '#6b7280' }]}>Pendiente</Text>
                        </View>
                      )}

                      {friendshipStatus === 'aceptada' && (
                        <View style={[styles.addFriendButton, { backgroundColor: '#10b981' }]}>
                          <Ionicons name="people" size={18} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={styles.addFriendText}>Amigos</Text>
                        </View>
                      )}
                      
                      {friendshipStatus === 'pendiente_recibida' && (
                        <View style={[styles.addFriendButton, { backgroundColor: '#f59e0b' }]}>
                          <Ionicons name="mail" size={18} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={styles.addFriendText}>Solicitud Recibida</Text>
                        </View>
                      )}
                    </View>

                  </>
                )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 48,
    paddingHorizontal: 10,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  firstPlaceCol: {
    zIndex: 10,
    transform: [{ scale: 1.15 }],
    marginHorizontal: 10,
  },
  crownContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11
  },
  podiumAvatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  firstPlaceAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderColor: '#fbbf24',
    borderWidth: 4,
  },
  podiumAvatarText: {
    fontWeight: '900',
    color: '#ffffff',
  },
  medalBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  medalBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    maxWidth: 90,
    textAlign: 'center',
  },
  firstPlaceName: {
    fontSize: 14,
    color: '#111827',
  },
  podiumXp: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6e00ff',
    marginTop: 2,
  },
  firstPlaceXp: {
    fontSize: 11,
    color: '#6e00ff',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  currentUserRow: {
    backgroundColor: '#f9f5ff',
    borderColor: '#d9baff',
    borderWidth: 1.5,
  },
  rankNumContainer: {
    width: 28,
    alignItems: 'center',
  },
  rankNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6b7280',
  },
  currentUserText: {
    color: '#6e00ff',
    fontWeight: '900',
  },
  rowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginLeft: 4,
    overflow: 'hidden'
  },
  currentUserAvatar: {
    borderWidth: 1.5,
    borderColor: '#6e00ff',
  },
  rowAvatarText: {
    fontWeight: '900',
    color: '#6e00ff',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  currentUserName: {
    color: '#111827',
    fontWeight: '900',
  },
  meTag: {
    fontSize: 11,
    color: '#6e00ff',
    fontWeight: '800',
    backgroundColor: '#f3ebff',
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden'
  },
  rowLevel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
    fontWeight: '500',
  },
  rowXp: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
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
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4
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
  }
});
