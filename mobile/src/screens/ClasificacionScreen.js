import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  StatusBar,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ClasificacionScreen() {
  // Mock data for top users
  const topUsers = [
    { rank: 1, name: 'Sofia_Dev', level: 12, xp: 12450, avatar: 'S', color: '#fbbf24' }, // Gold
    { rank: 2, name: 'Alex_Pulse', level: 10, xp: 9800, avatar: 'A', color: '#9ca3af' }, // Silver
    { rank: 3, name: 'Gaby21', level: 9, xp: 8250, avatar: 'G', color: '#b45309' },   // Bronze
  ];

  // Mock data for the rest of the ranks
  const restUsers = [
    { rank: 4, name: 'Carlos_H', level: 8, xp: 7400, avatar: 'C', isCurrentUser: false },
    { rank: 5, name: 'Daniela_M', level: 7, xp: 6200, avatar: 'D', isCurrentUser: false },
    { rank: 6, name: 'LucasTask', level: 7, xp: 5900, avatar: 'L', isCurrentUser: false },
    { rank: 7, name: 'Karla_Sprint', level: 6, xp: 5100, avatar: 'K', isCurrentUser: false },
    { rank: 8, name: 'Paco_Focus', level: 6, xp: 4800, avatar: 'P', isCurrentUser: false },
    { rank: 9, name: 'Elena_Rutinas', level: 5, xp: 4200, avatar: 'E', isCurrentUser: false },
    { rank: 10, name: 'Roberto_X', level: 5, xp: 3700, avatar: 'R', isCurrentUser: false },
    { rank: 11, name: 'Valeria_P', level: 4, xp: 2900, avatar: 'V', isCurrentUser: false },
    { rank: 12, name: 'Mauricio', level: 4, xp: 2500, avatar: 'M', isCurrentUser: true }, // Current User Highlight
    { rank: 13, name: 'Hugo_Sprint', level: 3, xp: 1800, avatar: 'H', isCurrentUser: false },
  ];

  const renderLeaderboardItem = ({ item }) => {
    return (
      <View style={[styles.rankRow, item.isCurrentUser && styles.currentUserRow]}>
        {/* Position */}
        <View style={styles.rankNumContainer}>
          <Text style={[styles.rankNum, item.isCurrentUser && styles.currentUserText]}>
            {item.rank}
          </Text>
        </View>

        {/* Avatar */}
        <View style={[styles.rowAvatar, item.isCurrentUser && styles.currentUserAvatar]}>
          <Text style={[styles.rowAvatarText, item.isCurrentUser && styles.currentUserAvatarText]}>
            {item.avatar}
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.rowInfo}>
          <Text style={[styles.rowName, item.isCurrentUser && styles.currentUserName]}>
            {item.name} {item.isCurrentUser && <Text style={styles.meTag}>(Tú)</Text>}
          </Text>
          <Text style={styles.rowLevel}>Nivel {item.level}</Text>
        </View>

        {/* XP */}
        <Text style={[styles.rowXp, item.isCurrentUser && styles.currentUserText]}>
          {item.xp.toLocaleString()} XP
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Main Container */}
      <View style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Clasificación</Text>
          <Text style={styles.subtitle}>Compite con la comunidad de Priority Pulse</Text>
        </View>

        {/* Leaderboard list with Podium as Header */}
        <FlatList
          data={restUsers}
          renderItem={renderLeaderboardItem}
          keyExtractor={item => item.rank.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.podiumContainer}>
              {/* 2nd Place */}
              <View style={styles.podiumCol}>
                <View style={[styles.podiumAvatarContainer, { borderColor: '#d1d5db' }]}>
                  <Text style={styles.podiumAvatarText}>{topUsers[1].avatar}</Text>
                  <View style={[styles.medalBadge, { backgroundColor: '#9ca3af' }]}>
                    <Text style={styles.medalBadgeText}>2</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{topUsers[1].name}</Text>
                <Text style={styles.podiumXp}>{topUsers[1].xp.toLocaleString()} XP</Text>
                <View style={[styles.podiumBar, { height: 70, backgroundColor: '#e5e7eb' }]}>
                  <Text style={styles.podiumPlaceNum}>2do</Text>
                </View>
              </View>

              {/* 1st Place */}
              <View style={[styles.podiumCol, styles.firstPlaceCol]}>
                <View style={styles.crownContainer}>
                  <Ionicons name="ribbon" size={24} color="#fbbf24" />
                </View>
                <View style={[styles.podiumAvatarContainer, styles.firstPlaceAvatar]}>
                  <Text style={[styles.podiumAvatarText, { color: '#b45309' }]}>{topUsers[0].avatar}</Text>
                  <View style={[styles.medalBadge, { backgroundColor: '#fbbf24' }]}>
                    <Text style={styles.medalBadgeText}>1</Text>
                  </View>
                </View>
                <Text style={[styles.podiumName, styles.firstPlaceName]} numberOfLines={1}>
                  {topUsers[0].name}
                </Text>
                <Text style={[styles.podiumXp, styles.firstPlaceXp]}>{topUsers[0].xp.toLocaleString()} XP</Text>
                <View style={[styles.podiumBar, { height: 100, backgroundColor: '#fef3c7', borderColor: '#fde68a', borderWidth: 1 }]}>
                  <Text style={[styles.podiumPlaceNum, { color: '#b45309', fontWeight: '900' }]}>1ro</Text>
                </View>
              </View>

              {/* 3rd Place */}
              <View style={styles.podiumCol}>
                <View style={[styles.podiumAvatarContainer, { borderColor: '#d97706' }]}>
                  <Text style={styles.podiumAvatarText}>{topUsers[2].avatar}</Text>
                  <View style={[styles.medalBadge, { backgroundColor: '#b45309' }]}>
                    <Text style={styles.medalBadgeText}>3</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{topUsers[2].name}</Text>
                <Text style={styles.podiumXp}>{topUsers[2].xp.toLocaleString()} XP</Text>
                <View style={[styles.podiumBar, { height: 50, backgroundColor: '#ffedd5' }]}>
                  <Text style={styles.podiumPlaceNum}>3ro</Text>
                </View>
              </View>
            </View>
          }
        />
      </View>
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
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: 24,
    paddingHorizontal: 10,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  firstPlaceCol: {
    zIndex: 10,
    transform: [{ scale: 1.05 }],
  },
  crownContainer: {
    position: 'absolute',
    top: -24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  firstPlaceAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderColor: '#fbbf24',
    borderWidth: 4,
  },
  podiumAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4b5563',
  },
  medalBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
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
    color: '#6b7280',
    marginBottom: 8,
  },
  firstPlaceXp: {
    fontSize: 11,
    color: '#6e00ff',
  },
  podiumBar: {
    width: '80%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumPlaceNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4b5563',
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
    backgroundColor: '#f3ebff',
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
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginLeft: 4,
  },
  currentUserAvatar: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#6e00ff',
  },
  rowAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4b5563',
  },
  currentUserAvatarText: {
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
    fontWeight: '800',
  },
  meTag: {
    fontSize: 11,
    color: '#6e00ff',
    fontWeight: '800',
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
});
