from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Import các Enum từ models
from app.models import UserRole, ProjectRole, TaskStatus, TaskPriority


# ==========================================
# 1. AUTHENTICATION SCHEMAS
# ==========================================

class Token(BaseModel):
    """Schema kết quả trả về khi đăng nhập thành công"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema chứa thông tin trích xuất từ JWT Token"""
    username: Optional[str] = None
    user_id: Optional[int] = None


class ChangePasswordRequest(BaseModel):
    """Schema yêu cầu đổi mật khẩu cá nhân"""
    current_password: str
    new_password: str = Field(..., min_length=6, description="Mật khẩu mới tối thiểu 6 ký tự")


class ResetPasswordRequest(BaseModel):
    """Schema đặt lại mật khẩu bằng Token"""
    token: str
    new_password: str = Field(..., min_length=6, description="Mật khẩu mới tối thiểu 6 ký tự")


# <--- ĐOẠN MỚI THÊM: Schema nhận email khi người dùng yêu cầu quên mật khẩu
class ForgotPasswordRequest(BaseModel):
    """Schema yêu cầu quên mật khẩu (gửi qua email)"""
    email: EmailStr = Field(..., description="Email đã đăng ký tài khoản")


# ==========================================
# 2. USER & USER PROFILE SCHEMAS
# ==========================================

class UserProfileBase(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    job_title: Optional[str] = None
    phone_number: Optional[str] = None


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileOut(UserProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: UserRole = UserRole.USER


class UserCreate(UserBase):
    """Schema đăng ký / tạo tài khoản người dùng"""
    password: str = Field(..., min_length=6, description="Mật khẩu khởi tạo tối thiểu 6 ký tự")


class UserUpdate(BaseModel):
    """Schema cập nhật thông tin tài khoản"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None


class UserOut(UserBase):
    """Schema dữ liệu người dùng trả về cho Client"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    profile: Optional[UserProfileOut] = None


# ==========================================
# 3. PROJECT SCHEMAS
# ==========================================

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Tên dự án")
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ProjectCreate(ProjectBase):
    """Schema tạo dự án mới"""
    pass


class ProjectUpdate(BaseModel):
    """Schema cập nhật dự án"""
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ProjectMemberBase(BaseModel):
    user_id: int
    role_in_project: ProjectRole = ProjectRole.MEMBER


class ProjectMemberCreate(ProjectMemberBase):
    pass


class ProjectMemberUpdate(BaseModel):
    role_in_project: ProjectRole


class ProjectMemberOut(BaseModel):
    """Schema trả về thông tin thành viên trong dự án"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    user_id: int
    role_in_project: ProjectRole
    joined_at: datetime
    user: Optional[UserOut] = None


class ProjectOut(ProjectBase):
    """Schema trả về danh sách dự án"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    created_at: datetime
    owner: Optional[UserOut] = None


class ProjectDetailOut(ProjectOut):
    """Schema chi tiết dự án bao gồm cả danh sách thành viên"""
    members: List[ProjectMemberOut] = []


# ==========================================
# 4. TASK & ASSIGNEE SCHEMAS
# ==========================================

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Tiêu đề công việc")
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    deadline: Optional[datetime] = None


class TaskCreate(TaskBase):
    """Schema tạo công việc mới"""
    project_id: int
    assignee_ids: Optional[List[int]] = Field(default=[], description="Danh sách ID người dùng được giao task")


class TaskUpdate(BaseModel):
    """Schema cập nhật công việc"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    deadline: Optional[datetime] = None


class TaskAssigneeOut(BaseModel):
    """Schema trả về thông tin người được giao task"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    user_id: int
    assigned_at: datetime
    user: Optional[UserOut] = None


class TaskOut(TaskBase):
    """Schema danh sách công việc"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    created_by: Optional[int] = None
    created_at: datetime
    creator: Optional[UserOut] = None
    assignees: List[TaskAssigneeOut] = []


# ==========================================
# 5. COMMENT SCHEMAS
# ==========================================

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, description="Nội dung bình luận")


class CommentCreate(CommentBase):
    """Schema gửi bình luận vào task"""
    task_id: int


class CommentUpdate(CommentBase):
    """Schema chỉnh sửa bình luận"""
    pass


class CommentOut(CommentBase):
    """Schema trả về danh sách bình luận"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    user_id: int
    created_at: datetime
    user: Optional[UserOut] = None


# ==========================================
# 6. ACTIVITY LOG SCHEMAS
# ==========================================

class ActivityLogOut(BaseModel):
    """Schema trả về nhật ký hoạt động (Audit Trail)"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    task_id: Optional[int] = None
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None


# ==========================================
# 7. FULL TASK DETAIL SCHEMA
# ==========================================

class TaskDetailOut(TaskOut):
    """Schema chi tiết công việc bao gồm bình luận và nhật ký hoạt động"""
    comments: List[CommentOut] = []
    activity_logs: List[ActivityLogOut] = []