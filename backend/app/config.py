from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # 1. Cấu hình Ứng dụng (App Settings)
    project_name: str = "Task Tracker API"
    environment: str = "development"
    debug: bool = True

    # 2. Cấu hình Database PostgreSQL
    postgres_user: str = "task_admin"
    postgres_password: str = "SuperSecretPass123"
    postgres_db: str = "task_tracker_db"
    database_url: str = "postgresql+psycopg2://task_admin:SuperSecretPass123@db:5432/task_tracker_db"

    # 3. Cấu hình JWT Authentication
    secret_key: str = "0b9abee52affbdec629a6c224d2f4369b13c88bbc2ae8328d0fc41502ab50f67"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 120

    # 4. Cấu hình CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Helper property: Tự động chuyển chuỗi CORS thành List[str] cho FastAPI
    @property
    def cors_origins_list(self) -> List[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    # 5. Cấu hình Email SMTP
    mail_username: Optional[str] = "dtc245200888@ictu.edu.vn"
    mail_password: Optional[str] = "jeiluzygxaouezze"
    mail_from: Optional[str] = "dtc245200888@ictu.edu.vn"
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_starttls: bool = True
    mail_ssl_tls: bool = False

    # Đọc biến môi trường từ file .env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()