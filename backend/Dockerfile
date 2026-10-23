# 1. Image gốc: Python 3.11 bản slim nhẹ và ổn định
FROM python:3.11-slim

# 2. Đặt thư mục làm việc bên trong container
WORKDIR /app

# 3. Biến môi trường giúp Python in log trực tiếp và không tạo file .pyc
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 4. Cài đặt thư viện hệ thống cần thiết cho PostgreSQL (psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# -------------------------------------------------------------------------
# [THAY ĐỔI / BỔ SUNG MỚI]: Tạo System User và Group riêng (Non-root user)
# Mục đích: Ngăn chặn kẻ tấn công chiếm quyền cao nhất (root) nếu container bị thâm nhập.
# -------------------------------------------------------------------------
RUN addgroup --system appgroup && adduser --system --no-create-home --ingroup appgroup appuser

# 5. Copy file requirements và cài đặt thư viện Python (tối ưu cache của Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# -------------------------------------------------------------------------
# [THAY ĐỔI]: Copy toàn bộ mã nguồn VÀ phân quyền sở hữu cho appuser
# Sử dụng `--chown=appuser:appgroup` để user thường có quyền đọc/thực thi mã nguồn.
# -------------------------------------------------------------------------
COPY --chown=appuser:appgroup . .

# -------------------------------------------------------------------------
# [THAY ĐỔI / BỔ SUNG MỚI]: Chuyển sang sử dụng user thường (Non-root)
# Từ dòng này trở đi, mọi tiến trình và ứng dụng chạy trong container sẽ 
# chạy dưới quyền của `appuser` thay vì `root`.
# -------------------------------------------------------------------------
USER appuser

# 7. Khai báo port container sẽ lắng nghe
EXPOSE 8000

# 8. Lệnh chạy mặc định (khi chạy độc lập không qua docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]