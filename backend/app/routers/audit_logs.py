from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_current_user

router = APIRouter(tags=["Audit Logs"])


@router.get("/", response_model=List[schemas.ActivityLogOut])
def get_activity_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    task_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Xem lịch sử hoạt động, sắp xếp mới nhất lên đầu."""

    query = db.query(models.ActivityLog)

    if task_id is not None:
        query = query.filter(models.ActivityLog.task_id == task_id)

    logs = (
        query.order_by(models.ActivityLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return logs
