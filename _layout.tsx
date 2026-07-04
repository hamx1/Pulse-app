import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme, View } from 'react-native';

// قواميس الترجمة لأسم الشاشات في الشريط السفلي
const tabTitles = {
  en: { dashboard: "Dashboard", focus: "Focus", workout: "Workout", nutrition: "Nutrition" },
  ar: { dashboard: "الرئيسية", focus: "التركيز", workout: "التمرين", nutrition: "التغذية" },
  tr: { dashboard: "Panel", focus: "Odak", workout: "Antrenman", nutrition: "Beslenme" },
  fa: { dashboard: "داشبورد", focus: "تمرکز", workout: "تمرین", nutrition: "تغذیه" },
  fr: { dashboard: "Tableau", focus: "Focus", workout: "Entraînement", nutrition: "Nutrition" }
};

export default function AppLayout() {
  // ملاحظة: يمكنك ربط هذه القيمة بالـ Global State أو الـ Context لاحقاً
  // حالياً مضبوطة افتراضياً على الإنجليزية ويمكن تغييرها
  const currentLang: 'en' | 'ar' | 'tr' | 'fa' | 'fr' = 'en'; 
  const titles = tabTitles[currentLang];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00D4FF', // أزرق كهربائي نيون
        tabBarInactiveTintColor: '#A0A0A0', // رمادي
        tabBarStyle: {
          backgroundColor: '#1A1A1A', // أسود داكن رمادي
          borderTopColor: '#222222',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
        },
      }}
    >
      {/* 1. الشاشة الرئيسية (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: titles.dashboard,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />

      {/* 2. شاشة مؤقت التركيز (Focus Mode) */}
      <Tabs.Screen
        name="focus"
        options={{
          title: titles.focus,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 3. شاشة التمارين الذكية (Workout Generator) */}
      <Tabs.Screen
        name="workout"
        options={{
          title: titles.workout,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" size={size} color={color} />
          ),
        }}
      />

      {/* 4. شاشة متابعة التغذية (Nutrition) */}
      <Tabs.Screen
        name="nutrition"
        options={{
          title: titles.nutrition,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="apple" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
