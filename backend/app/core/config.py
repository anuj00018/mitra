import os
from typing import List

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        PROJECT_NAME: str = "MITRA Learning Companion API"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://mitra-autism-learning.vercel.app"
        ]
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-supabase-project.supabase.co")
        SUPABASE_KEY: str = os.getenv("SUPABASE_ANON_KEY", "your-anon-key")
        SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

        class Config:
            env_file = ".env"
            case_sensitive = True
except ImportError:
    class Settings:
        PROJECT_NAME: str = "MITRA Learning Companion API"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://mitra-autism-learning.vercel.app"
        ]
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-supabase-project.supabase.co")
        SUPABASE_KEY: str = os.getenv("SUPABASE_ANON_KEY", "your-anon-key")
        SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
