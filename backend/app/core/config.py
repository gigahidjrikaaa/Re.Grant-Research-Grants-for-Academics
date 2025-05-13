from pydantic_settings import BaseSettings, SettingsConfigDict # type: ignore
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Re.Grant API"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/regrant" #! Example, load from .env

    # JWT Settings (Example if using JWTs after wallet auth)
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY" # Load from .env, generate a strong one
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"] # Add your frontend URL

    # For Sign-In with Ethereum (SIWE)
    SIWE_NONCE_EXPIRY_SECONDS: int = 5 * 60 # 5 minutes

    model_config = SettingsConfigDict(env_file=".env", extra='ignore')


@lru_cache()
def get_settings() -> Settings:
    # Add console log for debugging loaded settings
    print("Loading settings...")
    settings = Settings()
    print(f"Loaded DATABASE_URL: {settings.DATABASE_URL}") # Check if it's from .env or default
    return settings

settings = get_settings()