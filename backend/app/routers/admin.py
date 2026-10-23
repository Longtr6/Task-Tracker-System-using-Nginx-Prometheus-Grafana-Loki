
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.database import get_db
from app.deps import get_current_user

router = APIRouter(tags=["Admin"])


def require_admin(
    current_user: models.User = Depends(get_current_user),
):
    """Chỉ cho phép tài khoản Admin sử dụng API quản trị."""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập chức năng quản trị.",
        )

    return current_user


@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    """Thống kê tổng quan hệ thống dành cho Admin."""

    total_users = db.query(models.User).count()
    total_projects = db.query(models.Project).count()
    total_tasks = db.query(models.Task).count()

    completed_tasks = (
        db.query(models.Task)
        .filter(models.Task.status == models.TaskStatus.DONE)
        .count()
    )

    overdue_tasks = (
        db.query(models.Task)
        .filter(
            models.Task.deadline < datetime.now(timezone.utc),
            models.Task.status != models.TaskStatus.DONE,
        )
        .count()
    )

    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "overdue_tasks": overdue_tasks,
    }


@router.get("/users", response_model=list[schemas.UserOut])
def get_admin_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    """Lấy danh sách người dùng, hỗ trợ tìm kiếm và phân trang."""

    query = (
        db.query(models.User)
        .options(selectinload(models.User.profile))
    )

    # Tìm kiếm theo username hoặc email
    if search and search.strip():
        keyword = f"%{search.strip()}%"
        query = query.filter(
            models.User.username.ilike(keyword)
            | models.User.email.ilike(keyword)
        )

    # Sắp xếp và phân trang
    users = (
        query
        .order_by(models.User.id.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return users
