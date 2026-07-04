from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import logging
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

# إعداد السجلات للمراقبة
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# MongoDB
client = MongoClient(os.getenv("MONGO_URL"))
db = client["pulse_app"]
study_sessions_collection = db["study_sessions"]
workouts_collection = db["workouts"]
user_data_collection = db["user_data"]

# النماذج (Models)
class UserProfile(BaseModel):
    age: int
    height: float
    weight: float
    goal: str

class WorkoutRequest(BaseModel):
    study_hours: float

# --- Endpoint تحديث بيانات المستخدم ---
@app.post("/api/user/profile")
async def update_profile(profile: UserProfile):
    user_data_collection.update_one(
        {"_id": "current_user"}, 
        {"$set": profile.dict()}, 
        upsert=True
    )
    return {"message": "Profile updated"}

# --- Endpoint توليد التمرين مع مراعاة بيانات المستخدم ---
@app.post("/api/workout/generate")
async def generate_workout(request: WorkoutRequest):
    try:
        # جلب بيانات المستخدم
        user_profile = user_data_collection.find_one({"_id": "current_user"})
        profile_info = f"Age: {user_profile.get('age')}, Weight: {user_profile.get('weight')}kg, Goal: {user_profile.get('goal')}" if user_profile else "No profile data."

        study_hours = request.study_hours
        base_intensity = "light" if study_hours >= 5 else ("moderate" if study_hours >= 2 else "intense")
        
        EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id="workout-gen", system_message="You are a fitness expert.").with_model("openai", "gpt-5.4-mini")
        
        prompt = f"User profile: {profile_info}. Study hours: {study_hours}. Suggest 3 exercises. Return valid
        
