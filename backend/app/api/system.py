import hashlib
from typing import Optional

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Polo, Usuario
from app.schemas import CriarNucleoPublico, NucleoPublicoOut
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


def criar_nucleo_publico(dados: CriarNucleoPublico, db: Session = Depends(get_db)):
    if not dados.aceitou_termos:
        raise HTTPException(status_code=400, detail="É necessário aceitar os termos para criar um núcleo.")
    if len(dados.senha) < 8:
        raise HTTPException(status_code=400, detail="A senha deve ter pelo menos 8 caracteres.")
    if db.query(Usuario).filter(Usuario.email == dados.email_responsavel).first():
        raise HTTPException(status_code=409, detail="Já existe um usuário com este e-mail.")
    if db.query(Polo).filter(Polo.codigo == dados.codigo).first():
        raise HTTPException(status_code=409, detail="Já existe um núcleo com este código.")

    try:
        usuario = Usuario(
            nome=dados.nome_responsavel,
            email=dados.email_responsavel,
            senha_hash=hashlib.sha256(dados.senha.encode("utf-8")).hexdigest(),
            perfil="GESTOR_NUCLEO",
        )
        db.add(usuario)
        db.flush()
        polo = Polo(
            nome=dados.nome_nucleo,
            codigo=dados.codigo,
            cidade=dados.cidade,
            estado=dados.estado.upper(),
            responsavel_id=usuario.id,
            status="ATIVO",
        )
        db.add(polo)
        db.commit()
        db.refresh(usuario)
        db.refresh(polo)
    except Exception:
        db.rollback()
        raise

    return NucleoPublicoOut(
        polo_id=polo.id,
        polo_nome=polo.nome,
        usuario_id=usuario.id,
        usuario_nome=usuario.nome,
        email=usuario.email,
        perfil=usuario.perfil,
    )
