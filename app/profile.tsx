import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';

export default function Profile() {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');

  const saveProfile = async () => {
    try {
      const response = await fetch('http://[ضع-IP-الخاص-بجهازك]:8001/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(age),
          height: parseFloat(height),
          weight: parseFloat(weight),
          goal: goal,
        }),
      });
      if (response.ok) Alert.alert("تم الحفظ!", "تم تحديث بياناتك بنجاح.");
    } catch (error) {
      Alert.alert("خطأ", "لم نتمكن من الاتصال بالسيرفر.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>بياناتي الشخصية</Text>
      <TextInput placeholder="العمر" keyboardType="numeric" onChangeText={setAge} style={styles.input} />
      <TextInput placeholder="الطول (cm)" keyboardType="numeric" onChangeText={setHeight} style={styles.input} />
      <TextInput placeholder="الوزن (kg)" keyboardType="numeric" onChangeText={setWeight} style={styles.input} />
      <TextInput placeholder="الهدف (e.g. gain_muscle)" onChangeText={setGoal} style={styles.input} />
      <Button title="حفظ البيانات" onPress={saveProfile} color="#00D4FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#1A1A1A', justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#333', color: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10 }
});
          
