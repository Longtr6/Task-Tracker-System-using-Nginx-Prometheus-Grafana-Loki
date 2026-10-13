-- ============================================================
-- TASK TRACKER SYSTEM - DATABASE INITIALIZATION
-- Database: PostgreSQL 15+
-- Mô tả: Khởi tạo schema và dữ liệu mẫu cho hệ thống Task Tracker
-- ============================================================

-- Xóa database cũ nếu tồn tại (dùng khi chạy lại script)
-- LƯU Ý: Chỉ dùng trong môi trường dev, KHÔNG dùng ở production
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS task_assignees CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS project_role CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;

-- ============================================================
-- 1. ĐỊNH NGHĨA CÁC KIỂU ENUM (Dùng cho các cột có giá trị cố định)
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE project_role AS ENUM ('MANAGER', 'MEMBER');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- ============================================================
-- 2. TẠO CÁC BẢNG (SCHEMA)
-- ============================================================

-- ---------- BẢNG: USERS ----------
-- Lưu tài khoản đăng nhập (cả Admin và User thường)
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,  -- Mật khẩu đã mã hóa bằng bcrypt
    email           VARCHAR(100) UNIQUE NOT NULL,
    role            user_role    NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- BẢNG: USER_PROFILES ----------
-- Lưu thông tin chi tiết (tách riêng để bảo mật)
CREATE TABLE user_profiles (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(100),
    avatar_url      VARCHAR(255),
    job_title       VARCHAR(100),
    phone_number    VARCHAR(20)
);

-- ---------- BẢNG: PROJECTS ----------
-- Lưu dự án/nhóm làm việc
CREATE TABLE projects (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    owner_id        INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date      DATE,
    end_date        DATE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- BẢNG: PROJECT_MEMBERS ----------
-- Bảng trung gian N-N: User tham gia Project nào
CREATE TABLE project_members (
    id              SERIAL PRIMARY KEY,
    project_id      INTEGER      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_project project_role NOT NULL DEFAULT 'MEMBER',
    joined_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, user_id)  -- 1 user chỉ tham gia 1 project 1 lần
);

-- ---------- BẢNG: TASKS ----------
-- Bảng trung tâm: công việc
CREATE TABLE tasks (
    id              SERIAL PRIMARY KEY,
    project_id      INTEGER       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(200)  NOT NULL,
    description     TEXT,
    status          task_status   NOT NULL DEFAULT 'TODO',
    priority        task_priority NOT NULL DEFAULT 'MEDIUM',
    deadline        TIMESTAMP,
    created_by      INTEGER       NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- BẢNG: TASK_ASSIGNEES ----------
-- Bảng trung gian N-N: Task giao cho User nào
CREATE TABLE task_assignees (
    id              SERIAL PRIMARY KEY,
    task_id         INTEGER   NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id         INTEGER   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (task_id, user_id)
);

-- ---------- BẢNG: COMMENTS ----------
-- Bình luận trong task
CREATE TABLE comments (
    id              SERIAL PRIMARY KEY,
    task_id         INTEGER   NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id         INTEGER   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT      NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- BẢNG: ACTIVITY_LOGS ----------
-- Lịch sử hoạt động (Audit trail)
CREATE TABLE activity_logs (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id         INTEGER   REFERENCES tasks(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,
    old_value       VARCHAR(255),
    new_value       VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. TẠO INDEX (Tăng tốc truy vấn)
-- ============================================================

CREATE INDEX idx_tasks_project_id    ON tasks(project_id);
CREATE INDEX idx_tasks_status        ON tasks(status);
CREATE INDEX idx_tasks_deadline      ON tasks(deadline);
CREATE INDEX idx_task_assignees_user ON task_assignees(user_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_activity_logs_user  ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_task  ON activity_logs(task_id);
CREATE INDEX idx_comments_task       ON comments(task_id);

-- ============================================================
-- 4. CHÈN DỮ LIỆU MẪU (SEED DATA)
-- ============================================================

-- ---------- 4.1. USERS ----------
-- Mật khẩu mẫu đều là: "Password123!" (đã hash bằng bcrypt, cost 10)
-- LƯU Ý: Trong thực tế, hash này được sinh ra từ bcrypt.hash('Password123!', 10)
INSERT INTO users (username, password_hash, email, role) VALUES
('admin',       '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ012', 'admin@tasktracker.com', 'ADMIN'),
('nguyenvana',  '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ013', 'vana@gmail.com',        'USER'),
('tranthib',    '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ014', 'thib@gmail.com',        'USER'),
('levanc',      '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ015', 'vanc@gmail.com',        'USER'),
('phamthid',    '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ016', 'thid@gmail.com',        'USER');

-- ---------- 4.2. USER_PROFILES ----------
INSERT INTO user_profiles (user_id, full_name, avatar_url, job_title, phone_number) VALUES
(1, 'Quản Trị Viên',      'https://i.pravatar.cc/150?u=1', 'System Admin',      '0901000001'),
(2, 'Nguyễn Văn A',       'https://i.pravatar.cc/150?u=2', 'Backend Developer', '0901000002'),
(3, 'Trần Thị B',         'https://i.pravatar.cc/150?u=3', 'Frontend Developer','0901000003'),
(4, 'Lê Văn C',           'https://i.pravatar.cc/150?u=4', 'DevOps Engineer',   '0901000004'),
(5, 'Phạm Thị D',         'https://i.pravatar.cc/150?u=5', 'QA Engineer',       '0901000005');

-- ---------- 4.3. PROJECTS ----------
INSERT INTO projects (name, description, owner_id, start_date, end_date) VALUES
('Đồ án Task Tracker',  'Xây dựng hệ thống quản lý công việc cho nhóm sinh viên', 2, '2025-01-01', '2025-03-31'),
('Website Bán Hàng',    'Phát triển website thương mại điện tử cho công ty ABC',  3, '2025-02-01', '2025-06-30'),
('App Mobile Fitness',  'Ứng dụng theo dõi sức khỏe và luyện tập',               4, '2025-03-01', '2025-08-31');

-- ---------- 4.4. PROJECT_MEMBERS ----------
INSERT INTO project_members (project_id, user_id, role_in_project) VALUES
-- Dự án 1: Đồ án Task Tracker
(1, 2, 'MANAGER'),
(1, 3, 'MEMBER'),
(1, 4, 'MEMBER'),
(1, 5, 'MEMBER'),
-- Dự án 2: Website Bán Hàng
(2, 3, 'MANAGER'),
(2, 2, 'MEMBER'),
(2, 5, 'MEMBER'),
-- Dự án 3: App Mobile Fitness
(3, 4, 'MANAGER'),
(3, 2, 'MEMBER');

-- ---------- 4.5. TASKS ----------
INSERT INTO tasks (project_id, title, description, status, priority, deadline, created_by) VALUES
-- Dự án 1
(1, 'Thiết kế Database',          'Thiết kế ERD và viết script init.sql',        'DONE',        'HIGH',   '2025-01-10 23:59:59', 2),
(1, 'Xây dựng API đăng nhập',     'API login/register với JWT',                  'IN_PROGRESS', 'HIGH',   '2025-01-20 23:59:59', 2),
(1, 'Làm giao diện Kanban Board', 'Drag & drop task giữa các cột trạng thái',    'IN_PROGRESS', 'URGENT', '2025-01-25 23:59:59', 3),
(1, 'Viết tài liệu API',          'Sử dụng Swagger để document API',             'TODO',        'MEDIUM', '2025-02-05 23:59:59', 2),
(1, 'Cấu hình Docker Compose',    'Setup Nginx, Prometheus, Grafana, Loki',      'REVIEW',      'HIGH',   '2025-02-10 23:59:59', 4),
-- Dự án 2
(2, 'Thiết kế UI trang chủ',      'Sử dụng Figma để thiết kế',                   'DONE',        'HIGH',   '2025-02-15 23:59:59', 3),
(2, 'Tích hợp cổng thanh toán',   'Tích hợp VNPay và Momo',                      'TODO',        'URGENT', '2025-03-01 23:59:59', 3),
(2, 'Viết unit test',             'Coverage >= 80%',                             'TODO',        'MEDIUM', '2025-03-15 23:59:59', 5),
-- Dự án 3
(3, 'Nghiên cứu thư viện chart',  'So sánh Recharts vs Chart.js',                'DONE',        'LOW',    '2025-03-10 23:59:59', 4),
(3, 'Xây dựng module đếm bước chân', 'Dùng sensor của điện thoại',               'IN_PROGRESS', 'HIGH',   '2025-04-01 23:59:59', 4);

-- ---------- 4.6. TASK_ASSIGNEES ----------
INSERT INTO task_assignees (task_id, user_id) VALUES
(1, 2),
(2, 2),
(2, 4),
(3, 3),
(4, 2),
(5, 4),
(5, 2),
(6, 3),
(7, 3),
(8, 5),
(9, 4),
(10, 4),
(10, 2);

-- ---------- 4.7. COMMENTS ----------
INSERT INTO comments (task_id, user_id, content) VALUES
(1, 3, 'ERD nhìn ổn rồi đó A, nhưng có nên thêm bảng Notification không?'),
(1, 2, 'Để mình xem lại, có thể thêm sau nếu kịp tiến độ.'),
(2, 4, 'Nhớ dùng bcrypt cost >= 10 cho password nha!'),
(2, 2, 'OK C, mình đã config cost=10 rồi.'),
(3, 5, 'UI cần responsive trên mobile nữa nhé B.'),
(3, 3, 'Đã note, mình sẽ dùng Tailwind để responsive.'),
(5, 2, 'Docker Compose chạy ngon chưa C?'),
(5, 4, 'Chạy ổn rồi, Prometheus scrape được metrics từ backend.');

-- ---------- 4.8. ACTIVITY_LOGS ----------
INSERT INTO activity_logs (user_id, task_id, action, old_value, new_value) VALUES
(2, 1, 'CREATED_TASK',    NULL,           'Thiết kế Database'),
(2, 1, 'MOVED_STATUS',    'TODO',         'IN_PROGRESS'),
(2, 1, 'MOVED_STATUS',    'IN_PROGRESS',  'DONE'),
(2, 2, 'CREATED_TASK',    NULL,           'Xây dựng API đăng nhập'),
(4, 2, 'COMMENTED',       NULL,           'Nhớ dùng bcrypt cost >= 10 cho password nha!'),
(3, 3, 'MOVED_STATUS',    'TODO',         'IN_PROGRESS'),
(4, 5, 'CREATED_TASK',    NULL,           'Cấu hình Docker Compose'),
(4, 5, 'MOVED_STATUS',    'TODO',         'REVIEW'),
(5, 8, 'CREATED_TASK',    NULL,           'Viết unit test'),
(3, 7, 'CREATED_TASK',    NULL,           'Tích hợp cổng thanh toán');

-- ============================================================
-- 5. KIỂM TRA DỮ LIỆU SAU KHI CHÈN
-- ============================================================

-- Đếm số bản ghi trong mỗi bảng
SELECT 'users'            AS table_name, COUNT(*) AS total FROM users
UNION ALL SELECT 'user_profiles',     COUNT(*) FROM user_profiles
UNION ALL SELECT 'projects',          COUNT(*) FROM projects
UNION ALL SELECT 'project_members',   COUNT(*) FROM project_members
UNION ALL SELECT 'tasks',             COUNT(*) FROM tasks
UNION ALL SELECT 'task_assignees',    COUNT(*) FROM task_assignees
UNION ALL SELECT 'comments',          COUNT(*) FROM comments
UNION ALL SELECT 'activity_logs',     COUNT(*) FROM activity_logs;

-- ============================================================
-- 6. VIEW TIỆN ÍCH (Tùy chọn - giúp query nhanh hơn)
-- ============================================================

-- View: Xem task kèm tên người tạo và dự án
CREATE OR REPLACE VIEW v_task_overview AS
SELECT
    t.id              AS task_id,
    t.title           AS task_title,
    t.status,
    t.priority,
    t.deadline,
    p.name            AS project_name,
    u.username        AS created_by_username,
    up.full_name      AS created_by_fullname
FROM tasks t
JOIN projects p     ON t.project_id = p.id
JOIN users u        ON t.created_by = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- View: Xem task được giao cho ai
CREATE OR REPLACE VIEW v_task_assignments AS
SELECT
    t.id            AS task_id,
    t.title         AS task_title,
    u.id            AS user_id,
    u.username,
    up.full_name,
    ta.assigned_at
FROM task_assignees ta
JOIN tasks t            ON ta.task_id = t.id
JOIN users u            ON ta.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- ============================================================
-- HOÀN TẤT KHỞI TẠO DATABASE
-- ============================================================