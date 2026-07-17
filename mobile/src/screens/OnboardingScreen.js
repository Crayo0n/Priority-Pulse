import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  const slides = [
    {
      id: 1,
      titulo: '¡Prioriza con Energía! ⚡',
      descripcion: 'Priority Pulse convierte tu lista de pendientes en un juego. Gana XP, sube de nivel y desbloquea medallas completando tus tareas del día.',
      type: 'logo'
    },
    {
      id: 2,
      titulo: 'Hábitos e Hilos de Rutina ☀️',
      descripcion: 'Estructura tu día al instante. Utiliza nuestros moldes pre-diseñados como la "Mañana Maestra" para consolidar hábitos positivos.',
      icono: 'calendar-outline',
      color: '#6e00ff',
      type: 'icon'
    },
    {
      id: 3,
      titulo: 'Compite y Conéctate 🏆',
      descripcion: 'Mantén tu racha diaria activa, sube de rango en la clasificación y compite de forma sana con la comunidad de Priority Pulse.',
      icono: 'trophy-outline',
      color: '#fbbf24',
      type: 'icon'
    }
  ];

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Scrollable Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.slidesContainer}
      >
        {slides.map(slide => (
          <View key={slide.id} style={styles.slide}>
            {slide.type === 'logo' ? (
              <View style={styles.imageContainer}>
                <Image
                  source={require('../../assets/Logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: slide.color + '15' }]}>
                  <Ionicons name={slide.icono} size={72} color={slide.color} />
                </View>
              </View>
            )}

            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.titulo}</Text>
              <Text style={styles.desc}>{slide.descripcion}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index ? styles.dotActive : styles.dotInactive
            ]}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Registro')}
        >
          <Text style={styles.primaryButtonText}>Comenzar Aventura</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Ya tengo una cuenta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcfaff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    justifyContent: 'space-between',
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: height * 0.08,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.34,
    marginBottom: 20,
  },
  logoImage: {
    width: 240,
    height: 240,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.25,
    marginBottom: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
  },
  desc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginVertical: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#6e00ff',
    width: 20,
  },
  dotInactive: {
    backgroundColor: '#e5e7eb',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6e00ff',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: '#6e00ff',
    fontSize: 15,
    fontWeight: '700',
  },
});
