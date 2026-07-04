from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
import asyncio

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client["pulse_app"]

# Collections
study_sessions_collection = db["study_sessions"]
workouts_collection = db["workouts"]
nutrition_collection = db["nutrition"]
user_data_collection = db["user_data"]

# Pydantic models
class StudySession(BaseModel):
    duration: int  # in minutes
    timestamp: Optional[str] = None
    session_type: str = "pomodoro"  # pomodoro, deep_work, break

class Workout(BaseModel):
    exercises: List[dict]
    intensity: str  # light, moderate, intense
    duration: int  # in minutes
    completed: bool = False
    timestamp: Optional[str] = None

class Nutrition(BaseModel):
    meal_name: str
    calories: int
    protein: Optional[int] = 0
    carbs: Optional[int] = 0
    fats: Optional[int] = 0
    timestamp: Optional[str] = None

class WorkoutRequest(BaseModel):
    study_hours: float
    user_preference: Optional[str] = "balanced"

# Workout database
WORKOUT_DATABASE = {
    "light": [
        {"name": "Walking", "duration": 20, "description": "Light walk to refresh your mind"},
        {"name": "Stretching", "duration": 15, "description": "Full body stretching routine"},
        {"name": "Yoga Flow", "duration": 25, "description": "Gentle yoga poses for relaxation"},
        {"name": "Breathing Exercises", "duration": 10, "description": "Deep breathing and meditation"},
    ],
    "moderate": [
        {"name": "Jogging", "duration": 30, "description": "Moderate pace jogging"},
        {"name": "Bodyweight Circuit", "duration": 25, "description": "Push-ups, squats, lunges, planks"},
        {"name": "Cycling", "duration": 35, "description": "Moderate intensity cycling"},
        {"name": "Swimming", "duration": 30, "description": "Relaxed swimming laps"},
        {"name": "Core Workout", "duration": 20, "description": "Planks, crunches, leg raises"},
    ],
    "intense": [
        {"name": "HIIT Training", "duration": 30, "description": "High intensity interval training"},
        {"name": "Strength Training", "duration": 45, "description": "Full body strength workout"},
        {"name": "Running", "duration": 40, "description": "Fast-paced running session"},
        {"name": "Boxing", "duration": 35, "description": "Boxing workout with punching bag"},
        {"name": "CrossFit", "duration": 45, "description": "Mixed functional movements"},
    ]
}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Dashboard endpoint
@app.get("/api/dashboard")
async def get_dashboard():
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    # Get today's study sessions
    study_sessions = list(study_sessions_collection.find({
        "timestamp": {
            "$gte": today.isoformat(),
            "$lt": tomorrow.isoformat()
        }
    }, {"_id": 0}))
    
    total_study_minutes = sum(session["duration"] for session in study_sessions)
    
    # Get today's workout
    workout = workouts_collection.find_one({
        "timestamp": {
            "$gte": today.isoformat(),
            "$lt": tomorrow.isoformat()
        }
    }, {"_id": 0})
    
    # Get today's nutrition
    nutrition_logs = list(nutrition_collection.find({
        "timestamp": {
            "$gte": today.isoformat(),
            "$lt": tomorrow.isoformat()
        }
    }, {"_id": 0}))
    
    total_calories = sum(log["calories"] for log in nutrition_logs)
    total_protein = sum(log.get("protein", 0) for log in nutrition_logs)
    
    return {
        "study": {
            "total_minutes": total_study_minutes,
            "sessions_count": len(study_sessions),
            "goal_minutes": 360  # 6 hours default goal
        },
        "workout": workout,
        "nutrition": {
            "total_calories": total_calories,
            "total_protein": total_protein,
            "meals_count": len(nutrition_logs),
            "goal_calories": 2000
        },
        "date": today.isoformat()
    }

# Study session endpoints
@app.post("/api/study/session")
async def create_study_session(session: StudySession):
    session_dict = session.dict()
    if not session_dict.get("timestamp"):
        session_dict["timestamp"] = datetime.now().isoformat()
    
    result = study_sessions_collection.insert_one(session_dict)
    return {"id": str(result.inserted_id), "message": "Study session saved"}

@app.get("/api/study/sessions")
async def get_study_sessions():
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    sessions = list(study_sessions_collection.find(
        {"timestamp": {"$gte": today.isoformat()}},
        {"_id": 0}
    ).sort("timestamp", -1))
    return {"sessions": sessions}

# Workout generation endpoint with AI
@app.post("/api/workout/generate")
async def generate_workout(request: WorkoutRequest):
    study_hours = request.study_hours
    
    # Determine intensity based on study hours
    if study_hours < 2:
        base_intensity = "intense"
    elif study_hours < 5:
        base_intensity = "moderate"
    else:
        base_intensity = "light"
    
    # Use AI to select appropriate exercises
    try:
        EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id="workout-gen",
            system_message="You are a fitness expert. Provide workout recommendations in JSON format."
        ).with_model("openai", "gpt-5.4-mini")
        
        exercises_list = WORKOUT_DATABASE[base_intensity]
        exercises_str = "\n".join([f"- {ex['name']}: {ex['description']} ({ex['duration']} min)" for ex in exercises_list])
        
        prompt = f"""The user studied for {study_hours} hours today. Based on this mental load, select 3-4 appropriate exercises from this list:

{exercises_str}

Consider:
- Mental fatigue level
- Need for balance between mental and physical energy
- Recovery and avoiding burnout

Respond with only a JSON array of exercise names, like: ["Exercise1", "Exercise2", "Exercise3"]"""
        
        user_message = UserMessage(text=prompt)
        
        # Collect streaming response
        full_response = ""
        async for event in chat.stream_message(user_message):
            if isinstance(event, TextDelta):
                full_response += event.content
            elif isinstance(event, StreamDone):
                break
        
        # Parse AI response
        import json
        # Extract JSON from response
        start_idx = full_response.find("[")
        end_idx = full_response.rfind("]") + 1
        selected_names = json.loads(full_response[start_idx:end_idx])
        
        # Get full exercise details
        selected_exercises = [ex for ex in exercises_list if ex["name"] in selected_names]
        
        # Fallback if AI parsing fails
        if not selected_exercises:
            selected_exercises = exercises_list[:3]
    
    except Exception as e:
        print(f"AI generation error: {e}")
        # Fallback to first 3 exercises
        selected_exercises = WORKOUT_DATABASE[base_intensity][:3]
    
    total_duration = sum(ex["duration"] for ex in selected_exercises)
    
    workout = {
        "exercises": selected_exercises,
        "intensity": base_intensity,
        "duration": total_duration,
        "completed": False,
        "timestamp": datetime.now().isoformat()
    }
    
    # Save to database
    workouts_collection.insert_one(workout.copy())
    
    return workout

@app.get("/api/workout/today")
async def get_today_workout():
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    workout = workouts_collection.find_one({
        "timestamp": {
            "$gte": today.isoformat(),
            "$lt": tomorrow.isoformat()
        }
    }, {"_id": 0})
    
    if not workout:
        return {"message": "No workout for today yet"}
    
    return workout

@app.post("/api/workout/complete")
async def complete_workout():
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    result = workouts_collection.update_one(
        {
            "timestamp": {
                "$gte": today.isoformat(),
                "$lt": tomorrow.isoformat()
            }
        },
        {"$set": {"completed": True}}
    )
    
    return {"message": "Workout marked as complete"}

# Nutrition endpoints
@app.post("/api/nutrition/log")
async def log_nutrition(nutrition: Nutrition):
    nutrition_dict = nutrition.dict()
    if not nutrition_dict.get("timestamp"):
        nutrition_dict["timestamp"] = datetime.now().isoformat()
    
    result = nutrition_collection.insert_one(nutrition_dict)
    return {"id": str(result.inserted_id), "message": "Nutrition logged"}

@app.get("/api/nutrition/today")
async def get_today_nutrition():
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    logs = list(nutrition_collection.find({
        "timestamp": {
            "$gte": today.isoformat(),
            "$lt": tomorrow.isoformat()
        }
    }, {"_id": 0}).sort("timestamp", -1))
    
    return {"logs": logs}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
