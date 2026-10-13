from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_current_user


router = APIRouter(tags=["Projects"])


@router.post(
    "/",
    response_model=schemas.ProjectOut,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    project_in: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Tạo dự án mới và tự động gán Creator làm MANAGER."""

    # 1. Tạo dự án
    project = models.Project(
        name=project_in.name,
        description=project_in.description,
        start_date=project_in.start_date,
        end_date=project_in.end_date,
        owner_id=current_user.id,
    )

    db.add(project)
    db.flush()

    # 2. Thêm người tạo vào dự án với vai trò MANAGER
    member = models.ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role_in_project=models.ProjectRole.MANAGER,
    )

    db.add(member)

    # 3. Lưu dữ liệu
    db.commit()
    db.refresh(project)

    return project


@router.get(
    "/",
    response_model=List[schemas.ProjectOut],
)
def list_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Xem danh sách dự án mà người dùng hiện tại tham gia."""

    # ADMIN được xem tất cả dự án
    if current_user.role == models.UserRole.ADMIN:
        return db.query(models.Project).all()

    # Người dùng thông thường chỉ xem dự án mình tham gia
    projects = (
        db.query(models.Project)
        .join(models.ProjectMember)
        .filter(
            models.ProjectMember.user_id == current_user.id
        )
        .all()
    )

    return projects


@router.get(
    "/{project_id}",
    response_model=schemas.ProjectDetailOut,
)
def get_project_detail(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Xem chi tiết dự án kèm danh sách thành viên."""

    # 1. Tìm dự án
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy dự án",
        )

    # 2. Kiểm tra quyền truy cập
    is_member = (
        db.query(models.ProjectMember)
        .filter_by(
            project_id=project_id,
            user_id=current_user.id,
        )
        .first()
    )

    if not is_member and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập dự án này",
        )

    return project


@router.post(
    "/{project_id}/members",
    response_model=schemas.ProjectMemberOut,
    status_code=status.HTTP_201_CREATED,
)
def add_project_member(
    project_id: int,
    member_in: schemas.ProjectMemberCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Thêm thành viên vào dự án: chỉ MANAGER dự án hoặc System ADMIN."""

    # 1. Kiểm tra dự án
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dự án không tồn tại",
        )

    # 2. Kiểm tra quyền người thực hiện
    if current_user.role != models.UserRole.ADMIN:
        manager = (
            db.query(models.ProjectMember)
            .filter_by(
                project_id=project_id,
                user_id=current_user.id,
                role_in_project=models.ProjectRole.MANAGER,
            )
            .first()
        )

        if not manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ Project Manager hoặc Admin mới có quyền thêm thành viên",
            )

    # 3. Kiểm tra người dùng cần thêm
    target_user = (
        db.query(models.User)
        .filter(models.User.id == member_in.user_id)
        .first()
    )

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng cần thêm không tồn tại",
        )

    # 4. Kiểm tra thành viên đã tồn tại chưa
    existing_member = (
        db.query(models.ProjectMember)
        .filter_by(
            project_id=project_id,
            user_id=member_in.user_id,
        )
        .first()
    )

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Người dùng đã là thành viên của dự án",
        )

    # 5. Thêm thành viên
    new_member = models.ProjectMember(
        project_id=project_id,
        user_id=member_in.user_id,
        role_in_project=member_in.role_in_project,
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member