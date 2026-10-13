from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ----------------------------------------------------------------------
# 1. IMPORT CẤU HÌNH VÀ MODELS TỪ ỨNG DỤNG FASTAPI
# ----------------------------------------------------------------------
from app.config import settings
from app.database import Base
from app import models  # Bắt buộc import để SQLAlchemy nạp toàn bộ Bảng vào Base.metadata

# Đối tượng Config của Alembic
config = context.config

# ----------------------------------------------------------------------
# 2. CẤU HÌNH KẾT NỐI DATABASE VÀ METADATA
# ----------------------------------------------------------------------
# Ghi đè URL trong alembic.ini bằng chuỗi kết nối lấy từ config.py / .env
config.set_main_option("sqlalchemy.url", settings.database_url)

# Cấu hình Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Gán MetaData của SQLAlchemy cho Alembic để hỗ trợ 'autogenerate'
target_metadata = Base.metadata

# ----------------------------------------------------------------------
# 3. HÀM CHẠY MIGRATION OFFLINE & ONLINE
# ----------------------------------------------------------------------
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()