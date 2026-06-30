import React, { useState } from 'react';
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
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function InicioScreen() {
  const [activeTab, setActiveTab] = useState('tareas'); // 'tareas' | 'rutinas' | 'plantillas'
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('task'); // 'task' | 'routine'

  // Form states for new task/routine
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('50');
  const [newTags, setNewTags] = useState('');

  // Mock initial tasks with local state to allow toggling completion status
  const [tareas, setTareas] = useState([
    { id: '1', titulo: 'Completar informe final', descripcion: 'Redactar conclusiones y enviar al equipo de PI.', es_critica: true, xp_recompensa: 90, estado: 'pendiente', tags: 'Trabajo,Urgente' },
    { id: '2', titulo: 'Revisar documentación de API', descripcion: 'Verificar los nuevos endpoints de FastAPI.', es_critica: false, xp_recompensa: 40, estado: 'pendiente', tags: 'Estudio' },
    { id: '3', titulo: 'Comprar víveres', descripcion: 'Frutas, verduras y leche de almendra.', es_critica: false, xp_recompensa: 10, estado: 'completada', tags: 'Personal' },
    { id: '4', titulo: 'Cita con el dentista', descripcion: 'Limpieza semestral a las 4:00 PM.', es_critica: true, xp_recompensa: 85, estado: 'pendiente', tags: 'Salud' },
  ]);

  // Mock initial routines with local state
  const [rutinas, setRutinas] = useState([
    {
      id: 'r1',
      nombre: 'Mañana Maestra',
      esta_activa: true,
      tareas: [
        { id: 'rt1', titulo: 'Hidratación', descripcion: 'Beber 500ml de agua', xp_recompensa: 5, estado: 'pendiente' },
        { id: 'rt2', titulo: 'Estiramiento', descripcion: 'Movilidad ligera', xp_recompensa: 10, estado: 'completada' },
        { id: 'rt3', titulo: 'Meditación', descripcion: 'Respiración consciente', xp_recompensa: 15, estado: 'pendiente' }
      ]
    },
    {
      id: 'r2',
      nombre: 'Bloque de Enfoque Nocturno',
      esta_activa: true,
      tareas: [
        { id: 'rt4', titulo: 'Planificar el día siguiente', descripcion: 'Definir 3 prioridades del mañana', xp_recompensa: 20, estado: 'pendiente' },
        { id: 'rt5', titulo: 'Lectura offline', descripcion: 'Leer 10 páginas de un libro físico', xp_recompensa: 15, estado: 'pendiente' }
      ]
    }
  ]);

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
    setRutinas(prev =>
      prev.map(r => {
        if (r.id === routineId) {
          return {
            ...r,
            tareas: r.tareas.map(st =>
              st.id === subTaskId ? { ...st, estado: st.estado === 'completada' ? 'pendiente' : 'completada' } : st
            )
          };
        }
        return r;
      })
    );
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
      tags: newTags || 'General'
    };
    setTareas([newTask, ...tareas]);
    setNewTitle('');
    setNewDesc('');
    setNewPriority('50');
    setNewTags('');
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

  // Handle adding template routine mockup
  const handleAddTemplate = (templateName) => {
    const templateRoutines = {
      'manana_maestra': {
        nombre: 'Mañana Maestra ☀️',
        tareas: [
          { id: 't_m1', titulo: 'Hidratación profunda', descripcion: '500ml agua con limón', xp_recompensa: 5, estado: 'pendiente' },
          { id: 't_m2', titulo: 'Movilidad ligera', descripcion: '10 minutos estiramiento', xp_recompensa: 10, estado: 'pendiente' },
          { id: 't_m3', titulo: 'Mindfulness', descripcion: 'Meditación guiada 5m', xp_recompensa: 15, estado: 'pendiente' }
        ]
      },
      'power_gym': {
        nombre: 'Cuerpo Activo ⚡',
        tareas: [
          { id: 't_g1', titulo: 'Calentamiento cardiovascular', descripcion: 'Cuerda o caminadora 10m', xp_recompensa: 10, estado: 'pendiente' },
          { id: 't_g2', titulo: 'Rutina de fuerza', descripcion: 'Pesas / calistenia', xp_recompensa: 35, estado: 'pendiente' },
          { id: 't_g3', titulo: 'Proteína e hidratación', descripcion: 'Batido y 1L de agua', xp_recompensa: 5, estado: 'pendiente' }
        ]
      }
    };

    const template = templateRoutines[templateName];
    if (template) {
      const newRoutine = {
        id: Date.now().toString(),
        nombre: template.nombre,
        esta_activa: true,
        tareas: template.tareas
      };
      setRutinas([newRoutine, ...rutinas]);
      setActiveTab('rutinas');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.appBarLogo}>
            <Ionicons name="flash" size={18} color="#ffffff" />
          </View>
          <Text style={styles.appBarTitle}>Priority Pulse</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#1f2937" />
          <View style={styles.notificationBadge} />
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

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'plantillas' && styles.tabButtonActive]}
            onPress={() => setActiveTab('plantillas')}
          >
            <Ionicons
              name="library-outline"
              size={16}
              color={activeTab === 'plantillas' ? '#6e00ff' : '#6b7280'}
            />
            <Text style={[styles.tabButtonText, activeTab === 'plantillas' && styles.tabButtonTextActive]}>
              Moldes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Views */}
        {activeTab === 'tareas' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tus tareas de hoy</Text>
              <Text style={styles.sectionSubtitle}>
                {tareas.filter(t => t.estado === 'pendiente').length} pendientes
              </Text>
            </View>

            {tareas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="sparkles-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>¡Todo al día! Disfruta tu racha.</Text>
              </View>
            ) : (
              tareas.map(item => {
                const isCompleted = item.estado === 'completada';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
                    onPress={() => toggleTarea(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.taskCardLeft}>
                      <TouchableOpacity
                        style={[styles.checkboxCircle, isCompleted && styles.checkboxCircleChecked]}
                        onPress={() => toggleTarea(item.id)}
                      >
                        {isCompleted && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                      </TouchableOpacity>

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
                            <View key={idx} style={styles.tagBadge}>
                              <Text style={styles.tagBadgeText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
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

        {activeTab === 'plantillas' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Biblioteca de Moldes</Text>
              <Text style={styles.sectionSubtitle}>Rutinas prediseñadas listas para activar</Text>
            </View>

            {/* Template Card 1 */}
            <View style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <View>
                  <Text style={styles.templateName}>Mañana Maestra ☀️</Text>
                  <Text style={styles.templateDesc}>Empieza el día con energía y claridad mental.</Text>
                </View>
                <View style={styles.templateXpBadge}>
                  <Text style={styles.templateXpText}>+35 XP Total</Text>
                </View>
              </View>
              <View style={styles.templateTasksList}>
                <Text style={styles.templateTaskItem}>• Hidratación (500ml agua con limón)</Text>
                <Text style={styles.templateTaskItem}>• Movilidad ligera (10m estiramiento)</Text>
                <Text style={styles.templateTaskItem}>• Mindfulness (Meditación guiada 5m)</Text>
              </View>
              <TouchableOpacity
                style={styles.templateAddBtn}
                onPress={() => handleAddTemplate('manana_maestra')}
              >
                <Ionicons name="add" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.templateAddBtnText}>Agregar a mi día</Text>
              </TouchableOpacity>
            </View>

            {/* Template Card 2 */}
            <View style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <View>
                  <Text style={styles.templateName}>Cuerpo Activo / Gym ⚡</Text>
                  <Text style={styles.templateDesc}>Activa tu cuerpo y libera endorfinas.</Text>
                </View>
                <View style={styles.templateXpBadge}>
                  <Text style={styles.templateXpText}>+50 XP Total</Text>
                </View>
              </View>
              <View style={styles.templateTasksList}>
                <Text style={styles.templateTaskItem}>• Calentamiento cardiovascular (10m)</Text>
                <Text style={styles.templateTaskItem}>• Rutina de fuerza (Pesas o calistenia)</Text>
                <Text style={styles.templateTaskItem}>• Proteína e hidratación de calidad</Text>
              </View>
              <TouchableOpacity
                style={styles.templateAddBtn}
                onPress={() => handleAddTemplate('power_gym')}
              >
                <Ionicons name="add" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.templateAddBtnText}>Agregar a mi día</Text>
              </TouchableOpacity>
            </View>
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

                {/* Priority */}
                <Text style={styles.modalLabel}>Prioridad / XP Recompensa (1 - 100)</Text>
                <View style={styles.priorityRow}>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                    keyboardType="numeric"
                    placeholder="50"
                    value={newPriority}
                    onChangeText={setNewPriority}
                  />
                  <Text style={styles.priorityNotice}>
                    {parseInt(newPriority) >= 80 ? '🔥 Tarea Crítica' : '⭐ Tarea Normal'}
                  </Text>
                </View>

                {/* Tags */}
                <Text style={styles.modalLabel}>Etiquetas (Separadas por comas)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej. Salud, Hábito"
                  value={newTags}
                  onChangeText={setNewTags}
                />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcfaff',
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
    color: '#cbd5e1',
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
});
