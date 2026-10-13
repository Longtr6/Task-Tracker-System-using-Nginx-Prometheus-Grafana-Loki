from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_current_user


router = APIRouter(tags=["Comments"])


@router.post(
    "/{task_id}/comments",
    response_model=schemas.CommentOut,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    task_id: int,
    comment_in: schemas.CommentBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Thêm bình luận vào Task và lưu ActivityLog."""

    # 1. Kiểm tra Task có tồn tại không
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task không tồn tại",
        )

    # 2. Kiểm tra người dùng có thuộc dự án chứa Task không
    is_member = (
        db.query(models.ProjectMember)
        .filter_by(
            project_id=task.project_id,
            user_id=current_user.id,
        )
        .first()
    )

    if not is_member and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không thuộc dự án này",
        )

    # 3. Tạo bình luận
    comment = models.Comment(
        task_id=task_id,
        user_id=current_user.id,
        content=comment_in.content,
    )
    db.add(comment)

    # 4. Ghi nhật ký hoạt động
    log = models.ActivityLog(
        user_id=current_user.id,
        task_id=task_id,
        action="COMMENTED",
        new_value=comment_in.content[:100],
    )
    db.add(log)

    # 5. Lưu vào cơ sở dữ liệu
    db.commit()
    db.refresh(comment)

    return comment