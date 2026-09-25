import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parents[2]

environment = os.getenv("ENVIRONMENT", "local")
if environment == "local":
    load_dotenv(BASE_DIR / ".env.local", override=False)
elif environment == "development":
    load_dotenv(BASE_DIR / ".env.dev", override=False)
elif environment == "production":
    load_dotenv(BASE_DIR / ".env.prd", override=False)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    sqlite_path = (BASE_DIR / "nucleos_ensino.db").resolve().as_posix()
    DATABASE_URL = f"sqlite:///{sqlite_path}"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
