from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import bootstrap, router

BACKEND_DIR = Path(__file__).resolve().parents[1]
COURSE_DIR = BACKEND_DIR / "course"

app = FastAPI(title="Architecture Canvas", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/course-assets",
    StaticFiles(directory=str(COURSE_DIR)),
    name="course-assets",
)

app.include_router(router, prefix="/api")
bootstrap()


@app.get("/api/health")
def health():
    return {"ok": True}