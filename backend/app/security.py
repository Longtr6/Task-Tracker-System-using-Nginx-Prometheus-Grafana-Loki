from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# Import settings từ config.py
# (Nếu config.py nằm ngoài cùng thư mục backend thì dùng "from config import settings")
from app.config import settings

# Khởi tạo ngữ cảnh băm mật khẩu bằng thuật toán Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Kiểm tra mật khẩu thô gửi lên có khớp với chuỗi mật khẩu đã băm trong CSDL không.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Băm mật khẩu người dùng bằng Bcrypt.
    """
    pwd_bytes = password.encode('utf-8')
    return pwd_context.hash(pwd_bytes.decode('utf-8', errors='ignore'))


def create_access_token(
    data: Dict[str, Any], 
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Tạo chuỗi JWT Access Token chứa thông tin đăng nhập và thời hạn hết hạn.
    """
    to_encode = data.copy()
    
    # Tính thời gian hết hạn của token
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )
        
    to_encode.update({"exp": expire})
    
    # Mã hóa JWT với Secret Key và Algorithm đọc từ settings
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.secret_key, 
        algorithm=settings.algorithm
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Giải mã JWT Token và kiểm tra chữ ký. 
    Trả về dict payload nếu hợp lệ, ngược lại trả về None.
    """
    try:
        payload = jwt.decode(
            token, 
            settings.secret_key, 
            algorithms=[settings.algorithm]
        )
        return payload
    except JWTError:
        return None