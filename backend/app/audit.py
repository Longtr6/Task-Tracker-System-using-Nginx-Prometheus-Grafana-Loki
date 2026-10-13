from typing import Any, Optional
from sqlalchemy.orm import Session
from app import models


def log_activity(
    db: Session,
    user_id: int,
    action: str,
    task_id: Optional[int] = None,
    old_value: Optional[Any] = None,
    new_value: Optional[Any] = None,
    autocommit: bool = True,
) -> models.ActivityLog:
    """
    Ghi nhật ký hoạt động (Activity Log / Audit Trail) cho các thao tác trong hệ thống Task Tracker.

    Tham số:
    - db: SQLAlchemy Session.
    - user_id: ID của người dùng thực hiện thao tác.
    - action: Tên hành động (Ví dụ: "CREATED_TASK", "MOVED_STATUS", "COMMENTED").
    - task_id: ID của công việc liên quan (nếu có).
    - old_value: Giá trị cũ trước khi thay đổi (Tự động ép kiểu về chuỗi String).
    - new_value: Giá trị mới sau khi thay đổi (Tự động ép kiểu về chuỗi String).
    - autocommit: Cho phép tự động commit vào CSDL (Mặc định True).
    """
    # Tự động chuyển đổi các kiểu dữ liệu phức tạp về dạng chuỗi String
    formatted_old_value = str(old_value) if old_value is not None else None
    formatted_new_value = str(new_value) if new_value is not None else None

    # Khởi tạo bản ghi ActivityLog chuẩn theo CSDL Task Tracker
    log_entry = models.ActivityLog(
        user_id=user_id,
        task_id=task_id,
        action=action,
        old_value=formatted_old_value,
        new_value=formatted_new_value,
    )

    db.add(log_entry)

    if autocommit:
        db.commit()
        db.refresh(log_entry)

    return log_entry