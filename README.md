# 📋 TASK TRACKER SYSTEM - ĐỒ ÁN QUẢN LÝ VÀ TRIỂN KHAI HỆ THỐNG PHẦN MỀM

Hệ thống quản lý công việc cá nhân và nhóm (**Task Tracker**) được xây dựng theo mô hình full-stack hiện đại, tích hợp giao diện web, API RESTful, cơ sở dữ liệu, reverse proxy, monitoring và logging. Dự án đáp ứng các tiêu chuẩn kỹ thuật về triển khai hệ thống, phân quyền, bảo mật (Hardening) và giám sát hạ tầng bằng Docker.

---

## 🏗️ TỔNG QUAN HỆ THỐNG

Dự án gồm các thành phần chính được quản lý qua Docker Compose:

- **Frontend:** React + Vite, giao diện quản lý task, project và phân quyền người dùng.
- **Backend:** FastAPI, cung cấp API REST cho đăng ký, đăng nhập, quản lý người dùng, dự án, công việc (task), bình luận và quên/đặt lại mật khẩu.
- **Database:** PostgreSQL 16
- **Reverse Proxy:** Nginx, đóng vai trò điều hướng traffic, hỗ trợ HTTPS (chứng chỉ tự ký) và Security Headers cơ bản.
- **Monitoring:** Prometheus + Grafana (+ cAdvisor / Postgres Exporter) giám sát tài nguyên hệ thống và container.
- **Logging:** Loki + Promtail thu thập log tập trung.
- **Database Management:** pgAdmin, công cụ quản lý cơ sở dữ liệu trực quan.

### Mô hình chức năng chính

- Quản lý người dùng theo vai trò: `ADMIN` & `USER`
- Xác thực và phân quyền bằng JWT Token
- Quản lý dự án (`projects`) và thành viên tham gia (`project_members`)
- Quản lý công việc (`tasks`) với trạng thái (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`) và độ ưu tiên
- Bình luận trong task (`comments`) và lưu vết lịch sử hoạt động (`activity_logs` - Audit Log)
- Chức năng Quên mật khẩu / Đặt lại mật khẩu an toàn
- Giám sát hệ thống qua Prometheus/Grafana và thu thập log qua Loki/Promtail

---

## 📐 KIẾN TRÚC HỆ THỐNG

```text
Browser
  │
  ▼
Nginx (HTTPS / Reverse Proxy)
  ├── Frontend (React + Vite) - (Port 80/443)
  ├── Backend API (FastAPI)   - (/api/)
  ├── pgAdmin                 - (/pgadmin/)
  └── Grafana                 - (/grafana/)

Backend API → PostgreSQL (Port 5432)
Prometheus  → Thu thập metrics từ Backend, cAdvisor, PostgreSQL
Promtail    → Thu thập Docker Container Logs ──► Loki ──► Grafana (LogQL)

## CẤU TRÚC THƯ MỤC DỰ ÁN
.
├── backend/                 # API FastAPI
│   ├── app/                 # Routers, models, schemas, services, seed data
│   ├── alembic/             # Database migrations
│   ├── Dockerfile           # Dockerfile cho FastAPI backend
│   ├── requirements.txt     # Các thư viện Python yêu cầu
│   └── .env.example         # Template cấu hình môi trường backend
├── frontend/                # Frontend React + Vite
│   ├── src/                 # Source code (components, pages, services)
│   ├── public/              # Tài nguyên tĩnh
│   ├── Dockerfile           # Dockerfile cho React frontend
│   ├── package.json         # Danh sách packages Node.js
│   └── .env.example         # Template cấu hình môi trường frontend
├── nginx/                   # Cấu hình Nginx & chứng chỉ SSL
│   ├── nginx.conf           # Cấu hình Reverse Proxy & Security Headers
│   └── certs/               # Thư mục chứa SSL Certificate (tự ký)
├── monitoring/              # Cấu hình Prometheus, Grafana, Exporters
├── logging/                 # Cấu hình Loki & Promtail
├── database/                # Script SQL khởi tạo (init.sql / seed data)
├── docker-compose.yaml      # File điều phối toàn bộ các container
├── .env.example             # Template biến môi trường tổng hợp gốc
├── README.md                # Tài liệu giới thiệu và mô tả hệ thống
└── .gitignore               # Cấu hình loại trừ file nhạy cảm khi lên Git

🛠️ CÔNG NGHỆ SỬ DỤNG
Frontend: React 19, Vite, React Router, Axios, Tailwind CSS

Backend: Python 3.11, FastAPI, SQLAlchemy, Alembic, Pydantic, Passlib (Bcrypt), Python-Jose (JWT)

Database: PostgreSQL 16, pgAdmin 4

DevOps & Security: Docker, Docker Compose, Nginx, Prometheus, Grafana, Loki, Promtail, cAdvisor

TÍNH NĂNG CHÍNH
1. Quản lý người dùng và phân quyền
- Đăng ký, đăng nhập tài khoản an toàn với cơ chế xác thực JWT (JSON Web Token).
- Phân quyền người dùng theo vai trò: ADMIN và USER (user_role).
- Quản lý thông tin cá nhân chi tiết qua bảng hồ sơ (user_profiles).

2. Quản lý dự án (Projects)
- Cho phép người dùng tạo, chỉnh sửa và quản lý các dự án cá nhân hoặc làm việc nhóm (projects).
- Quản lý thành viên tham gia dự án (project_members) kèm theo vai trò cụ thể trong dự án (MANAGER, MEMBER).

3. Quản lý công việc (Tasks)
- Tạo, phân công và theo dõi tiến độ công việc trong từng dự án (tasks).
- Phân loại trạng thái công việc trực quan: TODO (Cần làm), IN_PROGRESS (Đang thực hiện), REVIEW (Đang kiểm tra), DONE (Đã hoàn thành).
- Thiết lập mức độ ưu tiên cho công việc (LOW, MEDIUM, HIGH, URGENT) và thời hạn hoàn thành (deadline).
- Giao task cho một hoặc nhiều thành viên thực hiện qua bảng trung gian (task_assignees).

4. Bình luận và Thảo luận (Comments)
- Hỗ trợ trao đổi, thảo luận trực tiếp thông qua hệ thống bình luận (comments) gắn liền với từng task cụ thể.

5. Lịch sử hoạt động (Audit Trail / Activity Logs)
- Ghi nhận và lưu vết toàn bộ lịch sử thao tác quan trọng của người dùng (activity_logs) như: tạo task, thay đổi trạng thái, bình luận, v.v. giúp việc quản trị và theo dõi minh bạch hơn.

6. Giám sát và Logging hệ thống
- Prometheus: Thu thập các metric hiệu năng từ Backend FastAPI, cơ sở dữ liệu PostgreSQL và các container Docker.
- Grafana: Trực quan hóa dữ liệu qua các Dashboard giám sát tài nguyên (CPU, RAM, Network).
- Loki + Promtail: Thu thập log tập trung từ toàn bộ hệ thống để phục vụ việc truy vấn và kiểm tra lỗi nhanh chóng bằng ngôn ngữ LogQL.

## TÀI KHOẢN MẶC ĐỊNH

Khi backend khởi động, hệ thống sẽ tự seed dữ liệu mẫu gồm (Mật khẩu chung: `Password123!`):

- Admin: `admin` (`admin@tasktracker.com`) / `Password123!`
- Backend Developer: `nguyenvana` (`vana@gmail.com`) / `Password123!`
- Frontend Developer: `tranthib` (`thib@gmail.com`) / `Password123!`
- DevOps Engineer: `levanc` (`vanc@gmail.com`) / `Password123!`

## YÊU CẦU MÔI TRƯỜNG

Trước khi khởi chạy hệ thống, đảm bảo máy của bạn đã cài đặt các công cụ sau:

- **Docker & Docker Compose:** Dùng để khởi chạy và quản lý các container (Backend, Frontend, PostgreSQL, Nginx, Prometheus, Grafana, Loki).
- **OpenSSL:** Dùng để tự sinh chứng chỉ SSL tự ký (`nginx.key`, `nginx.crt`) cho Nginx Reverse Proxy (HTTPS).
- **Git:** Dùng để clone mã nguồn dự án.
- **Trình duyệt web hiện đại:** Hỗ trợ truy cập giao diện hệ thống qua HTTPS.

## CÀI ĐẶT VÀ KHỞI CHẠY HỆ THỐNG

### Bước 1: Clone repo

```bash
git clone https://github.com/Longtr6/Task-Tracker-System-using-Nginx-Prometheus-Grafana-Loki.git
-cd Task-Tracker-System-using-Nginx-Prometheus-Grafana-Loki

Bước 2: Cấu hình biến môi trường
-Copy file .env.example thành .env nếu chưa tồn tại:
Bash
cp .env.example .env

Kiểm tra các biến môi trường quan trọng như:
POSTGRES_DB   
POSTGRES_USER   
POSTGRES_PASSWORD   
PGADMIN_DEFAULT_EMAIL   
PGADMIN_DEFAULT_PASSWORD   
SECRET_KEY   
ALGORITHM   
ACCESS_TOKEN_EXPIRE_MINUTES   
CORS_ORIGINS   
MAIL_USERNAME   
MAIL_PASSWORD   

Bước 3: Tạo chứng chỉ SSL cho Nginx

Dự án sử dụng Nginx làm reverse proxy HTTPS với chứng chỉ tự ký. Tạo thư mục cert và sinh khóa như sau:
Bash
mkdir -p nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/nginx.key \
  -out nginx/certs/nginx.crt \
  -subj "/C=VN/ST=ThaiNguyen/L=ThaiNguyen/O=ICTU/OU=SoftwareEngineering/CN=192.168.xxx.xxx"
chmod 600 nginx/certs/nginx.key
chmod 644 nginx/certs/nginx.crt

Lưu ý: thay 192.168.xxx.xxx bằng địa chỉ IP hoặc domain của máy chủ đang chạy hệ thống.

Bước 4: Khởi chạy toàn bộ hệ thống bằng Docker Compose
Bash
-docker compose up -d --build

Nếu máy bạn dùng phiên bản Docker cũ, có thể dùng:
Bash
-docker-compose up -d --build

Bước 5: Theo dõi log container
Bash
docker compose logs -f
Sau khi các container khởi động xong, backend sẽ tự chạy migration và seeding dữ liệu.

🌐 ĐỊA CHỈ TRUY CẬP HỆ THỐNG

Sau khi khởi chạy thành công bằng Docker Compose, bạn có thể truy cập các dịch vụ theo địa chỉ dưới đây. Thay <IP-CUA-MAY-CHU> bằng localhost nếu chạy trên máy cá nhân hoặc địa chỉ IP thực tế của máy chủ nếu triển khai trên server.

Giao diện Frontend (React): https://<IP-CUA-MAY-CHU>/

Tài liệu API (FastAPI Swagger Docs): https://<IP-CUA-MAY-CHU>/api/docs (nếu Nginx đã được cấu hình proxy phù hợp).

Quản lý Database (pgAdmin): http://<IP-CUA-MAY-CHU>:5050/

Giám sát hệ thống (Grafana Dashboard): http://<IP-CUA-MAY-CHU>:3000/

Truy vấn số liệu (Prometheus): http://<IP-CUA-MAY-CHU>:9090/

Lưu ý:

Nginx sử dụng cổng 80 cho HTTP và cổng 443 cho HTTPS. Việc truy cập bằng HTTPS yêu cầu cấu hình SSL hợp lệ theo cấu hình của dự án.

Đường dẫn /api/docs phụ thuộc vào cấu hình định tuyến của Nginx và FastAPI.

pgAdmin, Grafana và Prometheus hiện được publish trực tiếp qua các cổng 5050, 3000 và 9090, không đi qua Nginx theo cấu hình Docker Compose hiện tại.

PostgreSQL sử dụng cổng 5432 bên trong Docker network và không được publish trực tiếp ra máy host.

⚠️ Lưu ý về bảo mật: Các cổng 3000 (Grafana), 5050 (pgAdmin) và 9090 (Prometheus) có thể truy cập từ bên ngoài nếu cấu hình mạng và firewall cho phép. Hãy đổi mật khẩu mặc định, giới hạn truy cập bằng firewall và chỉ mở các cổng thực sự cần thiết. Không nên công khai các dịch vụ quản trị và giám sát ra Internet khi chưa có biện pháp bảo vệ phù hợp.

## THÔNG TIN ĐĂNG NHẬP MẶC ĐỊNH

### pgAdmin (Quản lý Database)
- **Email:** Lấy từ biến `PGADMIN_DEFAULT_EMAIL` trong file `.env` (mặc định: `admin@tasktracker.com`)[cite: 4]
- **Password:** Lấy từ biến `PGADMIN_DEFAULT_PASSWORD` trong file `.env` (mặc định: `YourPgAdminPassword123`)[cite: 4]

### Grafana (Giám sát hệ thống)
- **Username:** `admin`
- **Password:** Lấy từ biến `GF_SECURITY_ADMIN_PASSWORD` trong file `.env`

### Prometheus (Truy vấn số liệu)
- **Username:** Lấy từ biến `PROMETHEUS_AUTH_USER` trong file `.env`
- **Password:** Lấy từ biến `PROMETHEUS_AUTH_PASS` trong file `.env`

### Tài khoản ứng dụng (Task Tracker)
*(Nếu hệ thống của bạn có bật tính năng seeding dữ liệu mẫu khi khởi chạy)*:
- Bạn có thể đăng ký tài khoản trực tiếp trên giao diện Frontend hoặc sử dụng tài khoản Admin/User được khởi tạo sẵn trong quá trình seeding dữ liệu của cơ sở dữ liệu.

## DỪNG VÀ XÓA HỆ THỐNG

Để dừng tất cả container:

```bash
docker compose down
```

Nếu muốn xóa cả volume dữ liệu:

```bash
docker compose down -v
```

---
## GHI CHÚ

Dự án này là một hệ thống quản lý công việc (Task Tracker System) tích hợp giám sát hạ tầng và log tập trung (Nginx, Prometheus, Grafana, Loki), phục vụ chủ yếu cho mục đích học tập, nghiên cứu và phát triển kỹ năng DevOps/Fullstack. Cấu trúc Docker Compose giúp triển khai nhanh chóng, đồng bộ trên cả máy cá nhân (local) lẫn máy chủ (server) mà không cần cấu hình thủ công từng thành phần riêng lẻ.