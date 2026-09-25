import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import register_routes
from app.core.database import Base, SessionLocal, engine
from app.models import Usuario
from app.seed import seed_database


def get_cors_origins():
    raw = os.getenv("CORS_ORIGINS", "")
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    if os.getenv("ENVIRONMENT") == "production":
        return ["https://your-frontend-domain.vercel.app"]
    return ["http://localhost:4200", "http://127.0.0.1:4200"]


Base.metadata.create_all(bind=engine)

ENVIRONMENT = os.getenv("ENVIRONMENT", "local")
if ENVIRONMENT in {"local", "development"}:
    db = SessionLocal()
    try:
        if db.query(Usuario).count() == 0:
            seed_database()
    finally:
        db.close()

app = FastAPI(
    title="Sistema de Gestão de Núcleos de Ensino Teológico",
    description="API RESTful completa com suporte a CRUD e RBAC.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

register_routes(app)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
