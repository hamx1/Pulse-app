  const handleAddMeal = async () => {
    if (!mealName || !calories) {
      Alert.alert('Error', 'Please enter meal name and calories');
      return;
    }

    try {
      await api.logNutrition({
        meal_name: mealName,
        calories: parseInt(calories),
        protein: protein ? parseInt(protein) : 0,
        carbs: carbs ? parseInt(carbs) : 0,
        fats: fats ? parseInt(fats) : 0,
      });

      // Reset form
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      setModalVisible(false);

      // Reload logs
      await loadNutrition();
      
      Alert.alert(
        '✅ Success',
        'Meal logged successfully! Keep tracking to reach your daily nutrition goals.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to log meal:', error);
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    }
  };
