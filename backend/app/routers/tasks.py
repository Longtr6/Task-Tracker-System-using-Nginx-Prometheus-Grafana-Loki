from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_current_user


router = APIRouter(tags=["Tasks"])


@router.post(
    "/",
    response_model=schemas.TaskOut,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Tạo Task mới và tự động lưu ActivityLog."""

    try:
        # 1. Kiểm tra dự án có tồn tại không
        project = (
            db.query(models.Project)
            .filter(models.Project.id == task_in.project_id)
            .first()
        )

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dự án không tồn tại",
            )

        # 2. Kiểm tra người tạo có thuộc dự án không
        member = (
            db.query(models.ProjectMember)
            .filter_by(
                project_id=task_in.project_id,
                user_id=current_user.id,
            )
            .first()
        )

        if not member and current_user.role != models.UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không thuộc dự án này",
            )

        # 3. Tạo Task
        new_task = models.Task(
            project_id=task_in.project_id,
            title=task_in.title,
            description=task_in.description,
            status=task_in.status,
            priority=task_in.priority,
            deadline=task_in.deadline,
            created_by=current_user.id,
        )

        db.add(new_task)
        db.flush()

        # 4. Thêm người được giao nếu có
        if task_in.assignee_ids:
            for user_id in task_in.assignee_ids:
                is_project_member = (
                    db.query(models.ProjectMember)
                    .filter_by(
                        project_id=task_in.project_id,
                        user_id=user_id,
                    )
                    .first()
                )

                if not is_project_member:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"User ID {user_id} "
                            "không thuộc dự án này"
                        ),
                    )

                db.add(
                    models.TaskAssignee(
                        task_id=new_task.id,
                        user_id=user_id,
                    )
                )

        # 5. Ghi nhật ký hoạt động
        log = models.ActivityLog(
            user_id=current_user.id,
            task_id=new_task.id,
            action="CREATED_TASK",
            new_value=new_task.title,
        )

        db.add(log)

        # 6. Lưu dữ liệu
        db.commit()
        db.refresh(new_task)

        return new_task

    except Exception:
        db.rollback()
        raise


@router.get(
    "/",
    response_model=List[schemas.TaskOut],
)
def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    project_id: Optional[int] = None,
    task_status: Optional[models.TaskStatus] = None,
    priority: Optional[models.TaskPriority] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Lấy danh sách Task có phân trang và bộ lọc."""

    query = db.query(models.Task)

    # 1. Giới hạn dự án mà người dùng được xem
    if current_user.role != models.UserRole.ADMIN:
        query = (
            query.join(
                models.ProjectMember,
                models.Task.project_id
                == models.ProjectMember.project_id,
            )
            .filter(
                models.ProjectMember.user_id == current_user.id
            )
        )

    # 2. Lọc theo dự án
    if project_id is not None:
        query = query.filter(
            models.Task.project_id == project_id
        )

    # 3. Lọc theo trạng thái
    if task_status is not None:
        query = query.filter(
            models.Task.status == task_status
        )

    # 4. Lọc theo mức độ ưu tiên
    if priority is not None:
        query = query.filter(
            models.Task.priority == priority
        )

    # 5. Phân trang và trả kết quả
    return query.offset(skip).limit(limit).all()


@router.patch(
    "/{task_id}/status",
    response_model=schemas.TaskOut,
)
def update_task_status(
    task_id: int,
    new_status: models.TaskStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Cập nhật trạng thái Task và ghi ActivityLog."""

    # 1. Tìm Task
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy Task",
        )

    # 2. Kiểm tra quyền cập nhật
    is_manager = (
        db.query(models.ProjectMember)
        .filter_by(
            project_id=task.project_id,
            user_id=current_user.id,
            role_in_project=models.ProjectRole.MANAGER,
        )
        .first()
    )

    is_creator = task.created_by == current_user.id

    is_assignee = (
        db.query(models.TaskAssignee)
        .filter_by(
            task_id=task.id,
            user_id=current_user.id,
        )
        .first()
    )

    if not (
        is_manager
        or is_creator
        or is_assignee
        or current_user.role == models.UserRole.ADMIN
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền cập nhật Task này",
        )

    # 3. Lưu trạng thái cũ và cập nhật trạng thái mới
    old_status_val = task.status.value
    task.status = new_status

    # 4. Ghi nhật ký thay đổi trạng thái
    log = models.ActivityLog(
        user_id=current_user.id,
        task_id=task.id,
        action="MOVED_STATUS",
        old_value=old_status_val,
        new_value=new_status.value,
    )

    db.add(log)
    db.commit()
    db.refresh(task)

    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Xóa Task khỏi cơ sở dữ liệu."""

    # 1. Tìm Task
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy Task",
        )

    # 2. Kiểm tra quyền xóa
    is_manager = (
        db.query(models.ProjectMember)
        .filter_by(
            project_id=task.project_id,
            user_id=current_user.id,
            role_in_project=models.ProjectRole.MANAGER,
        )
        .first()
    )

    if (
        task.created_by != current_user.id
        and not is_manager
        and current_user.role != models.UserRole.ADMIN
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa Task này",
        )

    # 3. Xóa Task
    db.delete(task)
    db.commit()

    return None