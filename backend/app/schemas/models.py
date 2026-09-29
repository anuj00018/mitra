from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, date

class SensoryPreferencesBase(BaseModel):
    sound_volume_percent: int = Field(default=50, ge=0, le=100)
    sound_effects_enabled: bool = True
    voice_guidance_enabled: bool = True
    voice_speed: float = Field(default=0.9, ge=0.5, le=1.5)
    high_contrast_mode: bool = False
    reduced_motion: bool = True
    calm_color_palette: Literal["gentle-sage", "soft-sky", "warm-sand", "muted-lavender"] = "gentle-sage"
    font_size_scale: Literal["normal", "large", "extra-large"] = "large"
    haptic_feedback: bool = False
    allow_timer_displays: bool = False

class SensoryPreferencesCreate(SensoryPreferencesBase):
    pass

class SensoryPreferences(SensoryPreferencesBase):
    id: str
    child_id: str
    created_at: datetime
    updated_at: datetime

class ChildBase(BaseModel):
    name: str
    display_name: str
    avatar_key: str = "fox"
    age_years: int = Field(ge=2, le=18)
    primary_language: str = "en"
    learning_level: Literal["beginner", "emerging", "expanding", "independent"] = "emerging"
    notes: Optional[str] = None

class ChildCreate(ChildBase):
    sensory_preferences: Optional[SensoryPreferencesCreate] = None

class Child(ChildBase):
    id: str
    parent_id: Optional[str] = None
    current_streak_days: int = 0
    created_at: datetime
    updated_at: datetime
    sensory_preferences: Optional[SensoryPreferencesBase] = None

class ActivityItem(BaseModel):
    id: str
    title: str
    category: Literal["socio-emotional", "daily-living", "cognitive-sensory", "regulation"]
    description: str
    recommended_difficulty: int = 1
    icon_name: str
    game_engine: Literal["react", "phaser", "canvas"] = "react"
    is_active: bool = True

class SessionLogCreate(BaseModel):
    child_id: str
    activity_id: str
    duration_seconds: int
    completed: bool
    prompts_needed: int = 0
    accuracy_rate: float = 1.0
    sensory_fatigue_flag: bool = False
    child_mood_entry: Optional[Literal["calm", "happy", "overwhelmed", "tired", "focused"]] = "calm"

class SessionLog(SessionLogCreate):
    id: str
    session_date: date
    created_at: datetime

class RecommendationRequest(BaseModel):
    child_id: str
    recent_session_ids: Optional[List[str]] = None
    role: Literal["parent", "educator"] = "parent"

class RecommendationResponse(BaseModel):
    headline: str
    summary: str
    suggested_action: str
    sensory_adjustment_advice: str
    confidence_score: float = 0.95
