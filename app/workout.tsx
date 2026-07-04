import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { api } from '@/src/utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function WorkoutScreen() {
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      const data = await api.getLatestWorkout();
      setWorkout(data);
    } catch (error) {
      console.error('Failed to load workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWorkout = async () => {
    setGenerating(true);
    try {
      const data = await api.generateWorkout();
      setWorkout(data);
    } catch (error) {
      console.error('Failed to generate workout:', error);
      Alert.alert('Error', 'Failed to generate workout. Make sure you have study sessions today!');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      await api.completeWorkout();
      setWorkout({ ...workout, completed: true });
      Alert.alert(
        '🏆 Congratulations!',
        'Workout completed! Great job! 💪',
        [
          { text: 'View Dashboard', onPress: () => router.push('/') },
          { text: 'Stay Here', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete workout.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your AI Workout</Text>

        {!workout ? (
          <View style={styles.emptyState}>
            <LinearGradient colors={['#1A1A1A', '#151515']} style={styles.emptyCard}>
              <MaterialCommunityIcons name="yoga" size={80} color="#333333" />
              <Text style={styles.emptyTitle}>No Workout Yet</Text>
              <Text style={styles.emptyText}>Generate a personalized workout based on your study load</Text>
              <TouchableOpacity style={styles.generateButton} onPress={handleGenerateWorkout} disabled={generating}>
                <LinearGradient colors={['#00D4FF', '#0099FF']} style={styles.generateButtonGradient}>
                  {generating ? <ActivityIndicator color="#FFFFFF" /> : (
                    <>
                      <MaterialCommunityIcons name="auto-fix" size={24} color="#FFFFFF" />
                      <Text style={styles.generateButtonText}>Generate Workout</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.workoutListContainer}>
            <Text style={styles.listHeader}>تمارينك لليوم:</Text>
            {workout.exercises.map((exercise: string, index: number) => (
              <View key={index} style={styles.exerciseCard}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#00D4FF" />
                <Text style={styles.exerciseText}>{exercise}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.button} onPress={handleCompleteWorkout}>
              <Text style={styles.buttonText}>إكمال التمرين</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  scrollContent: { padding: 20, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  emptyState: { width: '100%', marginTop: 10 },
  emptyCard: { padding: 30, borderRadius: 20, alignItems: 'center', width: '100%' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  emptyText: { fontSize: 14, color: '#A0A0A0', textAlign: 'center', marginTop: 8, marginBottom: 20 },
  generateButton: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  generateButtonGradient: { flexDirection: 'row', padding: 15, justifyContent: 'center', alignItems: 'center' },
  generateButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  workoutListContainer: { width: '100%', marginTop: 20 },
  listHeader: { color: '#FFF', fontSize: 18, marginBottom: 15, fontWeight: 'bold' },
  exerciseCard: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  exerciseText: { color: '#FFF', fontSize: 16, marginLeft: 15 },
  button: { backgroundColor: '#6366f1', padding: 15, borderRadius: 10, marginTop: 20, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
