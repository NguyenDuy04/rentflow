from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "rentflow"

    jwt_secret_key: str = "dev-secret-change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24            # 1 day (not "remember me")
    access_token_expire_minutes_remember: int = 60 * 24 * 30  # 30 days ("remember me")
    login_attempt_window_hours: int = 24
    login_temporary_lock_minutes: int = 60
    auth_cookie_name: str = "rentflow_access_token"
    auth_cookie_secure: bool = False
    auth_cookie_samesite: str = "lax"

    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
