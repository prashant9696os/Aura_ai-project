import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    APP_NAME: str = "AURA AI Enterprise Backend"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    HOST: str = "127.0.0.1"
    PORT: int = int(os.getenv("PORT", 8001))
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",
    ]
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DEFAULT_MODEL: str = "GPT-4o Omni"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
