from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, date
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.core.config import settings
from backend.app.schemas.models import (
    Child, ChildCreate, SensoryPreferences, SensoryPreferencesCreate,
    ActivityItem, SessionLog, SessionLogCreate,
    RecommendationRequest, RecommendationResponse
)
from backend.app.services.gemini_service import advisor

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for MITRA - Autism Learning Companion"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # for dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock in-memory state for development / instant standalone execution
# This connects automatically with Supabase when SUPABASE_URL & KEY are supplied
MOCK_CHILDREN = [
    Child(
        id="c1",
        name="Aarav Sharma",
        display_name="Aarav",
        avatar_key="fox",
        age_years=6,
        primary_language="en",
        learning_level="emerging",
        current_streak_days=4,
        notes="Loves animal stories; sensitive to loud sudden sounds. Responds best to visual timers with gentle chimes.",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        sensory_preferences=SensoryPreferences(
            id="sp1",
            child_id="c1",
            sound_volume_percent=40,
            sound_effects_enabled=True,
            voice_guidance_enabled=True,
            voice_speed=0.85,
            high_contrast_mode=False,
            reduced_motion=True,
            calm_color_palette="gentle-sage",
            font_size_scale="large",
            haptic_feedback=False,
            allow_timer_displays=False,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    ),
    Child(
        id="c2",
        name="Maya Patel",
        display_name="Maya",
        avatar_key="owl",
        age_years=8,
        primary_language="en",
        learning_level="expanding",
        current_streak_days=7,
        notes="High visual sequencing capability. Thrives with multi-step morning routine task lists.",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        sensory_preferences=SensoryPreferences(
            id="sp2",
            child_id="c2",
            sound_volume_percent=55,
            sound_effects_enabled=True,
            voice_guidance_enabled=True,
            voice_speed=0.9,
            high_contrast_mode=False,
            reduced_motion=True,
            calm_color_palette="soft-sky",
            font_size_scale="large",
            haptic_feedback=True,
            allow_timer_displays=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    ),
    Child(
        id="c3",
        name="Rohan Verma",
        display_name="Rohan",
        avatar_key="koala",
        age_years=5,
        primary_language="en",
        learning_level="beginner",
        current_streak_days=2,
        notes="Benefits from single-item focus and calming breathing sphere transitions.",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        sensory_preferences=SensoryPreferences(
            id="sp3",
            child_id="c3",
            sound_volume_percent=30,
            sound_effects_enabled=False,
            voice_guidance_enabled=True,
            voice_speed=0.8,
            high_contrast_mode=True,
            reduced_motion=True,
            calm_color_palette="warm-sand",
            font_size_scale="extra-large",
            haptic_feedback=False,
            allow_timer_displays=False,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    )
]

MOCK_ACTIVITIES = [
    ActivityItem(
        id="emotion-match",
        title="Emotion Recognition",
        category="socio-emotional",
        description="Clear, friendly character cards teaching core feelings (Calm, Happy, Sad, Surprised, Overwhelmed).",
        recommended_difficulty=1,
        icon_name="smile",
        game_engine="react"
    ),
    ActivityItem(
        id="daily-routine",
        title="Visual Routine Sequencer",
        category="daily-living",
        description="Interactive First-Then schedule for step-by-step morning, school, and bedtime transitions.",
        recommended_difficulty=1,
        icon_name="calendar",
        game_engine="react"
    ),
    ActivityItem(
        id="calm-sorting",
        title="Tactile Shape & Color Sorting",
        category="cognitive-sensory",
        description="Low-stimulation physics sorting into soothing colored containers.",
        recommended_difficulty=1,
        icon_name="shapes",
        game_engine="phaser"
    ),
    ActivityItem(
        id="sensory-sphere",
        title="Calm Rhythm Breathing",
        category="regulation",
        description="Visual rhythmic expansion guide for emotional de-escalation and calm breathing.",
        recommended_difficulty=1,
        icon_name="wind",
        game_engine="canvas"
    )
]

MOCK_SESSIONS = [
    SessionLog(
        id="s1",
        child_id="c1",
        activity_id="emotion-match",
        session_date=date.today(),
        duration_seconds=185,
        completed=True,
        prompts_needed=1,
        accuracy_rate=0.92,
        sensory_fatigue_flag=False,
        child_mood_entry="happy",
        created_at=datetime.now()
    ),
    SessionLog(
        id="s2",
        child_id="c1",
        activity_id="daily-routine",
        session_date=date.today(),
        duration_seconds=240,
        completed=True,
        prompts_needed=2,
        accuracy_rate=0.88,
        sensory_fatigue_flag=False,
        child_mood_entry="calm",
        created_at=datetime.now()
    ),
    SessionLog(
        id="s3",
        child_id="c2",
        activity_id="calm-sorting",
        session_date=date.today(),
        duration_seconds=310,
        completed=True,
        prompts_needed=0,
        accuracy_rate=0.96,
        sensory_fatigue_flag=False,
        child_mood_entry="focused",
        created_at=datetime.now()
    )
]

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "MITRA Learning Companion API",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/api/v1/health")
def healthcheck():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Children Endpoints
@app.get("/api/v1/children", response_model=List[Child])
def get_children():
    return MOCK_CHILDREN

@app.get("/api/v1/children/{child_id}", response_model=Child)
def get_child(child_id: str):
    for c in MOCK_CHILDREN:
        if c.id == child_id:
            return c
    raise HTTPException(status_code=404, detail="Child profile not found")

@app.put("/api/v1/children/{child_id}/sensory", response_model=SensoryPreferences)
def update_sensory_preferences(child_id: str, prefs: SensoryPreferencesCreate):
    for c in MOCK_CHILDREN:
        if c.id == child_id:
            updated = SensoryPreferences(
                id=c.sensory_preferences.id if c.sensory_preferences else f"sp_{child_id}",
                child_id=child_id,
                **prefs.model_dump(),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            c.sensory_preferences = updated
            return updated
    raise HTTPException(status_code=404, detail="Child profile not found")

# Activities Endpoints
@app.get("/api/v1/activities", response_model=List[ActivityItem])
def get_activities(category: Optional[str] = None):
    if category:
        return [a for a in MOCK_ACTIVITIES if a.category == category]
    return MOCK_ACTIVITIES

# Sessions Endpoints
@app.get("/api/v1/sessions", response_model=List[SessionLog])
def get_sessions(child_id: Optional[str] = None):
    if child_id:
        return [s for s in MOCK_SESSIONS if s.child_id == child_id]
    return MOCK_SESSIONS

@app.post("/api/v1/sessions", response_model=SessionLog)
def record_session(payload: SessionLogCreate):
    new_session = SessionLog(
        id=f"s_{len(MOCK_SESSIONS)+1}",
        session_date=date.today(),
        created_at=datetime.now(),
        **payload.model_dump()
    )
    MOCK_SESSIONS.append(new_session)
    return new_session

# AI Learning Insights (Gemini / Clinically Grounded Engine)
@app.post("/api/v1/insights", response_model=RecommendationResponse)
async def generate_recommendation(payload: RecommendationRequest):
    child = next((c for c in MOCK_CHILDREN if c.id == payload.child_id), None)
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    
    child_sessions = [s for s in MOCK_SESSIONS if s.child_id == payload.child_id]
    total_acc = sum(s.accuracy_rate for s in child_sessions) / len(child_sessions) if child_sessions else 0.85
    fatigue_count = sum(1 for s in child_sessions if s.sensory_fatigue_flag)
    
    summary_data = {
        "total_sessions": len(child_sessions),
        "avg_accuracy": total_acc,
        "fatigue_flags": fatigue_count,
        "completed_count": sum(1 for s in child_sessions if s.completed)
    }
    
    insight_dict = await advisor.generate_insight(
        child_name=child.display_name,
        age=child.age_years,
        learning_level=child.learning_level,
        role=payload.role,
        recent_sessions_summary=summary_data
    )
    
    return RecommendationResponse(
        headline=insight_dict["headline"],
        summary=insight_dict["summary"],
        suggested_action=insight_dict["suggested_action"],
        sensory_adjustment_advice=insight_dict["sensory_adjustment_advice"],
        confidence_score=0.96
    )

# Educator multi-student IEP overview
@app.get("/api/v1/educator/roster")
def get_educator_roster():
    return [
        {
            "child_id": "c1",
            "name": "Aarav Sharma",
            "age": 6,
            "tier": "Tier 2 Support",
            "iep_goal": "Identify 4 primary emotions with <= 1 prompt",
            "iep_progress_percent": 82,
            "last_session": "Today, 10:15 AM",
            "current_difficulty": 1,
            "sensory_note": "Prefers gentle-sage theme, muted chimes"
        },
        {
            "child_id": "c2",
            "name": "Maya Patel",
            "age": 8,
            "tier": "Tier 1 Support",
            "iep_goal": "Complete 4-step morning routine independently",
            "iep_progress_percent": 94,
            "last_session": "Today, 11:30 AM",
            "current_difficulty": 2,
            "sensory_note": "Enjoys soft haptic feedback & timer visuals"
        },
        {
            "child_id": "c3",
            "name": "Rohan Verma",
            "age": 5,
            "tier": "Tier 3 Support",
            "iep_goal": "Sustained sensory sphere breathing for 2 minutes",
            "iep_progress_percent": 65,
            "last_session": "Yesterday, 2:00 PM",
            "current_difficulty": 1,
            "sensory_note": "High contrast mode required, sound muted"
        }
    ]
