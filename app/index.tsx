import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/src/utils/api';
import { DashboardData } from '@/src/types';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadDashboard();
      }
    }, [loading])
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D4FF" />}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.header}>Pulse Dashboard</Text>

        {/* كرت الدراسة */}
        <LinearGradient colors={['#1A1A1A', '#0A0A0A']} style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="book" size={24} color="#00D4FF" />
            <Text style={styles.cardTitle}>الدراسة اليوم</Text>
          </View>
          <Text style={styles.value}>{dashboardData?.study.total_minutes || 0} min</Text>
        </LinearGradient>

        {/* كرت التمرين */}
        <LinearGradient colors={['#1A1A1A', '#0A0A0A']} style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="dumbbell" size={24} color="#FF4500" />
            <Text style={styles.cardTitle}>التمرين</Text>
          </View>
          <Text style={styles.value}>{dashboardData?.workout?.exercises?.length || 0} exercises</Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scrollContent: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  header: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 20, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { color: '#A0A0A0', fontSize: 16, marginLeft: 10 },
  value: { color: '#FFF', fontSize: 24, fontWeight: 'bold' }
});
    
