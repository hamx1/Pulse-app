import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const POMODORO_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes
const LONG_BREAK = 15 * 60; // 15 minutes

export default function FocusScreen() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Load today's sessions on mount
  useEffect(() => {
    loadTodaySessions();
  }, []);

  const loadTodaySessions = async () => {
    try {
      const data = await api.getStudySessions();
      setSessionsCompleted(data.sessions.length);
      const total = data.sessions.reduce((sum: number, s: any) => sum + s.duration, 0);
      setTotalStudyMinutes(total);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      startPulseAnimation();
    }
  }, [isRunning]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    Vibration.vibrate([0, 500, 200, 500]);

    if (mode === 'focus') {
      // Save study session
      try {
        await api.createStudySession(25, 'pomodoro');
        const newSessionCount = sessionsCompleted + 1;
        setSessionsCompleted(newSessionCount);
        setTotalStudyMinutes((prev) => prev + 25);

        // Show completion message
        Alert.alert(
          '🎉 Great Work!',
          `Focus session complete! You've completed ${newSessionCount} session${newSessionCount > 1 ? 's' : ''} today (${totalStudyMinutes + 25} minutes).`,
          [
            {
              text: 'Take a Break',
              onPress: () => {
                // Automatically switch to break
                const newSessions = newSessionCount;
                if (newSessions % 4 === 0) {
                  setMode('long');
                  setTimeLeft(LONG_BREAK);
                } else {
                  setMode('short');
                  setTimeLeft(SHORT_BREAK);
                }
              },
            },
            {
              text: 'Generate Workout',
              onPress: () => {
                router.push('/workout');
              },
            },
          ]
        );
      } catch (error) {
        console.error('Failed to save session:', error);
        Alert.alert('Error', 'Failed to save your study session. Please try again.');
      }
    } else {
      // Break completed
      Alert.alert(
        '✅ Break Complete',
        'Ready to focus again?',
        [
          {
            text: 'Start Focus Session',
            onPress: () => {
              setMode('focus');
              setTimeLeft(POMODORO_TIME);
              setIsRunning(true);
            },
          },
          { text: 'Not Yet', style: 'cancel' },
        ]
      );
    }
  };
          
