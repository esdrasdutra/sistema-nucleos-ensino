from typing import Optional

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Usuario
from app.seed import seed_database


def read_root():
    return {
        "status": "online",
        "aplicacao": "Sistema de Gestão de Núcleos de Ensino Teológico - CRUD + RBAC",
        "docs": "/docs",
    }


def trigger_seed():
    seed_database()
    return {"message": "Banco de dados semeado com dados de teste com sucesso!"}


def listar_usuarios(perfil: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Usuario)
    if perfil:
        query = query.filter(Usuario.perfil == perfil.upper())
    return query.all()
