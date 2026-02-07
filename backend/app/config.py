"""Configuration settings for the Travel Planner API."""

from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

# Get the backend directory (parent of app/)
BACKEND_DIR = Path(__file__).parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Keys
    OPENAI_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    TAVILY_API_KEY: str = ""

    # Phoenix/Arize Observability
    PHOENIX_COLLECTOR_ENDPOINT: str = "http://localhost:6006"

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = BACKEND_DIR / ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra fields in .env file


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
