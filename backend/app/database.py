from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Lưu ý: Nếu config.py nằm cùng cấp thư mục thì import "from config import settings"
# Nếu config.py nằm trong thư mục app thì dùng "from app.config import settings"
from app.config import settings

# Khởi tạo SQLAlchemy Engine kết nối tới PostgreSQL
engine = create_engine(
    settings.database_url,
    echo=settings.debug,   # In log các câu lệnh SQL ra Terminal khi ở chế độ DEBUG
    pool_pre_ping=True,   # Tự động kiểm tra và khôi phục kết nối bị ngắt
    pool_size=10,         # Số lượng kết nối duy trì sẵn trong Connection Pool
    max_overflow=20,      # Số kết nối tối đa tạo thêm khi lưu lượng truy cập tăng cao
    future=True,
)

# Khởi tạo SessionFactory để quản lý các phiên làm việc (Transaction)
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

# Base class cơ sở định nghĩa các ORM Model (User, Task, v.v.)
Base = declarative_base()


def get_db() -> Generator:
    """
    Dependency Generator cung cấp SQLAlchemy Session cho từng API request 
    và tự động đóng (close) session sau khi xử lý xong.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()