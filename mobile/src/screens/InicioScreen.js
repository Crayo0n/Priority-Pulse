import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Obtener fecha actual formateada como AAAA-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Obtener hora actual + 1 hora formateada como HH:MM
const getTodayTimeString = () => {
  const today = new Date();
  const hh = String((today.getHours() + 1) % 24).padStart(2, '0');
  const mm = '00';
  return `${hh}:${mm}`;
};

export default function InicioScreen({ route, navigation }) {
  const [activeTab, setActiveTab] = useState('tareas'); // 'tareas' | 'rutinas'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'pendiente' | 'completada' | 'alta' | 'media' | 'baja'
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('task'); // 'task' | 'routine'

  // Form states for new task/routine
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('50');
  const [newTags, setNewTags] = useState('');

  // Estados para Modal de Notificaciones
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifFilter, setNotifFilter] = useState('todas');
  const [notificaciones, setNotificaciones] = useState([
    {
      id: '1',
      categoria: 'sistema',
      grupo: 'hoy',
      titulo: '¡Racha en peligro!',
      mensaje: 'No has registrado ninguna tarea hoy. ¡Mantén tu racha ahora!',
      tiempo: 'hace 2h',
      leida: false,
      actionText: 'Registrar tarea',
      actionType: 'tareas'
    },
    {
      id: '2',
      categoria: 'social',
      grupo: 'hoy',
      titulo: 'Nuevo Me Gusta',
      mensaje: 'A User123 le gustó tu perfil',
      tiempo: 'hace 4h',
      leida: true
    },
    {
      id: '3',
      categoria: 'logros',
      grupo: 'hoy',
      titulo: '¡Nuevo logro desbloqueado!',
      mensaje: 'Completaste 50 tareas esta semana',
      tiempo: 'hace 5h',
      leida: false,
      actionText: 'Ver logro',
      actionType: 'logros'
    },
    {
      id: '4',
      categoria: 'logros',
      grupo: 'ayer',
      titulo: '¡Nuevo logro desbloqueado!',
      mensaje: 'Completaste 50 tareas esta semana',
      tiempo: 'ayer',
      leida: true,
      actionText: 'Ver logro',
      actionType: 'logros'
    }
  ]);

  // Estados para Modal de Edición de Tareas
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('50');
  const [editTags, setEditTags] = useState('');

  // Estados para Fecha y Hora Límite (Entrega)
  const [newDeadlineDate, setNewDeadlineDate] = useState(getTodayDateString());
  const [newDeadlineTime, setNewDeadlineTime] = useState(getTodayTimeString());

  const [editDeadlineDate, setEditDeadlineDate] = useState('');
  const [editDeadlineTime, setEditDeadlineTime] = useState('');

  // Verificar la racha en el montante del componente (Regla de negocio: /usuarios/{id}/check-streak)
  useEffect(() => {
    console.log("Streak check request sent to API: /usuarios/check-streak");
  }, []);

  // Cargar rutinas de AsyncStorage
  const loadRoutinesFromStorage = async () => {
    try {
      const storedRoutinesJson = await AsyncStorage.getItem('@rutinas');
      if (storedRoutinesJson) {
        setRutinas(JSON.parse(storedRoutinesJson));
      } else {
        const defaultRoutines = [
          {
            id: 'r1',
            nombre: 'Mañana Maestra 🌅',
            esta_activa: true,
            tareas: [
              { id: 'rt1', titulo: 'Hidratación', descripcion: 'Beber 500ml de agua', xp_recompensa: 5, estado: 'pendiente' },
              { id: 'rt2', titulo: 'Estiramiento', descripcion: 'Movilidad ligera', xp_recompensa: 10, estado: 'completada' },
              { id: 'rt3', titulo: 'Meditación', descripcion: 'Respiración consciente', xp_recompensa: 15, estado: 'pendiente' }
            ]
          },
          {
            id: 'r2',
            nombre: 'Bloque de Enfoque Nocturno 🌌',
            esta_activa: true,
            tareas: [
              { id: 'rt4', titulo: 'Planificar el día siguiente', descripcion: 'Definir 3 prioridades del mañana', xp_recompensa: 20, estado: 'pendiente' },
              { id: 'rt5', titulo: 'Lectura offline', descripcion: 'Leer 10 páginas de un libro físico', xp_recompensa: 15, estado: 'pendiente' }
            ]
          }
        ];
        setRutinas(defaultRoutines);
        await AsyncStorage.setItem('@rutinas', JSON.stringify(defaultRoutines));
      }
    } catch (e) {
      console.error("Failed to load routines from AsyncStorage", e);
    }
  };

  // Cargar de AsyncStorage cada vez que gane foco
  useFocusEffect(
    useCallback(() => {
      loadRoutinesFromStorage();
    }, [])
  );

  // Leer parámetros de navegación cuando redirecciona de MoldesScreen
  useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
      // Limpiar los parámetros de navegación para evitar bucles
      navigation.setParams({ activeTab: undefined });
    }
  }, [route.params]);

  const openEditTask = (task) => {
    setSelectedTask(task);
    setEditTitle(task.titulo);
    setEditDesc(task.descripcion || '');
    setEditPriority(task.xp_recompensa.toString());
    setEditTags(task.tags || '');

    if (task.fecha_limite) {
      const parts = task.fecha_limite.split(' ');
      setEditDeadlineDate(parts[0] || getTodayDateString());
      setEditDeadlineTime(parts[1] || getTodayTimeString());
    } else {
      setEditDeadlineDate(getTodayDateString());
      setEditDeadlineTime(getTodayTimeString());
    }

    setEditModalVisible(true);
  };

  // Mock initial tasks with local state to allow toggling completion status
  const [tareas, setTareas] = useState([
    { id: '1', titulo: 'Completar informe final', descripcion: 'Redactar conclusiones y enviar al equipo de PI.', es_critica: true, xp_recompensa: 90, estado: 'pendiente', tags: 'Trabajo,Urgente', fecha_limite: '2026-07-06 23:59' },
    { id: '2', titulo: 'Revisar documentación de API', descripcion: 'Verificar los nuevos endpoints de FastAPI.', es_critica: false, xp_recompensa: 40, estado: 'pendiente', tags: 'Estudio', fecha_limite: '2026-07-07 14:00' },
    { id: '3', titulo: 'Comprar víveres', descripcion: 'Frutas, verduras y leche de almendra.', es_critica: false, xp_recompensa: 10, estado: 'completada', tags: 'Personal', fecha_limite: '2026-07-05 18:00' },
    { id: '4', titulo: 'Cita con el dentista', descripcion: 'Limpieza semestral a las 4:00 PM.', es_critica: true, xp_recompensa: 85, estado: 'pendiente', tags: 'Salud', fecha_limite: '2026-07-06 16:00' },
  ]);

  // Mock initial routines with local state
  const [rutinas, setRutinas] = useState([]);

  // Handle toggling task state
  const toggleTarea = (id) => {
    setTareas(prev =>
      prev.map(t =>
        t.id === id ? { ...t, estado: t.estado === 'completada' ? 'pendiente' : 'completada' } : t
      )
    );
  };

  // Handle toggling routine sub-task state
  const toggleRoutineTarea = (routineId, subTaskId) => {
    const updatedRutinas = rutinas.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          tareas: r.tareas.map(st =>
            st.id === subTaskId ? { ...st, estado: st.estado === 'completada' ? 'pendiente' : 'completada' } : st
          )
        };
      }
      return r;
    });
    setRutinas(updatedRutinas);
    AsyncStorage.setItem('@rutinas', JSON.stringify(updatedRutinas)).catch(e => console.error(e));
  };

  // Handle adding new task mockup
  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    const isCritica = parseInt(newPriority) >= 80;
    const newTask = {
      id: Date.now().toString(),
      titulo: newTitle,
      descripcion: newDesc || 'Sin descripción',
      es_critica: isCritica,
      xp_recompensa: parseInt(newPriority) || 10,
      estado: 'pendiente',
      tags: newTags || 'General',
      fecha_limite: (newDeadlineDate && newDeadlineTime) ? `${newDeadlineDate} ${newDeadlineTime}` : null
    };
    setTareas([newTask, ...tareas]);
    setNewTitle('');
    setNewDesc('');
    setNewPriority('50');
    setNewTags('');
    setNewDeadlineDate(getTodayDateString());
    setNewDeadlineTime(getTodayTimeString());
    setModalVisible(false);
  };

  // Handle adding new routine mockup
  const handleCreateRoutine = () => {
    if (!newTitle.trim()) return;
    const newRoutine = {
      id: Date.now().toString(),
      nombre: newTitle,
      esta_activa: true,
      tareas: []
    };
    setRutinas([newRoutine, ...rutinas]);
    setNewTitle('');
    setModalVisible(false);
  };



  const filteredTareas = tareas.filter(t => {
    if (t.rutina_id) return false;
    if (filterType === 'completada') return t.estado === 'completada';
    if (filterType === 'pendiente') return t.estado === 'pendiente';
    if (filterType === 'alta') {
      return t.es_critica || (t.xp_recompensa && t.xp_recompensa > 50);
    }
    if (filterType === 'media') {
      return !t.es_critica && t.xp_recompensa && t.xp_recompensa > 20 && t.xp_recompensa <= 50;
    }
    if (filterType === 'baja') {
      return !t.es_critica && (!t.xp_recompensa || t.xp_recompensa <= 20);
    }
    return true; // 'all'
  });

  const filteredNotifs = notificaciones.filter(n => {
    if (notifFilter === 'todas') return true;
    return n.categoria === notifFilter;
  });

  const hoyNotifs = filteredNotifs.filter(n => n.grupo === 'hoy');
  const ayerNotifs = filteredNotifs.filter(n => n.grupo === 'ayer');

  const handleMarkAsRead = (id) => {
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  };

  const renderNotifItem = (n) => {
    let iconName = 'notifications-outline';
    let iconBg = '#f3f4f6';
    let iconColor = '#80796bff';

    if (n.categoria === 'sistema') {
      iconName = 'alert-circle-outline';
      iconBg = '#fef2f2';
      iconColor = '#ef4444';
    } else if (n.categoria === 'social') {
      iconName = 'people-outline';
      iconBg = '#f3ebff';
      iconColor = '#6e00ff';
    } else if (n.categoria === 'logros') {
      iconName = 'trophy-outline';
      iconBg = '#ecfdf5';
      iconColor = '#10b981';
    }

    return (
      <TouchableOpacity
        key={n.id}
        style={[styles.notifCard, !n.leida && styles.notifCardUnread]}
        onPress={() => handleMarkAsRead(n.id)}
        activeOpacity={0.8}
      >
        {/* Unread dot */}
        {!n.leida && <View style={styles.unreadDot} />}

        {/* Icon */}
        <View style={[styles.notifIconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>

        {/* Content */}
        <View style={styles.notifCardContent}>
          <View style={styles.notifCardHeader}>
            <Text style={[styles.notifCardTitle, !n.leida && styles.notifCardTitleUnread]}>
              {n.titulo}
            </Text>
            <Text style={styles.notifCardTime}>{n.tiempo}</Text>
          </View>
          <Text style={styles.notifCardMsg}>{n.mensaje}</Text>

          {/* Action buttons */}
          {n.actionText && (
            <TouchableOpacity
              style={[
                styles.notifActionBtn,
                n.actionType === 'tareas' ? styles.notifActionBtnSolid : styles.notifActionBtnOutline
              ]}
              onPress={() => {
                handleMarkAsRead(n.id);
                setNotifModalVisible(false);
                if (n.actionType === 'tareas') {
                  setActiveTab('tareas');
                } else if (n.actionType === 'logros') {
                  navigation.navigate('Perfil');
                }
              }}
            >
              <Text
                style={[
                  styles.notifActionBtnText,
                  n.actionType === 'tareas' ? styles.notifActionBtnTextSolid : styles.notifActionBtnTextOutline
                ]}
              >
                {n.actionText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <Image
            source={require('../../assets/Logo.png')}
            style={styles.appBarLogoImage}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => setNotifModalVisible(true)}>
          <Ionicons name="notifications-outline" size={24} color="#1f2937" />
          {notificaciones.some(n => !n.leida) && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile / Gamification Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>M</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>Hola de nuevo,</Text>
              <Text style={styles.userName}>Mauricio 👋</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>12 Días</Text>
            </View>
          </View>

          {/* Level Progress */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelText}>Nivel 4</Text>
              <Text style={styles.xpText}>500 / 1000 XP</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '50%' }]} />
            </View>
          </View>
        </View>

        {/* Tab Controls (Mobile-first Segmented Bar) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tareas' && styles.tabButtonActive]}
            onPress={() => setActiveTab('tareas')}
          >
            <Ionicons
              name="checkbox"
              size={16}
              color={activeTab === 'tareas' ? '#6e00ff' : '#6b7280'}
            />
            <Text style={[styles.tabButtonText, activeTab === 'tareas' && styles.tabButtonTextActive]}>
              Tareas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'rutinas' && styles.tabButtonActive]}
            onPress={() => setActiveTab('rutinas')}
          >
            <Ionicons
              name="repeat"
              size={16}
              color={activeTab === 'rutinas' ? '#6e00ff' : '#6b7280'}
            />
            <Text style={[styles.tabButtonText, activeTab === 'rutinas' && styles.tabButtonTextActive]}>
              Rutinas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Views */}
        {activeTab === 'tareas' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tus tareas de hoy</Text>
              <Text style={styles.sectionSubtitle}>
                {tareas.filter(t => !t.rutina_id && t.estado === 'pendiente').length} pendientes
              </Text>
            </View>

            {/* Filtros de tareas */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
              style={styles.filterContainer}
            >
              {[
                { id: 'all', label: 'Todas' },
                { id: 'pendiente', label: 'Pendientes' },
                { id: 'completada', label: 'Completadas' },
                { id: 'alta', label: 'Alta' },
                { id: 'media', label: 'Media' },
                { id: 'baja', label: 'Baja' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.filterPill,
                    filterType === opt.id && styles.filterPillActive
                  ]}
                  onPress={() => setFilterType(opt.id)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      filterType === opt.id && styles.filterPillTextActive
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredTareas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="sparkles-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>¡Todo al día! Disfruta tu racha.</Text>
              </View>
            ) : (
              filteredTareas.map(item => {
                const isCompleted = item.estado === 'completada';
                return (
                  <View
                    key={item.id}
                    style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
                  >
                    <TouchableOpacity
                      style={[styles.checkboxCircle, isCompleted && styles.checkboxCircleChecked]}
                      onPress={() => toggleTarea(item.id)}
                      activeOpacity={0.7}
                    >
                      {isCompleted && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.taskCardContent}
                      onPress={() => openEditTask(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.taskTextContainer}>
                        <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                          {item.titulo}
                        </Text>
                        <Text style={[styles.taskDesc, isCompleted && styles.taskDescCompleted]}>
                          {item.descripcion}
                        </Text>
                        
                        {/* Badges container */}
                        <View style={styles.badgesContainer}>
                          {item.tags.split(',').map((tag, idx) => (
                            <View key={idx} style={[styles.tagBadge, { marginRight: 6, marginBottom: 4 }]}>
                              <Text style={styles.tagBadgeText}>{tag}</Text>
                            </View>
                          ))}
                          {item.fecha_limite && (
                            <View style={styles.deadlineBadge}>
                              <Ionicons name="time-outline" size={11} color="#f43f5e" style={{ marginRight: 3 }} />
                              <Text style={styles.deadlineBadgeText}>{item.fecha_limite}</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.taskCardRight}>
                        {item.es_critica && (
                          <View style={styles.criticalBadge}>
                            <Text style={styles.criticalText}>Crítica</Text>
                          </View>
                        )}
                        <Text style={[styles.xpRewardText, isCompleted && styles.xpRewardTextCompleted]}>
                          +{item.xp_recompensa} XP
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'rutinas' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rutinas Activas</Text>
              <Text style={styles.sectionSubtitle}>Hábitos recurrentes diarios</Text>
            </View>

            {rutinas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="repeat" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No tienes rutinas activas.</Text>
                <TouchableOpacity
                  style={styles.addOutlineBtn}
                  onPress={() => setActiveTab('plantillas')}
                >
                  <Text style={styles.addOutlineBtnText}>Añadir desde Biblioteca</Text>
                </TouchableOpacity>
              </View>
            ) : (
              rutinas.map(routine => (
                <View key={routine.id} style={styles.routineCard}>
                  <View style={styles.routineHeader}>
                    <View style={styles.routineTitleRow}>
                      <Ionicons name="calendar-sharp" size={18} color="#6e00ff" style={{ marginRight: 6 }} />
                      <Text style={styles.routineName}>{routine.nombre}</Text>
                    </View>
                    <View style={styles.routineStats}>
                      <Text style={styles.routineStatsText}>
                        {routine.tareas.filter(st => st.estado === 'completada').length}/{routine.tareas.length}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.routineDivider} />

                  {/* Routine tasks list */}
                  {routine.tareas.length === 0 ? (
                    <Text style={styles.noSubtasksText}>No hay tareas añadidas a esta rutina.</Text>
                  ) : (
                    routine.tareas.map(subTask => {
                      const isCompleted = subTask.estado === 'completada';
                      return (
                        <TouchableOpacity
                          key={subTask.id}
                          style={styles.subtaskRow}
                          onPress={() => toggleRoutineTarea(routine.id, subTask.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.subtaskLeft}>
                            <View style={[styles.subCheckbox, isCompleted && styles.subCheckboxChecked]}>
                              {isCompleted && <Ionicons name="checkmark" size={10} color="#ffffff" />}
                            </View>
                            <View style={styles.subtaskTextGroup}>
                              <Text style={[styles.subtaskTitle, isCompleted && styles.subtaskTitleCompleted]}>
                                {subTask.titulo}
                              </Text>
                              <Text style={styles.subtaskDesc}>{subTask.descripcion}</Text>
                            </View>
                          </View>
                          <Text style={styles.subtaskXp}>+{subTask.xp_recompensa} XP</Text>
                        </TouchableOpacity>
                      )
                    })
                  )}
                </View>
              ))
            )}
          </View>
        )}


      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setModalType(activeTab === 'rutinas' ? 'routine' : 'task');
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal Dialog for Creation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'task' ? 'Crear Nueva Tarea' : 'Crear Nueva Rutina'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            {modalType === 'task' ? (
              <ScrollView style={styles.modalBody}>
                {/* Title */}
                <Text style={styles.modalLabel}>Título de la tarea</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej. Ir al gimnasio"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />

                {/* Description */}
                <Text style={styles.modalLabel}>Descripción</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Escribe detalles aquí..."
                  multiline={true}
                  numberOfLines={3}
                  value={newDesc}
                  onChangeText={setNewDesc}
                />

                {/* Prioridad / Recompensa (XP) */}
                <Text style={styles.modalLabel}>Prioridad / Recompensa (XP): {newPriority}</Text>
                <View style={styles.priorityRow}>
                  {['10', '30', '50', '80', '100'].map(val => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.priorityPill,
                        newPriority === val && styles.priorityPillActive
                      ]}
                      onPress={() => setNewPriority(val)}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          newPriority === val && styles.priorityPillTextActive
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {parseInt(newPriority) >= 80 && (
                  <Text style={styles.priorityNotice}>⚠️ Esta tarea será clasificada como CRÍTICA.</Text>
                )}

                {/* Tags */}
                <Text style={styles.modalLabel}>Etiquetas (Separadas por comas)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej. Salud, Hábito"
                  value={newTags}
                  onChangeText={setNewTags}
                />

                {/* Fecha y Hora Límite */}
                <Text style={styles.modalLabel}>Fecha y Hora Límite (Entrega)</Text>
                <View style={styles.datetimeInputRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.subLabel}>Fecha (AAAA-MM-DD)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="AAAA-MM-DD"
                      value={newDeadlineDate}
                      onChangeText={setNewDeadlineDate}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.subLabel}>Hora (HH:MM)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="HH:MM"
                      value={newDeadlineTime}
                      onChangeText={setNewDeadlineTime}
                    />
                  </View>
                </View>

                {/* Submit button */}
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateTask}>
                  <Text style={styles.modalSubmitBtnText}>Guardar Tarea</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.modalBody}>
                {/* Routine Name */}
                <Text style={styles.modalLabel}>Nombre de la rutina</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej. Enfoque Nocturno"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />

                {/* Submit button */}
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateRoutine}>
                  <Text style={styles.modalSubmitBtnText}>Crear Rutina</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Dialog for Editing Task */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Tarea</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            {selectedTask && (
              <ScrollView style={styles.modalBody}>
                {/* Title */}
                <Text style={styles.modalLabel}>Título de la tarea</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej. Ir al gimnasio"
                  value={editTitle}
                  onChangeText={setEditTitle}
                />

                {/* Description */}
                <Text style={styles.modalLabel}>Descripción</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Escribe detalles aquí..."
                  multiline={true}
                  numberOfLines={3}
                  value={editDesc}
                  onChangeText={setEditDesc}
                />

                {/* Priority / XP */}
                <Text style={styles.modalLabel}>Prioridad / Recompensa (XP): {editPriority}</Text>
                <View style={styles.priorityRow}>
                  {['10', '30', '50', '80', '100'].map(val => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.priorityPill,
                        editPriority === val && styles.priorityPillActive
                      ]}
                      onPress={() => setEditPriority(val)}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          editPriority === val && styles.priorityPillTextActive
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {parseInt(editPriority) >= 80 && (
                  <Text style={styles.priorityNotice}>⚠️ Esta tarea será clasificada como CRÍTICA.</Text>
                )}

                {/* Tags */}
                <Text style={styles.modalLabel}>Etiquetas (Separadas por comas)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej. Trabajo, Urgente"
                  value={editTags}
                  onChangeText={setEditTags}
                />

                {/* Fecha y Hora Límite */}
                <Text style={styles.modalLabel}>Fecha y Hora Límite (Entrega)</Text>
                <View style={styles.datetimeInputRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.subLabel}>Fecha (AAAA-MM-DD)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="AAAA-MM-DD"
                      value={editDeadlineDate}
                      onChangeText={setEditDeadlineDate}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.subLabel}>Hora (HH:MM)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="HH:MM"
                      value={editDeadlineTime}
                      onChangeText={setEditDeadlineTime}
                    />
                  </View>
                </View>

                {/* Save changes button */}
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={() => {
                    if (!editTitle.trim()) return;
                    const isCritica = parseInt(editPriority) >= 80;
                    setTareas(prev =>
                      prev.map(t =>
                        t.id === selectedTask.id
                          ? {
                              ...t,
                              titulo: editTitle,
                              descripcion: editDesc || 'Sin descripción',
                              es_critica: isCritica,
                              xp_recompensa: parseInt(editPriority),
                              tags: editTags || 'General',
                              fecha_limite: (editDeadlineDate && editDeadlineTime) ? `${editDeadlineDate} ${editDeadlineTime}` : null
                            }
                          : t
                      )
                    );
                    setEditModalVisible(false);
                  }}
                >
                  <Text style={styles.modalSubmitBtnText}>Guardar Cambios</Text>
                </TouchableOpacity>

                {/* Delete button */}
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#ef4444', marginTop: 12 }]}
                  onPress={() => {
                    setTareas(prev => prev.filter(t => t.id !== selectedTask.id));
                    setEditModalVisible(false);
                  }}
                >
                  <Text style={styles.modalSubmitBtnText}>Eliminar Tarea</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notifModalVisible}
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.modalTitle}>Notificaciones</Text>
                {notificaciones.filter(n => !n.leida).length > 0 && (
                  <View style={styles.newNotifBadge}>
                    <Text style={styles.newNotifBadgeText}>
                      {notificaciones.filter(n => !n.leida).length} nuevas
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Category Filters Tab Bar */}
            <View style={styles.notifFilterBar}>
              {[
                { id: 'todas', label: 'Todas' },
                { id: 'sistema', label: 'Sistema' },
                { id: 'social', label: 'Social' },
                { id: 'logros', label: 'Logros' }
              ].map(tab => {
                const isActive = notifFilter === tab.id;
                const unreadCount = notificaciones.filter(n => n.categoria === tab.id && !n.leida).length;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.notifFilterTab, isActive && styles.notifFilterTabActive]}
                    onPress={() => setNotifFilter(tab.id)}
                  >
                    <Text style={[styles.notifFilterTabText, isActive && styles.notifFilterTabTextActive]}>
                      {tab.label}
                    </Text>
                    {unreadCount > 0 && (
                      <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>{unreadCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Scrollable list grouped by Date Headers */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {filteredNotifs.length === 0 ? (
                <Text style={styles.noNotificationsText}>No tienes notificaciones en esta categoría.</Text>
              ) : (
                <>
                  {/* HOY */}
                  {hoyNotifs.length > 0 && (
                    <View>
                      <Text style={styles.groupHeader}>HOY</Text>
                      {hoyNotifs.map(n => renderNotifItem(n))}
                    </View>
                  )}

                  {/* AYER */}
                  {ayerNotifs.length > 0 && (
                    <View style={{ marginTop: 16 }}>
                      <Text style={styles.groupHeader}>AYER</Text>
                      {ayerNotifs.map(n => renderNotifItem(n))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Footer with settings shortcut and mark all read */}
            <View style={styles.notifFooter}>
              <TouchableOpacity
                style={styles.notifSettingsLink}
                onPress={() => {
                  setNotifModalVisible(false);
                  navigation.navigate('AjustesNotificaciones');
                }}
              >
                <Ionicons name="settings-outline" size={16} color="#6e00ff" style={{ marginRight: 6 }} />
                <Text style={styles.notifSettingsLinkText}>Ajustes de notificaciones</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
                }}
              >
                <Text style={styles.markAllReadText}>Marcar leídas</Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    justifyContent: 'space-between',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#6e00ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  notificationBtn: {
    position: 'relative',
    padding: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(110, 0, 255, 0.04)',
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3ebff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#e9d5ff',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6e00ff',
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  streakEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c2410c',
  },
  levelContainer: {
    marginTop: 18,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6e00ff',
  },
  xpText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6e00ff',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    marginLeft: 6,
  },
  tabButtonTextActive: {
    color: '#6e00ff',
  },
  section: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  addOutlineBtn: {
    borderWidth: 1,
    borderColor: '#6e00ff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  addOutlineBtnText: {
    fontSize: 12,
    color: '#6e00ff',
    fontWeight: '700',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: '#fafbfc',
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCircleChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 16,
  },
  taskDescCompleted: {
    color: '#9ca3af',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagBadgeText: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '600',
  },
  taskCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  criticalBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  criticalText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ef4444',
  },
  xpRewardText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6e00ff',
  },
  xpRewardTextCompleted: {
    color: '#9ca3af',
  },
  routineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
  },
  routineStats: {
    backgroundColor: '#f3ebff',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  routineStatsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6e00ff',
  },
  routineDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
  },
  noSubtasksText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fafbfc',
  },
  subtaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subCheckboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  subtaskTextGroup: {
    flex: 1,
    paddingRight: 8,
  },
  subtaskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  subtaskDesc: {
    fontSize: 11,
    color: '#6b7280',
  },
  subtaskXp: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6e00ff',
  },
  templateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
  },
  templateDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  templateXpBadge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  templateXpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  templateTasksList: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  templateTaskItem: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 6,
    fontWeight: '500',
  },
  templateAddBtn: {
    backgroundColor: '#6e00ff',
    borderRadius: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateAddBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6e00ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '80%',
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
    marginBottom: 16,
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
  modalTextArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  priorityNotice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6e00ff',
    paddingHorizontal: 12,
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
  appBarLogoImage: {
    width: 130,
    height: 32,
    marginRight: 10,
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  noNotificationsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
  notifItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  notifUnread: {
    backgroundColor: '#f3ebff',
    borderColor: 'rgba(110, 0, 255, 0.1)',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f2937',
  },
  notifTime: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
  notifMsg: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 16,
    fontWeight: '500',
  },
  filterContainer: {
    marginBottom: 16,
    maxHeight: 40,
  },
  filterScroll: {
    paddingHorizontal: 4,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#6e00ff',
  },
  filterPillText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  priorityPill: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priorityPillActive: {
    backgroundColor: '#6e00ff',
    borderColor: '#6e00ff',
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  priorityPillText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '700',
  },
  priorityPillTextActive: {
    color: '#ffffff',
  },
  datetimeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 4,
  },
  deadlineBadgeText: {
    fontSize: 10,
    color: '#f43f5e',
    fontWeight: '700',
  },
  templateDetailName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  templateDetailDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  templateSubtaskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  templateSubtaskItemRowDisabled: {
    opacity: 0.5,
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  templateSubtaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  templateSubCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateSubCheckboxChecked: {
    backgroundColor: '#6e00ff',
    borderColor: '#6e00ff',
  },
  templateSubtaskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  templateSubtaskTitleDisabled: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  templateSubtaskDesc: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
  },
  templateSubtaskXp: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6e00ff',
  },
  templateSubtaskXpDisabled: {
    color: '#9ca3af',
  },
  templateFooterRow: {
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  totalXpLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  newNotifBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  newNotifBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6e00ff',
  },
  notifFilterBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
    paddingBottom: 4,
  },
  notifFilterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  notifFilterTabActive: {
    borderBottomColor: '#6e00ff',
  },
  notifFilterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  notifFilterTabTextActive: {
    color: '#6e00ff',
    fontWeight: '800',
  },
  filterBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ef4444',
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  notifCard: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 10,
    position: 'relative',
  },
  notifCardUnread: {
    backgroundColor: '#fafbff',
    borderColor: '#eef2ff',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6e00ff',
    position: 'absolute',
    left: 6,
    top: 20,
  },
  notifIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifCardContent: {
    flex: 1,
  },
  notifCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
    flex: 1,
    marginRight: 8,
  },
  notifCardTitleUnread: {
    color: '#111827',
    fontWeight: '800',
  },
  notifCardTime: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  notifCardMsg: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '500',
  },
  notifActionBtn: {
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
  },
  notifActionBtnSolid: {
    backgroundColor: '#6e00ff',
  },
  notifActionBtnOutline: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  notifActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifActionBtnTextSolid: {
    color: '#ffffff',
  },
  notifActionBtnTextOutline: {
    color: '#4b5563',
  },
  notifFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 8,
  },
  notifSettingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifSettingsLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6e00ff',
  },
  markAllReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
});
