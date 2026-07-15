from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "PolicyGPT"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "super_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "policygpt"
    POSTGRES_PASSWORD: str = "policygpt_password"
    POSTGRES_DB: str = "policygpt_db"
    POSTGRES_PORT: str = "5432"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return "sqlite:///./policygpt.db"
    
    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Gemini
    GEMINI_API_KEY: str = ""
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
