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

const templateRoutines = {
  'manana_maestra': {
    nombre: 'Mañana Maestra ☀️',
    descripcion: 'Empieza el día con energía y claridad mental.',
    tareas: [
      { id: 't_m1', titulo: 'Hidratación profunda', descripcion: '500ml agua con limón', xp_recompensa: 5, estado: 'pendiente' },
      { id: 't_m2', titulo: 'Movilidad ligera', descripcion: '10 minutos estiramiento', xp_recompensa: 10, estado: 'pendiente' },
      { id: 't_m3', titulo: 'Mindfulness', descripcion: 'Meditación guiada 5m', xp_recompensa: 15, estado: 'pendiente' }
    ]
  },
  'power_gym': {
    nombre: 'Cuerpo Activo ⚡',
    descripcion: 'Activa tu cuerpo y libera endorfinas.',
    tareas: [
      { id: 't_g1', titulo: 'Calentamiento cardiovascular', descripcion: 'Cuerda o caminadora 10m', xp_recompensa: 10, estado: 'pendiente' },
      { id: 't_g2', titulo: 'Rutina de fuerza', descripcion: 'Pesas / calistenia', xp_recompensa: 35, estado: 'pendiente' },
      { id: 't_g3', titulo: 'Proteína e hidratación', descripcion: 'Batido y 1L de agua', xp_recompensa: 5, estado: 'pendiente' }
    ]
  }
};

export default function MoldesScreen({ navigation }) {
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateSubtasks, setSelectedTemplateSubtasks] = useState([]);

  const openTemplateDetail = (templateKey) => {
    const templateData = templateRoutines[templateKey];
    if (templateData) {
      setSelectedTemplate({
        key: templateKey,
        nombre: templateData.nombre,
        descripcion: templateData.descripcion || ''
      });
      setSelectedTemplateSubtasks(
        templateData.tareas.map(t => ({ ...t, included: true }))
      );
      setTemplateModalVisible(true);
    }
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
      // 1. Obtener rutinas actuales de AsyncStorage
      const storedRoutinesJson = await AsyncStorage.getItem('@rutinas');
      let currentRoutines = [];
      if (storedRoutinesJson) {
        currentRoutines = JSON.parse(storedRoutinesJson);
      }

      // 2. Crear la nueva rutina con IDs únicos
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

      // 3. Agregar y guardar en AsyncStorage
      const updatedRoutines = [newRoutine, ...currentRoutines];
      await AsyncStorage.setItem('@rutinas', JSON.stringify(updatedRoutines));

      // 4. Cerrar modal y redireccionar a Inicio (pestaña Rutinas)
      setTemplateModalVisible(false);
      
      // Pasar como parámetro la pestaña activa
      navigation.navigate('Inicio', { activeTab: 'rutinas', reload: Date.now() });
    } catch (e) {
      console.error("Failed to save template routine to AsyncStorage", e);
      Alert.alert("Error", "No se pudo activar la rutina.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biblioteca de Moldes</Text>
        <Text style={styles.headerSubtitle}>Rutinas prediseñadas listas para activar</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Template Card 1 */}
        <View style={styles.templateCard}>
          <View style={styles.templateHeader}>
            <View style={{ flex: 1 }}>
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
            onPress={() => openTemplateDetail('manana_maestra')}
          >
            <Ionicons name="add" size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.templateAddBtnText}>Agregar a mi día</Text>
          </TouchableOpacity>
        </View>

        {/* Template Card 2 */}
        <View style={styles.templateCard}>
          <View style={styles.templateHeader}>
            <View style={{ flex: 1 }}>
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
            onPress={() => openTemplateDetail('power_gym')}
          >
            <Ionicons name="add" size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.templateAddBtnText}>Agregar a mi día</Text>
          </TouchableOpacity>
        </View>
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
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurar Molde</Text>
              <TouchableOpacity onPress={() => setTemplateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            {selectedTemplate && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.templateDetailName}>{selectedTemplate.nombre}</Text>
                <Text style={styles.templateDetailDesc}>{selectedTemplate.descripcion}</Text>
                
                <Text style={[styles.modalLabel, { marginTop: 16, marginBottom: 12 }]}>
                  Tareas de esta rutina (Desmarca las que no desees):
                </Text>

                {selectedTemplateSubtasks.map(sub => (
                  <TouchableOpacity
                    key={sub.id}
                    style={[
                      styles.templateSubtaskItemRow,
                      !sub.included && styles.templateSubtaskItemRowDisabled
                    ]}
                    onPress={() => toggleTemplateSubtask(sub.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.templateSubtaskLeft}>
                      <View style={[
                        styles.templateSubCheckbox,
                        sub.included && styles.templateSubCheckboxChecked
                      ]}>
                        {sub.included && <Ionicons name="checkmark" size={12} color="#ffffff" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.templateSubtaskTitle,
                          !sub.included && styles.templateSubtaskTitleDisabled
                        ]}>
                          {sub.titulo}
                        </Text>
                        <Text style={styles.templateSubtaskDesc}>{sub.descripcion}</Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.templateSubtaskXp,
                      !sub.included && styles.templateSubtaskXpDisabled
                    ]}>
                      +{sub.xp_recompensa} XP
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Footer Info / Add button */}
                <View style={styles.templateFooterRow}>
                  <Text style={styles.totalXpLabel}>
                    XP Estimado: {selectedTemplateSubtasks.reduce((acc, s) => acc + (s.included ? s.xp_recompensa : 0), 0)} XP
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleConfirmAddTemplate}
                >
                  <Text style={styles.modalSubmitBtnText}>Activar Rutina</Text>
                </TouchableOpacity>
              </ScrollView>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  templateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  templateDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    maxWidth: '85%',
    fontWeight: '500',
  },
  templateXpBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  templateXpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6e00ff',
  },
  templateTasksList: {
    marginBottom: 20,
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    padding: 12,
  },
  templateTaskItem: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  templateAddBtn: {
    backgroundColor: '#6e00ff',
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateAddBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
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
  modalSubmitBtn: {
    backgroundColor: '#6e00ff',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  modalSubmitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
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
});
