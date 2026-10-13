from typing import List
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

# Import các model và dependency từ dự án
from app.models import User, UserRole, ProjectMember, ProjectRole
from app.deps import get_current_user
from app.database import get_db


class RoleChecker:
    """
    Dependency class kiểm tra phân quyền cấp độ HỆ THỐNG dựa trên vai trò người dùng (UserRole).
    """

    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        # Kiểm tra vai trò của User có nằm trong danh sách được phép truy cập không
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền truy cập hoặc thực hiện thao tác này trên hệ thống.",
            )

        return current_user


# ============================================================
# CÁC ĐỐI TƯỢNG PHÂN QUYỀN CẤP ĐỘ HỆ THỐNG (GLOBAL RBAC)
# ============================================================

# 1. TẤT CẢ TÀI KHOẢN ĐÃ ĐĂNG NHẬP (Cả USER và ADMIN đều dùng được)
# Dùng cho các API cơ bản như: xem profile, cập nhật thông tin cá nhân.
require_authenticated = RoleChecker([UserRole.USER, UserRole.ADMIN])

# 2. QUYỀN DÀNH RIÊNG CHO SYSTEM ADMIN
# Dùng cho các API quản trị như: Xem toàn bộ Audit Log, Quản lý tất cả dự án, Quản lý tài khoản...
require_admin = RoleChecker([UserRole.ADMIN])


# ============================================================
# PHÂN QUYỀN CẤP ĐỘ DỰ ÁN (PROJECT-LEVEL RBAC)
# ============================================================

def verify_project_manager(
    project_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency kiểm tra User hiện tại có phải là MANAGER của Dự án cụ thể hay không.
    (Lưu ý: Admin hệ thống tự động vượt qua bài kiểm tra này).
    """
    # Nếu là Admin hệ thống thì luôn có quyền
    if current_user.role == UserRole.ADMIN:
        return current_user
        
    # Kiểm tra trong bảng project_members
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không phải là thành viên của dự án này."
        )

    if membership.role_in_project != ProjectRole.MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Quản lý dự án (MANAGER) mới được thực hiện thao tác này."
        )

    return current_user