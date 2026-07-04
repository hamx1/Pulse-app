import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// القاموس لدعم اللغات
const tabTitles = {
  en: { dashboard: "Dashboard", focus: "Focus", workout: "Workout", nutrition: "Nutrition" },
  ar: { dashboard: "الرئيسية", focus: "التركيز", workout: "التمرين", nutrition: "التغذية" }
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const currentLang: 'en' | 'ar' = 'en'; // يمكنك تغييرها لاحقاً
  const titles = tabTitles[currentLang];

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialCommunityIcons.font,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#00D4FF', // اللون النيون الأزرق
          tabBarInactiveTintColor: '#A0A0A0',
          tabBarStyle: {
            backgroundColor: '#1A1A1A',
            borderTopColor: '#222222',
            height: 70,
            paddingBottom: 10,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: titles.dashboard, tabBarIcon: ({ color, size }) => <Ionicons name="flash" size={size} color={color} /> }} />
        <Tabs.Screen name="focus" options={{ title: titles.focus, tabBarIcon: ({ color, size }) => <Ionicons name="timer-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="workout" options={{ title: titles.workout, tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="dumbbell" size={size} color={color} /> }} />
        <Tabs.Screen name="nutrition" options={{ title: titles.nutrition, tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="apple" size={size} color={color} /> }} />
      </Tabs>
    </>
  );
}
