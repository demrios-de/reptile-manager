from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://reptile:reptilepass@db:5432/reptiledb"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    first_admin_username: str = "admin"
    first_admin_password: str = "admin123"

    class Config:
        env_file = ".env"

settings = Settings()
