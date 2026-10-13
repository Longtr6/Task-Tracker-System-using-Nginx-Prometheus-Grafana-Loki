from datetime import datetime, timedelta, timezone
import secrets  # <--- ĐOẠN MỚI THÊM: Thư viện tạo token ngẫu nhiên an toàn
import hashlib  # <--- ĐOẠN MỚI THÊM: Thư viện băm token SHA-256

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from pydantic import Field
from sqlalchemy.orm import Session

from app import models, schemas
from app.config import settings
from app.database import get_db
from app.deps import get_current_user

router = APIRouter(tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.access_token_expire_minutes)
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


class UserRegisterRequest(schemas.UserCreate):
    full_name: str | None = Field(
        default=None,
        description="Họ và tên người dùng",
    )


@router.post(
    "/register",
    response_model=schemas.UserOut,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_in: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    """Đăng ký tài khoản mới và tạo UserProfile."""

    existing_user = db.query(models.User).filter(
        (models.User.username == user_in.username)
        | (models.User.email == user_in.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username hoặc Email đã được đăng ký trên hệ thống.",
        )

    new_user = models.User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
    )

    db.add(new_user)
    db.flush()

    new_profile = models.UserProfile(
        user_id=new_user.id,
        full_name=user_in.full_name,
    )

    db.add(new_profile)

    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Đăng nhập và nhận Access Token."""

    user = (
        db.query(models.User)
        .filter(models.User.username == form_data.username)
        .first()
    )

    if not user or not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username hoặc mật khẩu không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={
            "sub": user.username,
            "role": user.role.value,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=schemas.UserOut)
def get_me(
    current_user: models.User = Depends(get_current_user),
):
    """Lấy thông tin cá nhân của người dùng đang đăng nhập."""

    return current_user


# ============================================================
# <--- ĐOẠN MỚI THÊM: CHỨC NĂNG QUÊN & ĐẶT LẠI MẬT KHẨU
# ============================================================

def hash_token(token: str) -> str:
    """Hàm băm token sang SHA-256 để lưu trữ an toàn trong DB"""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(
    payload: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """Gửi yêu cầu quên mật khẩu: Tạo token ngẫu nhiên và lưu mã băm vào DB."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    
    # Bảo mật: Không tiết lộ email có tồn tại hay không trên hệ thống
    if not user:
        return {"message": "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi."}

    # Xóa các token cũ chưa dùng của user này để dọn dẹp database
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.is_used == 0
    ).delete()

    # Tạo token ngẫu nhiên an toàn (32 bytes url-safe)
    raw_token = secrets.token_urlsafe(32)
    token_hashed = hash_token(raw_token)
    
    # Thiết lập thời gian hết hạn sau 15 phút (chuẩn UTC)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    # Lưu bản ghi token mới vào database
    reset_token_record = models.PasswordResetToken(
        user_id=user.id,
        token_hash=token_hashed,
        expires_at=expires_at,
        is_used=0
    )
    db.add(reset_token_record)
    db.commit()

    # Tạo đường dẫn Frontend kết hợp với port 5173 hiện tại của bạn
    reset_link = f"{settings.frontend_url}/reset-password?token={raw_token}"

    return {
        "message": "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
        # Trả về link debug để test trực tiếp trên Swagger/Postman ở môi trường dev
        "debug_reset_link": reset_link
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    payload: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """Xác nhận đặt lại mật khẩu mới bằng token."""
    token_hashed = hash_token(payload.token)

    # Tìm bản ghi token trong database thông qua mã băm SHA-256
    token_record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token_hash == token_hashed
    ).first()

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token không hợp lệ.",
        )

    # Kiểm tra xem token đã được sử dụng trước đó chưa (Chống tái sử dụng)
    if token_record.is_used == 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token này đã được sử dụng rồi.",
        )

    # Kiểm tra thời gian hết hạn của token so với thời gian hiện tại (UTC)
    current_time = datetime.now(timezone.utc)
    if token_record.expires_at < current_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token đã hết hạn.",
        )

    # Tìm thông tin người dùng sở hữu token
    user = db.query(models.User).filter(models.User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy người dùng.",
        )

    # Cập nhật mật khẩu mới (đã mã hóa bcrypt)
    user.password_hash = get_password_hash(payload.new_password)
    
    # Đánh dấu token đã được sử dụng (chỉ cho phép dùng 1 lần duy nhất)
    token_record.is_used = 1

    db.commit()

    return {"message": "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập lại bằng mật khẩu mới."}