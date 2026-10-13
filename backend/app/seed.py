import sys
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session

# Import SessionLocal và Models
from app.database import SessionLocal
from app import models
from app.models import UserRole, ProjectRole, TaskStatus, TaskPriority
from app.security import get_password_hash

def seed_users(db: Session) -> dict:
    """Khởi tạo danh sách Người dùng (Admin & User) kèm UserProfile"""
    print("--- 1. Seeding Users & Profiles ---")
    
    users_data = [
        {
            "username": "admin",
            "email": "admin@tasktracker.com",
            "password": "Password123!",
            "role": UserRole.ADMIN,
            "full_name": "Quản Trị Viên",
            "job_title": "System Administrator",
            "phone_number": "0901000001",
        },
        {
            "username": "nguyenvana",
            "email": "vana@gmail.com",
            "password": "Password123!",
            "role": UserRole.USER,
            "full_name": "Nguyễn Văn A",
            "job_title": "Backend Developer",
            "phone_number": "0901000002",
        },
        {
            "username": "tranthib",
            "email": "thib@gmail.com",
            "password": "Password123!",
            "role": UserRole.USER,
            "full_name": "Trần Thị B",
            "job_title": "Frontend Developer",
            "phone_number": "0901000003",
        },
        {
            "username": "levanc",
            "email": "vanc@gmail.com",
            "password": "Password123!",
            "role": UserRole.USER,
            "full_name": "Lê Văn C",
            "job_title": "DevOps Engineer",
            "phone_number": "0901000004",
        },
    ]

    users = {}
    for u_info in users_data:
        user = db.query(models.User).filter(models.User.username == u_info["username"]).first()
        if not user:
            # 1. Tạo User
            user = models.User(
                username=u_info["username"],
                email=u_info["email"],
                password_hash=get_password_hash(u_info["password"]),
                role=u_info["role"],
            )
            db.add(user)
            db.flush()

            # 2. Tạo UserProfile
            profile = models.UserProfile(
                user_id=user.id,
                full_name=u_info["full_name"],
                job_title=u_info["job_title"],
                phone_number=u_info["phone_number"],
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}",
            )
            db.add(profile)
            db.commit()
            db.refresh(user)
            print(f"  [+] Đã tạo tài khoản: {user.username} ({user.role.value})")
        else:
            print(f"  [-] Tài khoản '{u_info['username']}' đã tồn tại.")
        
        users[u_info["username"]] = user

    return users


def seed_projects(db: Session, users: dict) -> dict:
    """Khởi tạo Dự án mẫu và gán Thành viên tham gia"""
    print("--- 2. Seeding Projects & Project Members ---")
    
    projects_data = [
        {
            "key": "task_tracker",
            "name": "Đồ án Task Tracker",
            "description": "Xây dựng hệ thống quản lý công việc cho nhóm sinh viên sử dụng FastAPI & PostgreSQL",
            "owner": users["nguyenvana"],
            "start_date": date.today() - timedelta(days=30),
            "end_date": date.today() + timedelta(days=60),
            "members": [
                (users["nguyenvana"], ProjectRole.MANAGER),
                (users["tranthib"], ProjectRole.MEMBER),
                (users["levanc"], ProjectRole.MEMBER),
            ],
        },
        {
            "key": "e_commerce",
            "name": "Website Bán Hàng Thương Mại Điện Tử",
            "description": "Phát triển website bán hàng trực tuyến tích hợp thanh toán VNPay",
            "owner": users["tranthib"],
            "start_date": date.today() - timedelta(days=15),
            "end_date": date.today() + timedelta(days=90),
            "members": [
                (users["tranthib"], ProjectRole.MANAGER),
                (users["nguyenvana"], ProjectRole.MEMBER),
            ],
        },
    ]

    projects = {}
    for p_info in projects_data:
        project = db.query(models.Project).filter(models.Project.name == p_info["name"]).first()
        if not project:
            # 1. Tạo Project
            project = models.Project(
                name=p_info["name"],
                description=p_info["description"],
                owner_id=p_info["owner"].id,
                start_date=p_info["start_date"],
                end_date=p_info["end_date"],
            )
            db.add(project)
            db.flush()

            # 2. Thêm Project Members
            for member_user, role in p_info["members"]:
                p_member = models.ProjectMember(
                    project_id=project.id,
                    user_id=member_user.id,
                    role_in_project=role,
                )
                db.add(p_member)

            db.commit()
            db.refresh(project)
            print(f"  [+] Đã tạo dự án: {project.name}")
        else:
            print(f"  [-] Dự án '{p_info['name']}' đã tồn tại.")

        projects[p_info["key"]] = project

    return projects


def seed_tasks(db: Session, users: dict, projects: dict) -> dict:
    """Khởi tạo Task và Phân công (Assignees) mẫu"""
    print("--- 3. Seeding Tasks & Assignees ---")
    
    now = datetime.now(timezone.utc)
    tasks_data = [
        {
            "key": "task_1",
            "project": projects["task_tracker"],
            "title": "Thiết kế CSDL & ORM Models",
            "description": "Thiết kế ERD, khởi tạo file models.py và viết script migrations",
            "status": TaskStatus.DONE,
            "priority": TaskPriority.HIGH,
            "deadline": now + timedelta(days=5),
            "created_by": users["nguyenvana"],
            "assignees": [users["nguyenvana"]],
        },
        {
            "key": "task_2",
            "project": projects["task_tracker"],
            "title": "Xây dựng Module Authentication & JWT",
            "description": "Lập trình API đăng ký, đăng nhập và middleware kiểm tra Token",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.URGENT,
            "deadline": now + timedelta(days=10),
            "created_by": users["nguyenvana"],
            "assignees": [users["nguyenvana"], users["levanc"]],
        },
        {
            "key": "task_3",
            "project": projects["task_tracker"],
            "title": "Thiết kế giao diện Kanban Board",
            "description": "Tạo UI hỗ trợ kéo thả Task giữa các trạng thái TODO, IN_PROGRESS, DONE",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.MEDIUM,
            "deadline": now + timedelta(days=15),
            "created_by": users["tranthib"],
            "assignees": [users["tranthib"]],
        },
    ]

    tasks = {}
    for t_info in tasks_data:
        task = db.query(models.Task).filter(
            models.Task.title == t_info["title"],
            models.Task.project_id == t_info["project"].id
        ).first()

        if not task:
            # 1. Tạo Task
            task = models.Task(
                project_id=t_info["project"].id,
                title=t_info["title"],
                description=t_info["description"],
                status=t_info["status"],
                priority=t_info["priority"],
                deadline=t_info["deadline"],
                created_by=t_info["created_by"].id,
            )
            db.add(task)
            db.flush()

            # 2. Tạo Task Assignees
            for user in t_info["assignees"]:
                assignee = models.TaskAssignee(
                    task_id=task.id,
                    user_id=user.id,
                )
                db.add(assignee)

            db.commit()
            db.refresh(task)
            print(f"  [+] Đã tạo Task: '{task.title}' [{task.status.value}]")
        else:
            print(f"  [-] Task '{t_info['title']}' đã tồn tại.")

        tasks[t_info["key"]] = task

    return tasks


def seed_comments_and_logs(db: Session, users: dict, tasks: dict):
    """Khởi tạo Bình luận (Comments) và Nhật ký (ActivityLogs) mẫu"""
    print("--- 4. Seeding Comments & Activity Logs ---")

    task1 = tasks["task_1"]
    task2 = tasks["task_2"]

    # 1. Thêm Comments mẫu
    comments_data = [
        {"task": task1, "user": users["tranthib"], "content": "ERD nhìn rất ổn rồi anh A ơi!"},
        {"task": task1, "user": users["nguyenvana"], "content": "Cảm ơn em, anh đã chuyển sang code models.py rồi."},
        {"task": task2, "user": users["levanc"], "content": "Mọi người nhớ dùng Bcrypt mã hóa mật khẩu nhé."},
    ]

    for c in comments_data:
        existing_comment = db.query(models.Comment).filter(
            models.Comment.task_id == c["task"].id,
            models.Comment.user_id == c["user"].id,
            models.Comment.content == c["content"],
        ).first()

        if not existing_comment:
            comment = models.Comment(
                task_id=c["task"].id,
                user_id=c["user"].id,
                content=c["content"],
            )
            db.add(comment)
            print(f"  [+] Đã thêm Comment vào Task ID #{c['task'].id}")

    # 2. Thêm ActivityLogs mẫu
    logs_data = [
        {
            "user": users["nguyenvana"],
            "task": task1,
            "action": "CREATED_TASK",
            "old_value": None,
            "new_value": task1.title,
        },
        {
            "user": users["nguyenvana"],
            "task": task1,
            "action": "MOVED_STATUS",
            "old_value": "IN_PROGRESS",
            "new_value": "DONE",
        },
        {
            "user": users["nguyenvana"],
            "task": task2,
            "action": "CREATED_TASK",
            "old_value": None,
            "new_value": task2.title,
        },
    ]

    for log_item in logs_data:
        existing_log = db.query(models.ActivityLog).filter(
            models.ActivityLog.task_id == log_item["task"].id,
            models.ActivityLog.action == log_item["action"],
            models.ActivityLog.new_value == log_item["new_value"],
        ).first()

        if not existing_log:
            log = models.ActivityLog(
                user_id=log_item["user"].id,
                task_id=log_item["task"].id,
                action=log_item["action"],
                old_value=log_item["old_value"],
                new_value=log_item["new_value"],
            )
            db.add(log)

    db.commit()
    print("  [+] Đã tạo các bản ghi Activity Log mẫu thành công.")


def run_seed():
    """Hàm chạy chính để Seeding dữ liệu Task Tracker"""
    db = SessionLocal()
    try:
        print("======== BẮT ĐẦU KHỞI TẠO DỮ LIỆU MẪU (TASK TRACKER) ========")
        users = seed_users(db)
        projects = seed_projects(db, users)
        tasks = seed_tasks(db, users, projects)
        seed_comments_and_logs(db, users, tasks)
        print("======== KHỞI TẠO DỮ LIỆU THÀNH CÔNG! ========")
    except Exception as e:
        db.rollback()
        print(f"\n[X] Lỗi khi nạp dữ liệu seed: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()