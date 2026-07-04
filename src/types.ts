export interface DashboardData {
  study: {
    total_minutes: number;
    sessions_count: number;
    goal_minutes: number;
  };
  workout: {
    exercises: Exercise[];
    intensity: string;
    duration: number;
    completed: boolean;
  } | null;
  nutrition: {
    total_calories: number;
    total_protein: number;
    meals_count: number;
    goal_calories: number;
  };
  date: string;
}

export interface Exercise {
  name: string;
  duration: number;
  description: string;
}

export interface StudySession {
  duration: number;
  timestamp: string;
  session_type: string;
}

export interface NutritionLog {
  meal_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  timestamp: string;
}
