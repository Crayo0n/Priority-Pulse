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
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL, API_KEY } from '../api/config';

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
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = -7; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).substring(0,3).toUpperCase();
      days.push({ dateString, dayName, dayNum: dd });
    }
    return days;
  };
  const [calendarDays] = useState(getCalendarDays());
  const calendarRef = React.useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('task'); // 'task' | 'routine'
  const [modalContext, setModalContext] = useState('add'); // 'add' | 'edit'
  
  // Seleccionar tarea para rutina
  const [selectTaskModalVisible, setSelectTaskModalVisible] = useState(false);
  const [selectedRoutineForTask, setSelectedRoutineForTask] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Form states for new task/routine
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('50'); // '20', '50', '80', '100'
  const [newTags, setNewTags] = useState('');
  const [newEmoji, setNewEmoji] = useState('🚀');
  const [newRepeticion, setNewRepeticion] = useState('no_repetir');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState(getTodayDateString());
  
  // Custom picker modals states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRepetitionPicker, setShowRepetitionPicker] = useState(false);
  
  const EMOJI_LIST = ['🚀', '🔥', '📚', '💪', '💻', '🧘', '💧', '🥗', '🎯', '🎨', '🧹', '🚶'];
  const REPETITION_OPTIONS = [
    { value: 'no_repetir', label: 'No repetir (Una sola vez)' },
    { value: 'diario', label: 'Diariamente' },
    { value: 'semanal', label: 'Semanalmente' },
    { value: 'mensual', label: 'Mensualmente' },
    { value: 'fin_semana', label: 'Fines de semana' },
  ];

  // Picker modals (datetime)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const [pickerDate, setPickerDate] = useState(new Date());
  const [pickerStartTime, setPickerStartTime] = useState(new Date());
  const [pickerEndTime, setPickerEndTime] = useState(new Date());
  const [pickerReminder, setPickerReminder] = useState(new Date());

  const formatTimeStr = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPickerDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const val = `${year}-${month}-${day}`;
      if (modalContext === 'edit') setEditDeadlineDate(val);
      else setNewDeadlineDate(val);
    }
  };

  const onStartTimeChange = (event, selectedDate) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      setPickerStartTime(selectedDate);
      const val = formatTimeStr(selectedDate);
      if (modalContext === 'edit') setEditStartTime(val);
      else setNewStartTime(val);
    }
  };

  const onEndTimeChange = (event, selectedDate) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      setPickerEndTime(selectedDate);
      const val = formatTimeStr(selectedDate);
      if (modalContext === 'edit') setEditEndTime(val);
      else setNewEndTime(val);
    }
  };

  const onReminderTimeChange = (event, selectedDate) => {
    setShowReminderPicker(false);
    if (selectedDate) {
      setPickerReminder(selectedDate);
      const val = formatTimeStr(selectedDate);
      if (modalContext === 'edit') setEditReminderTime(val);
      else setNewReminderTime(val);
    }
  };

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
  const [editPriority, setEditPriority] = useState('10');
  const [editTags, setEditTags] = useState('');
  const [editDeadlineDate, setEditDeadlineDate] = useState('');
  const [editDeadlineTime, setEditDeadlineTime] = useState('');
  const [editEmoji, setEditEmoji] = useState('📝');
  const [editRepeticion, setEditRepeticion] = useState('nunca');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editReminderTime, setEditReminderTime] = useState('');

  // Data States
  const [user, setUser] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);

  const resetModal = () => {
    setNewTitle('');
    setNewDesc('');
    setNewPriority('50');
    setNewTags('');
    setNewEmoji('🚀');
    setNewRepeticion('no_repetir');
    setNewStartTime('');
    setNewEndTime('');
    setNewReminderTime('');
    setNewDeadlineDate(getTodayDateString());
    
    setPickerDate(new Date());
    setPickerStartTime(new Date());
    setPickerEndTime(new Date());
    setPickerReminder(new Date());
  };

  const fetchData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('userToken');
      
      if (!storedUserData || !token) {
        setLoading(false);
        return;
      }
      
      const userData = JSON.parse(storedUserData);
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${token}`
      };

      // 1. Check streak (esto actualiza y devuelve el usuario)
      const userRes = await fetch(`${API_URL}/usuarios/${userData.id}/check-streak`, { 
        method: 'POST', 
        headers 
      });
      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u);
        await AsyncStorage.setItem('userData', JSON.stringify(u));
      }

      // 2. Tareas
      const tareasRes = await fetch(`${API_URL}/tareas/usuario/${userData.id}`, { headers });
      if (tareasRes.ok) {
        const t = await tareasRes.json();
        setTareas(t);
      }

      // 3. Rutinas
      const rutinasRes = await fetch(`${API_URL}/rutinas/usuario/${userData.id}`, { headers });
      if (rutinasRes.ok) {
        const r = await rutinasRes.json();
        setRutinas(r);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      
      // Auto-scroll the calendar to center today (index 7)
      setTimeout(() => {
        if (calendarRef.current) {
          // Pill width + margin is approx 60. Center index 7:
          const offsetX = (7 * 60) - (width / 2) + 30;
          calendarRef.current.scrollTo({ x: offsetX, animated: true });
        }
      }, 500); // 500ms to ensure layout is ready
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
    setModalContext('edit');
    setSelectedTask(task);
    setEditTitle(task.titulo);
    setEditDesc(task.descripcion || '');
    setEditPriority((task.xp_recompensa || 10).toString());
    setEditTags(task.tags || '');
    setEditEmoji(task.emoji || '📝');
    setEditRepeticion(task.repeticion || 'nunca');
    
    // Si viene la fecha límite con hora o los tiempos por separado
    setEditStartTime(task.tiempo_inicio || '');
    setEditEndTime(task.tiempo_fin || '');
    setEditReminderTime(task.recordatorio_hora || '');

    if (task.fecha_limite) {
      const parts = task.fecha_limite.split('T');
      setEditDeadlineDate(parts[0] || getTodayDateString());
      if (parts[1] && !task.tiempo_inicio) {
        setEditStartTime(parts[1].substring(0,5));
      }
    } else {
      setEditDeadlineDate('');
    }

    setEditModalVisible(true);
  };

  // Handle toggling task state API call
  const toggleTarea = async (id) => {
    const task = tareas.find(t => t.id === id);
    if (!task) return;
    
    // Optimistic UI update
    setTareas(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleting = t.estado === 'pendiente';
        if (isCompleting) {
          if (!t.xp_otorgada) {
            showToast('¡Tarea completada! +XP');
          } else {
            showToast('¡Tarea completada!');
          }
        }
        // Marcar xp_otorgada localmente de manera optimista
        return { ...t, estado: isCompleting ? 'completada' : 'pendiente', xp_otorgada: t.xp_otorgada || isCompleting };
      }
      return t;
    }));
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${token}`
      };
      
      const payload = { ...task, estado: task.estado === 'completada' ? 'pendiente' : 'completada' };
      const res = await fetch(`${API_URL}/tareas/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        // Revert on error
        setTareas(prev => prev.map(t => t.id === id ? { ...t, estado: task.estado } : t));
        Alert.alert("Error", "No se pudo actualizar la tarea");
      } else {
        // Refetch user to get new XP and streak
        fetchData();
      }
    } catch (e) {
      // Revert on error
      setTareas(prev => prev.map(t => t.id === id ? { ...t, estado: task.estado } : t));
      Alert.alert("Error", "Problema de red");
    }
  };

  const toggleRoutineTarea = async (routineId, subTaskId) => {
    // Optimistic Update
    setRutinas(prev => prev.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          tareas: r.tareas.map(st => {
            if (st.id === subTaskId) {
              const isCompleting = st.estado === 'pendiente';
              if (isCompleting) {
                if (!st.xp_otorgada) {
                  showToast('¡Hábito completado! +XP');
                } else {
                  showToast('¡Hábito completado!');
                }
              }
              return { ...st, estado: isCompleting ? 'completada' : 'pendiente', xp_otorgada: st.xp_otorgada || isCompleting };
            }
            return st;
          })
        };
      }
      return r;
    }));
    
    // In a real app we'd call the toggle-tarea API endpoint for this subtask too.
    // For now we assume routine subtasks are just tasks in the DB.
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Content-Type': 'application/json', 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` };
      
      let subTaskToToggle = null;
      rutinas.forEach(r => { if (r.id === routineId) { subTaskToToggle = r.tareas.find(t => t.id === subTaskId); }});
      
      if (subTaskToToggle) {
        const payload = { ...subTaskToToggle, estado: subTaskToToggle.estado === 'completada' ? 'pendiente' : 'completada' };
        await fetch(`${API_URL}/tareas/${subTaskId}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
        fetchData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleRemoveTaskFromRoutine = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/tareas/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rutina_id: null })
      });
      if (res.ok) fetchData();
      else Alert.alert("Error", "No se pudo remover la tarea");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTaskToRoutine = async (taskId, routineId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/tareas/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rutina_id: routineId })
      });
      if (res.ok) fetchData();
      else Alert.alert("Error", "No se pudo añadir la tarea a la rutina");
    } catch (e) {
      console.error(e);
    }
  };

  const openSelectTaskModal = (routineId) => {
    setSelectedRoutineForTask(routineId);
    setSelectTaskModalVisible(true);
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = JSON.parse(await AsyncStorage.getItem('userData'));
      let deadlineStr = newDeadlineDate;
      if (newDeadlineDate && newStartTime) {
        deadlineStr = `${newDeadlineDate}T${newStartTime}:00`;
      } else if (newDeadlineDate) {
        deadlineStr = `${newDeadlineDate}T23:59:00`; // Por defecto al final del día
      }

      const payload = {
        titulo: newTitle,
        descripcion: newDesc,
        estado: 'pendiente',
        xp_recompensa: parseInt(newPriority) || 30,
        es_critica: parseInt(newPriority) >= 80,
        tags: newTags,
        emoji: newEmoji,
        repeticion: newRepeticion,
        tiempo_inicio: newStartTime || null,
        tiempo_fin: newEndTime || null,
        recordatorio_hora: newReminderTime || null,
        fecha_limite: deadlineStr || null,
        usuario_id: userData.id
      };
      
      const res = await fetch(`${API_URL}/tareas/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const newTask = await res.json();
        setTareas([...tareas, newTask]);
        setModalVisible(false);
        resetModal();
        showToast('¡Nueva tarea añadida!');
        fetchData();
      } else {
        const errText = await res.text();
        console.log("Error creando tarea:", errText);
        setModalVisible(false);
        setTimeout(() => {
          Alert.alert("Error", "No se pudo crear la tarea. " + errText);
        }, 500);
      }
    } catch (e) {
      console.log("Excepción al crear tarea:", e);
      setModalVisible(false);
      setTimeout(() => {
        Alert.alert("Error de red", "No se pudo conectar al servidor.");
      }, 500);
    }
  };

  const handleCreateRoutine = async () => {
    // For now, this is mocked as we might not have a POST /rutinas endpoint ready
    setModalVisible(false);
    Alert.alert("Info", "Endpoint de crear rutina en progreso");
  };

  const handleEditTaskSubmit = async (applyToSeries = false) => {
    if (!editTitle.trim()) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const payload = {
        titulo: editTitle,
        descripcion: editDesc || 'Sin descripción',
        es_critica: parseInt(editPriority) >= 80,
        xp_recompensa: parseInt(editPriority),
        tags: editTags || 'General',
        emoji: editEmoji,
        repeticion: editRepeticion,
        tiempo_inicio: editStartTime || null,
        tiempo_fin: editEndTime || null,
        recordatorio_hora: editReminderTime || null,
        fecha_limite: editDeadlineDate ? `${editDeadlineDate}T${editStartTime || '23:59'}:00` : null
      };

      const url = `${API_URL}/tareas/${selectedTask.id}${applyToSeries ? '?apply_to_series=true' : ''}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchData();
        setEditModalVisible(false);
        showToast('¡Tarea guardada!');
      } else {
        Alert.alert("Error", "No se pudo actualizar la tarea");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Problema de red al actualizar la tarea");
    }
  };

  const handleDeleteTaskSubmit = async (applyToSeries = false) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const url = `${API_URL}/tareas/${selectedTask.id}${applyToSeries ? '?apply_to_series=true' : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        setEditModalVisible(false);
        showToast('Tarea eliminada');
      } else {
        Alert.alert("Error", "No se pudo eliminar la tarea en el servidor.");
      }
    } catch (e) {
      Alert.alert("Error", "Problema de red al eliminar la tarea.");
    }
  };

  const handleDeleteRoutine = (routineId) => {
    Alert.alert(
      "Eliminar Rutina",
      "¿Estás seguro que deseas eliminar esta rutina? Se borrarán todas las tareas asociadas.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const res = await fetch(`${API_URL}/rutinas/${routineId}`, {
                method: 'DELETE',
                headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` }
              });
              
              if (res.ok) {
                setRutinas(prev => prev.filter(r => r.id !== routineId));
                showToast("Rutina eliminada correctamente");
              } else {
                Alert.alert("Error", "No se pudo eliminar la rutina del servidor.");
              }
            } catch (e) {
              console.log("Error al eliminar rutina:", e);
              Alert.alert("Error", "Ocurrió un problema de red.");
            }
          }
        }
      ]
    );
  };



  const filteredTareas = tareas.filter(t => {
    if (t.rutina_id !== null && t.rutina_id !== undefined && t.rutina_id !== 0) return false;
    
    if (!t.fecha_limite) return false;

    const taskDate = t.fecha_limite.split('T')[0].split(' ')[0];
    if (taskDate !== selectedDate) return false;

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
        <View style={styles.appBarRight}>
          <View style={styles.appBarStreakBadge}>
            <Text style={styles.appBarStreakText}>{user?.racha_actual || 0} Días de Racha</Text>
            <Ionicons name="flame-outline" size={16} color="#ea580c" style={{ marginLeft: 2 }} />
          </View>
          <TouchableOpacity 
            style={styles.appBarAvatar}
            onPress={() => navigation.navigate('Perfil')}
          >
            {user?.foto_perfil ? (
              <Image 
                source={{ uri: user.foto_perfil.startsWith('http') ? user.foto_perfil : `${API_URL.replace('/api/v1', '')}${user.foto_perfil}` }}
                style={{ width: '100%', height: '100%', borderRadius: 18 }}
              />
            ) : (
              <Text style={styles.appBarAvatarText}>{user?.nombre_usuario?.[0]?.toUpperCase() || 'U'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Conquista tu Día Header */}
        <View style={styles.conquistaCard}>
          <View style={styles.conquistaHeaderRow}>
            <View>
              <Text style={styles.conquistaTitle}>Conquista tu Día</Text>
              <Text style={styles.conquistaSubtitle}>
                Tienes <Text style={{fontWeight: '800', color: '#111827'}}>{tareas.filter(t => {
                  if (t.rutina_id || t.estado !== 'pendiente') return false;
                  const todayStr = getTodayDateString();
                  const taskDate = t.fecha_limite ? t.fecha_limite.split('T')[0].split(' ')[0] : todayStr;
                  return taskDate === selectedDate;
                }).length} tareas</Text> esperándote.
              </Text>
            </View>
          </View>

          <View style={styles.conquistaPillsRow}>
            <View style={styles.conquistaPillRacha}>
              <Ionicons name="flame-outline" size={16} color="#ea580c" />
              <View style={{marginLeft: 6}}>
                <Text style={styles.pillLabel}>RACHA</Text>
                <Text style={styles.pillValueRacha}>{user?.racha_actual || 0} Días</Text>
              </View>
            </View>

            <View style={styles.conquistaPillNivel}>
              <Ionicons name="star-outline" size={16} color="#eab308" />
              <View style={{marginLeft: 6}}>
                <Text style={styles.pillLabel}>NIVEL {user?.nivel_id || 1}</Text>
                <Text style={styles.pillValueNivel}>{user?.xp_total || 0} / 500</Text>
              </View>
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
              <Text style={styles.sectionTitle}>Feed de Tareas</Text>
              <Text style={styles.sectionSubtitle}>
                Revisa tus actividades importantes del día y complétalas.
              </Text>
            </View>

            {/* Calendario Horizontal */}
            <ScrollView
              ref={calendarRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.calendarScroll}
              style={styles.calendarContainer}
            >
              {calendarDays.map(day => (
                <TouchableOpacity
                  key={day.dateString}
                  style={[
                    styles.calendarPill,
                    selectedDate === day.dateString && styles.calendarPillActive
                  ]}
                  onPress={() => setSelectedDate(day.dateString)}
                >
                  <Text style={[styles.calendarDayName, selectedDate === day.dateString && styles.calendarDayNameActive]}>
                    {day.dayName}
                  </Text>
                  <Text style={[styles.calendarDayNum, selectedDate === day.dateString && styles.calendarDayNumActive]}>
                    {day.dayNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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
                const isToday = selectedDate === getTodayDateString();
                return (
                  <View
                    key={item.id}
                    style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
                  >
                    <View style={{flex: 1, width: '100%'}}>
                      <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12}}>
                          <Text style={{fontSize: 18, marginRight: 8, opacity: isCompleted ? 0.5 : 1}}>
                            {item.emoji || '📝'}
                          </Text>
                          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted, {flex: 1}]}>
                            {item.titulo}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.checkboxCircle, isCompleted && styles.checkboxCircleChecked, !isToday && {opacity: 0.5}]}
                          onPress={() => {
                            if (!isToday) {
                              showToast('Solo puedes marcar tareas del día actual.');
                              return;
                            }
                            toggleTarea(item.id);
                          }}
                          activeOpacity={isToday ? 0.7 : 1}
                        >
                          {isCompleted && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.taskDesc, isCompleted && styles.taskDescCompleted]}>
                        {item.descripcion}
                      </Text>
                      
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12}}>
                        <View>
                          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
                            {item.es_critica ? (
                              <View style={styles.criticalBadge}>
                                <Text style={styles.criticalText}>CRÍTICA +{item.xp_recompensa || 30} XP</Text>
                              </View>
                            ) : (
                              <View style={[styles.criticalBadge, {backgroundColor: '#f3ebff', borderColor: '#e9d5ff'}]}>
                                <Text style={[styles.criticalText, {color: '#6e00ff'}]}>
                                  {item.xp_recompensa > 50 ? 'ALTA' : (item.xp_recompensa > 20 ? 'MEDIA' : 'BAJA')} +{item.xp_recompensa || 30} XP
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.badgesContainer}>
                            {(item.tags || '').split(',').map((tag, idx) => {
                              if (!tag.trim()) return null;
                              return (
                                <View key={idx} style={[styles.tagBadge, { marginRight: 6, marginBottom: 4 }]}>
                                  <Text style={styles.tagBadgeText}>{tag.trim()}</Text>
                                </View>
                              );
                            })}
                            {item.fecha_limite && (
                              <View style={styles.deadlineBadge}>
                                <Ionicons name="calendar-outline" size={11} color="#4b5563" style={{ marginRight: 3 }} />
                                <Text style={styles.deadlineBadgeText}>{item.fecha_limite.split('T')[0].split(' ')[0]}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        
                        <View style={{flexDirection: 'row', gap: 12}}>
                          <TouchableOpacity 
                            onPress={() => {
                              if (!isToday) {
                                showToast('Solo puedes editar tareas del día actual.');
                                return;
                              }
                              openEditTask(item);
                            }}
                            activeOpacity={isToday ? 0.7 : 1}
                          >
                            <Ionicons name="pencil" size={20} color={isToday ? "#eab308" : "#d1d5db"} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              if (!isToday) {
                                showToast('Solo puedes eliminar tareas del día actual.');
                                return;
                              }
                              setTareas(prev => prev.filter(t => t.id !== item.id));
                            }}
                            activeOpacity={isToday ? 0.7 : 1}
                          >
                            <Ionicons name="trash-outline" size={20} color={isToday ? "#ef4444" : "#d1d5db"} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
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
                    <Text style={styles.routineName}>{routine.nombre}</Text>
                    <TouchableOpacity onPress={() => handleDeleteRoutine(routine.id)}>
                      <Ionicons name="trash-outline" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.routineDivider} />
                  
                  {routine.tareas.length === 0 ? (
                    <Text style={styles.noSubtasksText}>No hay tareas en esta rutina.</Text>
                  ) : (
                    routine.tareas.map(st => {
                      const isStCompleted = st.estado === 'completada';
                      return (
                        <View key={st.id} style={styles.subtaskRow}>
                          <View style={styles.subtaskLeft}>
                            <TouchableOpacity
                              style={[styles.subCheckbox, isStCompleted && styles.subCheckboxChecked]}
                              onPress={() => toggleRoutineTarea(routine.id, st.id)}
                            >
                              {isStCompleted && <Ionicons name="checkmark" size={12} color="#ffffff" />}
                            </TouchableOpacity>
                            <View style={styles.subtaskTextGroup}>
                              <Text style={[styles.subtaskTitle, isStCompleted && styles.subtaskTitleCompleted]}>
                                {st.titulo}
                              </Text>
                            </View>
                          </View>
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={[styles.subtaskXp, isStCompleted && {color: '#9ca3af'}]}>+{st.xp_recompensa || 10} XP</Text>
                            <TouchableOpacity onPress={() => handleRemoveTaskFromRoutine(st.id)} style={{marginLeft: 8, padding: 4}}>
                              <Ionicons name="trash-outline" size={18} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                  
                  <TouchableOpacity 
                    style={styles.routineAddBtn} 
                    onPress={() => openSelectTaskModal(routine.id)}
                  >
                    <Text style={styles.routineAddBtnText}>+ AÑADIR TAREA</Text>
                  </TouchableOpacity>
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
                {/* ICONO y NOMBRE */}
                <View style={styles.inputGroup}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.modalLabelSmall, {width: 60}]}>ICONO</Text>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={styles.modalLabelSmall}>NOMBRE</Text>
                      <Text style={styles.modalLabelSmall}>{newTitle.length}/50</Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity style={styles.iconPickerBtn} onPress={() => setShowEmojiPicker(true)}>
                      <Text style={{fontSize: 24}}>{newEmoji}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.modalInput, {flex: 1, marginLeft: 12, marginBottom: 0}]}
                      placeholder="Nombre de la actividad o tarea"
                      value={newTitle}
                      onChangeText={setNewTitle}
                      maxLength={50}
                    />
                  </View>
                </View>

                {/* DESCRIPCION */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabelSmall}>DESCRIPCION</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextArea]}
                    placeholder="Añadir una descripcion"
                    multiline={true}
                    numberOfLines={3}
                    value={newDesc}
                    onChangeText={setNewDesc}
                  />
                </View>

                {/* DIA DE INICIO & PRIORIDAD */}
                <View style={{flexDirection: 'row', marginBottom: 16}}>
                  {/* Left Column */}
                  <View style={{flex: 1, paddingRight: 8}}>
                    <Text style={styles.modalLabelSmall}>DIA DE INICIO</Text>
                    <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowDatePicker(true)}>
                      <Text style={[styles.modalInputNoMargin, {color: newDeadlineDate ? '#1f2937' : '#9ca3af'}]}>
                        {newDeadlineDate || 'dd/mm/aaaa'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.inputIconRight} />
                    </TouchableOpacity>

                    <Text style={[styles.modalLabelSmall, {marginTop: 16}]}>REPETICION</Text>
                    <TouchableOpacity 
                      style={styles.dropdownBtn}
                      onPress={() => setShowRepetitionPicker(true)}
                    >
                      <Text style={styles.dropdownBtnText}>
                        {REPETITION_OPTIONS.find(opt => opt.value === newRepeticion)?.label}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <Text style={[styles.modalLabelSmall, {marginTop: 16}]}>HORARIO</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <TouchableOpacity style={[styles.inputWithIcon, {flex: 1}]} onPress={() => setShowStartTimePicker(true)}>
                        <Text style={[styles.modalInputNoMargin, {color: newStartTime ? '#1f2937' : '#9ca3af'}]}>
                          {newStartTime || '--:--'}
                        </Text>
                        <Ionicons name="time-outline" size={16} color="#9ca3af" style={styles.inputIconRight} />
                      </TouchableOpacity>
                      <Text style={{marginHorizontal: 8, color: '#9ca3af'}}>a</Text>
                      <TouchableOpacity style={[styles.inputWithIcon, {flex: 1}]} onPress={() => setShowEndTimePicker(true)}>
                        <Text style={[styles.modalInputNoMargin, {color: newEndTime ? '#1f2937' : '#9ca3af'}]}>
                          {newEndTime || '--:--'}
                        </Text>
                        <Ionicons name="time-outline" size={16} color="#9ca3af" style={styles.inputIconRight} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.modalLabelSmall, {marginTop: 16}]}>RECORDATORIO</Text>
                    <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowReminderPicker(true)}>
                      <Text style={[styles.modalInputNoMargin, {color: newReminderTime ? '#1f2937' : '#9ca3af'}]}>
                        {newReminderTime || '--:--'}
                      </Text>
                      <Ionicons name="time-outline" size={20} color="#9ca3af" style={styles.inputIconRight} />
                    </TouchableOpacity>
                  </View>

                  {/* Right Column (PRIORIDAD / XP) */}
                  <View style={{flex: 1, paddingLeft: 8}}>
                    <Text style={styles.modalLabelSmall}>PRIORIDAD / XP</Text>
                    <View style={styles.priorityGrid}>
                      {[
                        {val: '20', label: 'Baja', xp: '+20 XP'},
                        {val: '50', label: 'Media', xp: '+50 XP'},
                        {val: '80', label: 'Alta', xp: '+80 XP'},
                        {val: '100', label: 'Crítica', xp: '+100 XP'},
                      ].map(opt => (
                        <TouchableOpacity
                          key={opt.val}
                          style={[
                            styles.priorityGridItem,
                            newPriority === opt.val && styles.priorityGridItemActive
                          ]}
                          onPress={() => setNewPriority(opt.val)}
                        >
                          <Text style={[styles.priorityGridLabel, newPriority === opt.val && styles.priorityGridLabelActive]}>{opt.label}</Text>
                          <Text style={[styles.priorityGridXp, newPriority === opt.val && styles.priorityGridXpActive]}>{opt.xp}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* TAGS */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabelSmall}>TAGS</Text>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      style={styles.modalInputNoMargin}
                      placeholder="Ej. #DesignSystem (Presiona Enter)"
                      value={newTags}
                      onChangeText={setNewTags}
                    />
                    <TouchableOpacity style={styles.addTagBtn}>
                      <Text style={styles.addTagBtnText}>Añadir</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.modalFooterActions}>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{padding: 10}}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addBtn} onPress={handleCreateTask}>
                    <Ionicons name="add" size={20} color="#ffffff" style={{marginRight: 4}} />
                    <Text style={styles.addBtnText}>Añadir</Text>
                  </TouchableOpacity>
                </View>
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
                {/* ICONO y NOMBRE */}
                <View style={styles.inputGroup}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.modalLabelSmall, {width: 60}]}>ICONO</Text>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={styles.modalLabelSmall}>NOMBRE</Text>
                      <Text style={styles.modalLabelSmall}>{editTitle.length}/50</Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity style={styles.iconPickerBtn} onPress={() => setShowEmojiPicker(true)}>
                      <Text style={{fontSize: 24}}>{editEmoji}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.modalInput, {flex: 1, marginLeft: 12, marginBottom: 0}]}
                      placeholder="Nombre de la actividad o tarea"
                      value={editTitle}
                      onChangeText={setEditTitle}
                      maxLength={50}
                    />
                  </View>
                </View>

                {/* DESCRIPCION */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabelSmall}>DESCRIPCION</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextArea]}
                    placeholder="Añadir una descripcion"
                    multiline={true}
                    numberOfLines={3}
                    value={editDesc}
                    onChangeText={setEditDesc}
                  />
                </View>

                {/* DIA DE INICIO & PRIORIDAD */}
                <View style={{flexDirection: 'row', marginBottom: 16}}>
                  {/* Left Column */}
                  <View style={{flex: 1, paddingRight: 8}}>
                    <Text style={styles.modalLabelSmall}>DIA DE INICIO</Text>
                    <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowDatePicker(true)}>
                      <Text style={[styles.modalInputNoMargin, {color: editDeadlineDate ? '#1f2937' : '#9ca3af'}]}>
                        {editDeadlineDate || 'dd/mm/aaaa'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.inputIconRight} />
                    </TouchableOpacity>

                    <Text style={[styles.modalLabelSmall, {marginTop: 16}]}>REPETICION</Text>
                    <TouchableOpacity 
                      style={styles.dropdownBtn}
                      onPress={() => setShowRepetitionPicker(true)}
                    >
                      <Text style={styles.dropdownBtnText}>
                        {REPETITION_OPTIONS.find(opt => opt.value === editRepeticion)?.label || 'Nunca'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <Text style={[styles.modalLabelSmall, {marginTop: 16}]}>HORARIO</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <TouchableOpacity style={[styles.inputWithIcon, {flex: 1}]} onPress={() => setShowStartTimePicker(true)}>
                        <Text style={[styles.modalInputNoMargin, {color: editStartTime ? '#1f2937' : '#9ca3af'}]}>
                          {editStartTime || '--:--'}
                        </Text>
                        <Ionicons name="time-outline" size={16} color="#9ca3af" style={styles.inputIconRight} />
                      </TouchableOpacity>
                      <Text style={{marginHorizontal: 8, color: '#9ca3af'}}>a</Text>
                      <TouchableOpacity style={[styles.inputWithIcon, {flex: 1}]} onPress={() => setShowEndTimePicker(true)}>
                        <Text style={[styles.modalInputNoMargin, {color: editEndTime ? '#1f2937' : '#9ca3af'}]}>
                          {editEndTime || '--:--'}
                        </Text>
                        <Ionicons name="time-outline" size={16} color="#9ca3af" style={styles.inputIconRight} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.modalLabelSmall, {marginTop: 16}]}>RECORDATORIO</Text>
                    <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowReminderPicker(true)}>
                      <Text style={[styles.modalInputNoMargin, {color: editReminderTime ? '#1f2937' : '#9ca3af'}]}>
                        {editReminderTime || '--:--'}
                      </Text>
                      <Ionicons name="time-outline" size={20} color="#9ca3af" style={styles.inputIconRight} />
                    </TouchableOpacity>
                  </View>

                  {/* Right Column (PRIORIDAD / XP) */}
                  <View style={{flex: 1, paddingLeft: 8}}>
                    <Text style={styles.modalLabelSmall}>PRIORIDAD / XP</Text>
                    <View style={styles.priorityGrid}>
                      {[
                        {val: '20', label: 'Baja', xp: '+20 XP'},
                        {val: '50', label: 'Media', xp: '+50 XP'},
                        {val: '80', label: 'Alta', xp: '+80 XP'},
                        {val: '100', label: 'Crítica', xp: '+100 XP'},
                      ].map(opt => (
                        <TouchableOpacity
                          key={opt.val}
                          style={[
                            styles.priorityGridItem,
                            editPriority === opt.val && styles.priorityGridItemActive
                          ]}
                          onPress={() => setEditPriority(opt.val)}
                        >
                          <Text style={[styles.priorityGridLabel, editPriority === opt.val && styles.priorityGridLabelActive]}>{opt.label}</Text>
                          <Text style={[styles.priorityGridXp, editPriority === opt.val && styles.priorityGridXpActive]}>{opt.xp}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* TAGS */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabelSmall}>TAGS</Text>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      style={styles.modalInputNoMargin}
                      placeholder="Ej. #DesignSystem (Presiona Enter)"
                      value={editTags}
                      onChangeText={setEditTags}
                    />
                    <TouchableOpacity style={styles.addTagBtn}>
                      <Text style={styles.addTagBtnText}>Añadir</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.modalFooterActions}>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{padding: 10}}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addBtn} onPress={() => {
                    if (selectedTask.grupo_id) {
                      Alert.alert(
                        "Editar Tarea Recurrente",
                        "¿Deseas aplicar estos cambios solo a esta tarea o a toda la serie?",
                        [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Solo esta tarea", onPress: () => handleEditTaskSubmit(false) },
                          { text: "Toda la serie", onPress: () => handleEditTaskSubmit(true) }
                        ]
                      );
                    } else {
                      handleEditTaskSubmit(false);
                    }
                  }}>
                    <Ionicons name="save-outline" size={20} color="#ffffff" style={{marginRight: 4}} />
                    <Text style={styles.addBtnText}>Guardar</Text>
                  </TouchableOpacity>
                </View>

                {/* Delete button */}
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#ef4444', marginTop: 12 }]}
                  onPress={() => {
                    if (selectedTask.grupo_id) {
                      Alert.alert(
                        "Eliminar Tarea Recurrente",
                        "¿Deseas eliminar solo esta tarea o toda la serie?",
                        [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Solo esta tarea", style: "destructive", onPress: () => handleDeleteTaskSubmit(false) },
                          { text: "Toda la serie", style: "destructive", onPress: () => handleDeleteTaskSubmit(true) }
                        ]
                      );
                    } else {
                      Alert.alert(
                        "Eliminar Tarea",
                        "¿Estás seguro que deseas eliminar esta tarea?",
                        [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Eliminar", style: "destructive", onPress: () => handleDeleteTaskSubmit(false) }
                        ]
                      );
                    }
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

      {/* Modal para seleccionar tarea existente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectTaskModalVisible}
        onRequestClose={() => setSelectTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Tarea a Rutina</Text>
              <TouchableOpacity onPress={() => setSelectTaskModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{maxHeight: 400, marginTop: 10}}>
              {tareas.filter(t => {
                if (t.rutina_id === selectedRoutineForTask) return false;
                const todayStr = getTodayDateString();
                const taskDate = t.fecha_limite ? t.fecha_limite.split('T')[0].split(' ')[0] : todayStr;
                return taskDate === todayStr;
              }).length === 0 ? (
                <Text style={{textAlign: 'center', color: '#6b7280', marginVertical: 20}}>No hay tareas disponibles para añadir.</Text>
              ) : (
                tareas.filter(t => {
                  if (t.rutina_id === selectedRoutineForTask) return false;
                  const todayStr = getTodayDateString();
                  const taskDate = t.fecha_limite ? t.fecha_limite.split('T')[0].split(' ')[0] : todayStr;
                  return taskDate === todayStr;
                }).map(t => (
                  <TouchableOpacity 
                    key={t.id} 
                    style={{padding: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}
                    onPress={() => {
                      handleAddTaskToRoutine(t.id, selectedRoutineForTask);
                      setSelectTaskModalVisible(false);
                    }}
                  >
                    <Text style={{fontWeight: 'bold', color: '#111827', fontSize: 16}}>{t.titulo}</Text>
                    <Text style={{fontSize: 13, color: '#6b7280', marginTop: 2}}>{t.descripcion || 'Sin descripción'}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Emoji Picker Modal */}
      <Modal visible={showEmojiPicker} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowEmojiPicker(false)}>
          <View style={styles.emojiPickerContainer}>
            <Text style={{fontWeight: '800', marginBottom: 12}}>Elige un ícono</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
              {EMOJI_LIST.map(em => (
                <TouchableOpacity 
                  key={em} 
                  style={styles.emojiBtn}
                  onPress={() => {
                    if (modalContext === 'edit') setEditEmoji(em);
                    else setNewEmoji(em);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text style={{fontSize: 28}}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Repetition Picker Modal */}
      <Modal visible={showRepetitionPicker} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowRepetitionPicker(false)}>
          <View style={styles.repetitionPickerContainer}>
            <Text style={{fontWeight: '800', marginBottom: 12}}>Repetición</Text>
            {REPETITION_OPTIONS.map(opt => {
              const isActive = (modalContext === 'edit' ? editRepeticion : newRepeticion) === opt.value;
              return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.repetitionOption, isActive && styles.repetitionOptionActive]}
                onPress={() => {
                  if (modalContext === 'edit') setEditRepeticion(opt.value);
                  else setNewRepeticion(opt.value);
                  setShowRepetitionPicker(false);
                }}
              >
                <Text style={[styles.repetitionOptionText, isActive && styles.repetitionOptionTextActive]}>
                  {opt.label}
                </Text>
                {isActive && <Ionicons name="checkmark" size={20} color="#6e00ff" />}
              </TouchableOpacity>
            )})}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* DateTime Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}
      {showStartTimePicker && (
        <DateTimePicker
          value={pickerStartTime}
          mode="time"
          display="default"
          onChange={onStartTimeChange}
        />
      )}
      {showEndTimePicker && (
        <DateTimePicker
          value={pickerEndTime}
          mode="time"
          display="default"
          onChange={onEndTimeChange}
        />
      )}
      {showReminderPicker && (
        <DateTimePicker
          value={pickerReminder}
          mode="time"
          display="default"
          onChange={onReminderTimeChange}
        />
      )}
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
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  appBarStreakText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6e00ff',
    marginRight: 4,
  },
  appBarStreakEmoji: {
    fontSize: 14,
  },
  appBarAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6e00ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
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
  conquistaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 20,
  },
  conquistaHeaderRow: {
    marginBottom: 20,
  },
  overlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3ebff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  conquistaOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6e00ff',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  conquistaTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  conquistaSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  conquistaPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  conquistaPillRacha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  conquistaPillNivel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fef9c3',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
  pillValueRacha: {
    fontSize: 13,
    fontWeight: '800',
    color: '#c2410c',
  },
  pillValueNivel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#a16207',
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
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#6e00ff',
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: '#fafbfc',
    borderColor: '#f3f4f6',
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
    backgroundColor: '#faf5ff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3ebff',
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
    fontSize: 16,
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
    backgroundColor: '#e9d5ff',
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
    borderBottomColor: '#f3ebff',
  },
  subtaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subCheckboxChecked: {
    backgroundColor: '#6e00ff',
    borderColor: '#6e00ff',
  },
  subtaskTextGroup: {
    flex: 1,
    paddingRight: 8,
  },
  subtaskTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#6e00ff',
  },
  routineAddBtn: {
    backgroundColor: 'rgba(110, 0, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  routineAddBtnText: {
    color: '#6e00ff',
    fontWeight: '800',
    fontSize: 12,
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
  calendarContainer: {
    marginBottom: 16,
  },
  calendarScroll: {
    paddingHorizontal: 4,
    gap: 8,
  },
  calendarPill: {
    width: 52,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  calendarPillActive: {
    backgroundColor: '#6e00ff',
    borderColor: '#6e00ff',
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  calendarDayName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 4,
  },
  calendarDayNameActive: {
    color: '#e9d5ff',
  },
  calendarDayNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  calendarDayNumActive: {
    color: '#ffffff',
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#1f2937',
    borderColor: '#1f2937',
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
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 4,
  },
  deadlineBadgeText: {
    fontSize: 10,
    color: '#4b5563',
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
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  toastText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46',
  },
  // New Styles for Task Creation
  inputGroup: {
    marginBottom: 16,
  },
  modalLabelSmall: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9ca3af',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  iconPickerBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  modalInputNoMargin: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  inputIconRight: {
    paddingRight: 10,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownBtnText: {
    fontSize: 14,
    color: '#1f2937',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  priorityGridItem: {
    width: '47%',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  priorityGridItemActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  priorityGridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  priorityGridLabelActive: {
    color: '#2563eb',
  },
  priorityGridXp: {
    fontSize: 11,
    color: '#9ca3af',
  },
  priorityGridXpActive: {
    color: '#3b82f6',
  },
  addTagBtn: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  addTagBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  modalFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cancelBtnText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6e00ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  emojiPickerContainer: {
    backgroundColor: '#ffffff',
    margin: 40,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  emojiBtn: {
    padding: 10,
  },
  repetitionPickerContainer: {
    backgroundColor: '#ffffff',
    margin: 40,
    padding: 20,
    borderRadius: 16,
  },
  repetitionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  repetitionOptionActive: {
    backgroundColor: '#faf5ff',
  },
  repetitionOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  repetitionOptionTextActive: {
    color: '#6e00ff',
    fontWeight: '700',
  },
});
