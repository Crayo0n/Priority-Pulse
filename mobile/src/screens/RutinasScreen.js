import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const templateRoutines = [
  {
    key: "manana_maestra",
    nombre: "Mañana Maestra",
    tiempo: "45 MINS",
    descripcion: "Comienza tu día con intención y claridad usando esta secuencia respaldada científicamente...",
    detalle: "Esta rutina está diseñada para optimizar tus niveles de cortisol matutino y establecer una base mental sólida. Al combinar movimiento suave con reflexión intencional, preparas tu cerebro para un rendimiento cognitivo máximo durante el día.",
    icono: "sunny",
    color: "#6e00ff", // purple
    bgColor: "#f3ebff",
    tareas: [
      { id: "mm1", titulo: "Hidratación", descripcion: "Beber 500ml de agua con limón", xp_recompensa: 5, tiempo: "5m" },
      { id: "mm2", titulo: "Estiramiento", descripcion: "Movilidad ligera para despertar el cuerpo", xp_recompensa: 10, tiempo: "10m" },
      { id: "mm3", titulo: "Meditación", descripcion: "Enfoque en la respiración y presencia", xp_recompensa: 15, tiempo: "10m" },
      { id: "mm4", titulo: "Diario de gratitud", descripcion: "Escribir 3 cosas por las que estás agradecido", xp_recompensa: 5, tiempo: "5m" },
      { id: "mm5", titulo: "Planificación", descripcion: "Revisar agenda y prioridades del día", xp_recompensa: 15, tiempo: "15m" }
    ]
  },
  {
    key: "prep_trabajo_profundo",
    nombre: "Prep. Trabajo Profundo",
    tiempo: "15 MINS",
    descripcion: "Elimina distracciones y prepara tu cerebro para una sesión de enfoque intenso.",
    detalle: "Desconecta del mundo exterior para concentrarte al 100%.",
    icono: "hardware-chip",
    color: "#0284c7", // blue
    bgColor: "#e0f2fe",
    tareas: [
      { id: "ptp1", titulo: "Limpiar escritorio", descripcion: "Ordena tu área de trabajo física", xp_recompensa: 5, tiempo: "5m" },
      { id: "ptp2", titulo: "Bloquear notificaciones", descripcion: "Silencia el teléfono y cierra pestañas extra", xp_recompensa: 5, tiempo: "5m" },
      { id: "ptp3", titulo: "Timer de 90m", descripcion: "Configura un temporizador para tu sesión", xp_recompensa: 5, tiempo: "5m" }
    ]
  },
  {
    key: "cierre_dia",
    nombre: "Cierre del Día",
    tiempo: "30 MINS",
    descripcion: "Desconéctate del trabajo y prepárate para un sueño reparador para recargar energías.",
    detalle: "Prepara tu mente y tu entorno para un descanso profundo y de calidad.",
    icono: "moon",
    color: "#4f46e5", // indigo
    bgColor: "#e0e7ff",
    tareas: [
      { id: "cd1", titulo: "Revisar tareas completadas", descripcion: "Marca las misiones terminadas", xp_recompensa: 5, tiempo: "10m" },
      { id: "cd2", titulo: "Reflexiones del diario", descripcion: "Escribe lo mejor de tu día", xp_recompensa: 5, tiempo: "10m" },
      { id: "cd3", titulo: "Preparar lista de mañana", descripcion: "Anota tus prioridades de mañana", xp_recompensa: 5, tiempo: "10m" }
    ]
  },
  {
    key: "reinicio_rapido",
    nombre: "Reinicio Rápido",
    tiempo: "10 MINS",
    descripcion: "Impulso rápido de energía para combatir el bajón de media tarde.",
    detalle: "Restablece tu nivel de energía de forma natural en solo unos minutos.",
    icono: "battery-charging",
    color: "#059669", // emerald
    bgColor: "#d1fae5",
    tareas: [
      { id: "rr1", titulo: "Beber Agua", descripcion: "Un vaso completo de agua fresca", xp_recompensa: 5, tiempo: "2m" },
      { id: "rr2", titulo: "Respiración cuadrada", descripcion: "Técnica 4-4-4-4 para relajación", xp_recompensa: 5, tiempo: "3m" },
      { id: "rr3", titulo: "Caminar / Estirar", descripcion: "Levántate y muévete", xp_recompensa: 5, tiempo: "5m" }
    ]
  },
  {
    key: "resumen_semanal",
    nombre: "Resumen Semanal",
    tiempo: "60 MINS",
    descripcion: "Analiza el rendimiento de la semana pasada y planifica la siguiente.",
    detalle: "Evalúa tus avances y ajusta tus velas para la próxima semana.",
    icono: "calendar",
    color: "#ea580c", // orange
    bgColor: "#ffedd5",
    tareas: [
      { id: "rs1", titulo: "Limpiar bandeja de entrada", descripcion: "Pon tu email a cero", xp_recompensa: 15, tiempo: "20m" },
      { id: "rs2", titulo: "Revisar calendario", descripcion: "Ver los eventos de la semana próxima", xp_recompensa: 10, tiempo: "15m" },
      { id: "rs3", titulo: "Fijar objetivos semanales", descripcion: "3 metas principales", xp_recompensa: 25, tiempo: "25m" }
    ]
  },
  {
    key: "tormenta_creativa",
    nombre: "Tormenta Creativa",
    tiempo: "90 MINS",
    descripcion: "Tiempo no estructurado para lluvia de ideas, ideación y pensamiento libre.",
    detalle: "Desata tu creatividad sin límites ni juicios para encontrar nuevas soluciones.",
    icono: "bulb",
    color: "#c026d3", // fuchsia
    bgColor: "#fae8ff",
    tareas: [
      { id: "tc1", titulo: "Mapas mentales", descripcion: "Plasmar ideas principales", xp_recompensa: 15, tiempo: "30m" },
      { id: "tc2", titulo: "Mood Boarding", descripcion: "Búsqueda de referencias visuales", xp_recompensa: 10, tiempo: "30m" },
      { id: "tc3", titulo: "Bocetaje", descripcion: "Bocetos rápidos de posibles soluciones", xp_recompensa: 25, tiempo: "30m" }
    ]
  }
];

export default function RutinasScreen({ navigation }) {
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateSubtasks, setSelectedTemplateSubtasks] = useState([]);

  const openTemplateDetail = (templateData) => {
    setSelectedTemplate(templateData);
    setSelectedTemplateSubtasks(
      templateData.tareas.map(t => ({ ...t, included: true }))
    );
    setTemplateModalVisible(true);
  };

  const toggleTemplateSubtask = (subtaskId) => {
    setSelectedTemplateSubtasks(prev =>
      prev.map(t =>
        t.id === subtaskId ? { ...t, included: !t.included } : t
      )
    );
  };

  const handleConfirmAddTemplate = async () => {
    const activeSubtasks = selectedTemplateSubtasks.filter(t => t.included);
    if (activeSubtasks.length === 0) {
      Alert.alert("Error", "Selecciona al menos una tarea para activar la rutina.");
      return;
    }

    try {
      const storedRoutinesJson = await AsyncStorage.getItem('@rutinas');
      let currentRoutines = [];
      if (storedRoutinesJson) {
        currentRoutines = JSON.parse(storedRoutinesJson);
      }

      const newRoutine = {
        id: Date.now().toString(),
        nombre: selectedTemplate.nombre,
        esta_activa: true,
        tareas: activeSubtasks.map(t => ({
          id: t.id + '_' + Date.now(),
          titulo: t.titulo,
          descripcion: t.descripcion,
          xp_recompensa: t.xp_recompensa,
          estado: 'pendiente'
        }))
      };

      const updatedRoutines = [newRoutine, ...currentRoutines];
      await AsyncStorage.setItem('@rutinas', JSON.stringify(updatedRoutines));

      setTemplateModalVisible(false);
      
      navigation.navigate('Inicio', { activeTab: 'rutinas', reload: Date.now() });
    } catch (e) {
      console.error("Failed to save template routine to AsyncStorage", e);
      Alert.alert("Error", "No se pudo activar la rutina.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.libBadge}>
          <Ionicons name="book-outline" size={12} color="#6e00ff" style={{marginRight: 4}} />
          <Text style={styles.libBadgeText}>LIBRERÍA DE HÁBITOS</Text>
        </View>
        <Text style={styles.headerTitle}>Descubrir Rutinas</Text>
        <Text style={styles.headerSubtitle}>
          Explora flujos de trabajo pre-diseñados. Selecciona una rutina para estructurar tu día al instante.
        </Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {templateRoutines.map((routine) => (
          <View key={routine.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: routine.color }]}>
                <Ionicons name={routine.icono} size={24} color="#ffffff" />
              </View>
              <View style={styles.cardTitleArea}>
                <Text style={styles.cardTitle}>{routine.nombre}</Text>
                <View style={styles.cardBadges}>
                  <Text style={styles.badgeText}>{routine.tiempo}</Text>
                  <Text style={styles.badgeDot}>•</Text>
                  <Text style={styles.badgeText}>{routine.tareas.length} Tareas</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cardDesc}>{routine.descripcion}</Text>
            
            <TouchableOpacity
              style={[
                styles.reviewBtn, 
                routine.key === 'manana_maestra' ? styles.reviewBtnSolid : styles.reviewBtnOutline
              ]}
              onPress={() => openTemplateDetail(routine)}
            >
              <Ionicons 
                name="eye-outline" 
                size={16} 
                color={routine.key === 'manana_maestra' ? '#ffffff' : routine.color} 
                style={{ marginRight: 6 }} 
              />
              <Text style={[
                styles.reviewBtnText, 
                routine.key === 'manana_maestra' ? styles.reviewBtnTextSolid : { color: routine.color }
              ]}>
                Revisar Rutina
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{height: 40}} />
      </ScrollView>

      {/* Template Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={templateModalVisible}
        onRequestClose={() => setTemplateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {selectedTemplate && (
              <>
                <View style={styles.modalTopNav}>
                  <TouchableOpacity onPress={() => setTemplateModalVisible(false)}>
                    <Ionicons name="close" size={26} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeaderRow}>
                    <View style={[styles.modalMainIcon, { backgroundColor: selectedTemplate.color }]}>
                      <Ionicons name={selectedTemplate.icono} size={32} color="#ffffff" />
                    </View>
                    <View style={{flex: 1, marginLeft: 16}}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.modalRoutineTitle}>{selectedTemplate.nombre}</Text>
                      </View>
                      <View style={styles.modalRoutineBadge}>
                        <Text style={styles.modalRoutineBadgeText}>{selectedTemplate.tiempo}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.modalRoutineDesc}>{selectedTemplate.detalle}</Text>

                  <View style={styles.includedTasksHeader}>
                    <Text style={styles.includedTasksTitle}>TAREAS INCLUIDAS</Text>
                    <View style={styles.includedTasksCountBadge}>
                      <Text style={styles.includedTasksCountText}>{selectedTemplateSubtasks.length} tareas</Text>
                    </View>
                  </View>

                  <View style={styles.tasksListContainer}>
                    {selectedTemplateSubtasks.map(sub => (
                      <TouchableOpacity
                        key={sub.id}
                        style={[
                          styles.taskRow,
                          !sub.included && styles.taskRowDisabled
                        ]}
                        onPress={() => toggleTemplateSubtask(sub.id)}
                        activeOpacity={0.8}
                      >
                        <View style={[
                          styles.taskCheckbox,
                          sub.included && styles.taskCheckboxChecked
                        ]}>
                          {sub.included && <Ionicons name="checkmark" size={14} color="#9ca3af" />}
                        </View>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <Text style={[
                            styles.taskTitle,
                            !sub.included && styles.taskTitleDisabled
                          ]}>
                            {sub.titulo}
                          </Text>
                          <Text style={styles.taskDesc}>{sub.descripcion}</Text>
                        </View>
                        <View style={styles.taskTimeBadge}>
                          <Text style={styles.taskTimeText}>{sub.tiempo}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={handleConfirmAddTemplate}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" style={{marginRight: 6}} />
                      <Text style={styles.confirmBtnText}>Confirmar y Añadir a mi día</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setTemplateModalVisible(false)}
                    >
                      <Text style={styles.cancelBtnText}>CANCELAR</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{height: 20}} />
                </ScrollView>
              </>
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
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  libBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3ebff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  libBadgeText: {
    color: '#6e00ff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 6,
    fontWeight: '400',
    lineHeight: 22,
  },
  container: {
    flex: 1,
    backgroundColor: '#fcfaff',
  },
  scrollContent: {
    padding: 24,
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
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleArea: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  badgeDot: {
    fontSize: 12,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  reviewBtn: {
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtnOutline: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
  },
  reviewBtnSolid: {
    backgroundColor: '#6e00ff',
  },
  reviewBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewBtnTextSolid: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalTopNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalMainIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalRoutineTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  modalRoutineBadge: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  modalRoutineBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4b5563',
  },
  modalRoutineDesc: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 24,
  },
  includedTasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  includedTasksTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  includedTasksCountBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  includedTasksCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  tasksListContainer: {
    marginBottom: 24,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    marginBottom: 12,
  },
  taskRowDisabled: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxChecked: {
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  taskTitleDisabled: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  taskTimeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  modalActions: {
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtn: {
    backgroundColor: '#6e00ff',
    width: '100%',
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginBottom: 16,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    padding: 12,
  },
  cancelBtnText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '700',
  }
});
