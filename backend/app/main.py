from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import audit_logs, auth, comments, projects, tasks

app = FastAPI(title="Task Tracker API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["Auth"],
)

app.include_router(
    projects.router,
    prefix="/api/v1/projects",
    tags=["Projects"],
)

app.include_router(
    tasks.router,
    prefix="/api/v1/tasks",
    tags=["Tasks"],
)

app.include_router(
    comments.router,
    prefix="/api/v1/comments",
    tags=["Comments"],
)

app.include_router(
    audit_logs.router,
    prefix="/api/v1/audit-logs",
    tags=["Audit"],
)


@app.get("/")
def root():
    return {"message": "Welcome to Task Tracker API"}


@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "ok"}