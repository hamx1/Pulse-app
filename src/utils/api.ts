const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export const api = {
  // Dashboard
  getDashboard: async () => {
    const response = await fetch(`${API_URL}/api/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    return response.json();
  },

  // Study sessions
  createStudySession: async (duration: number, sessionType: string = 'pomodoro') => {
    const response = await fetch(`${API_URL}/api/study/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration, session_type: sessionType }),
    });
    if (!response.ok) throw new Error('Failed to create study session');
    return response.json();
  },

  getStudySessions: async () => {
    const response = await fetch(`${API_URL}/api/study/sessions`);
    if (!response.ok) throw new Error('Failed to fetch study sessions');
    return response.json();
  },

  // Workouts
  generateWorkout: async (studyHours: number) => {
    const response = await fetch(`${API_URL}/api/workout/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ study_hours: studyHours }),
    });
    if (!response.ok) throw new Error('Failed to generate workout');
    return response.json();
  },

  getTodayWorkout: async () => {
    const response = await fetch(`${API_URL}/api/workout/today`);
    if (!response.ok) throw new Error('Failed to fetch workout');
    return response.json();
  },

  completeWorkout: async () => {
    const response = await fetch(`${API_URL}/api/workout/complete`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to complete workout');
    return response.json();
  },

  // Nutrition
  logNutrition: async (data: {
    meal_name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  }) => {
    const response = await fetch(`${API_URL}/api/nutrition/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to log nutrition');
    return response.json();
  },

  getTodayNutrition: async () => {
    const response = await fetch(`${API_URL}/api/nutrition/today`);
    if (!response.ok) throw new Error('Failed to fetch nutrition');
    return response.json();
  },
};
        
