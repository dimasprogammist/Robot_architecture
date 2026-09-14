from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import bootstrap, router

app = FastAPI(title="Architecture Canvas", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")
bootstrap()


@app.get("/api/health")
def health():
    return {"ok": True}
