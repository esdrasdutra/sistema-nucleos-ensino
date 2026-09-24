from typing import List, Optional

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from app.models import Aluno, Polo, Turma

security = HTTPBearer(auto_error=False)


def get_current_user_role(x_user_role: Optional[str] = Header("ADMIN")) -> str:
    role = (x_user_role or "ADMIN").upper()
    return role


def get_current_user_polo_id(x_user_polo_id: Optional[str] = Header(None)) -> Optional[int]:
    try:
        return int(x_user_polo_id) if x_user_polo_id else None
    except ValueError:
        return None


def apply_polo_scope(query, model, user_role: str, requested_polo_id: Optional[int], user_polo_id: Optional[int]):
    if user_role == "GESTOR_NUCLEO":
        if not user_polo_id:
            raise HTTPException(status_code=403, detail="Gestor sem núcleo associado")
        return query.filter(model.polo_id == user_polo_id)
    if requested_polo_id:
        return query.filter(model.polo_id == requested_polo_id)
    return query


def ensure_turma_scope(turma_id: int, user_role: str, user_polo_id: Optional[int], db: Session) -> Turma:
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    if user_role == "GESTOR_NUCLEO" and turma.polo_id != user_polo_id:
        raise HTTPException(status_code=403, detail="A turma não pertence ao núcleo do gestor")
    return turma


def ensure_user_can_manage_polo(user_role: str, user_polo_id: Optional[int], polo_id: Optional[int], db: Session = None):
    if user_role != "GESTOR_NUCLEO":
        return
    if user_polo_id is None:
        raise HTTPException(status_code=403, detail="Gestor sem núcleo associado")
    if polo_id is None or polo_id != user_polo_id:
        raise HTTPException(status_code=403, detail="Você não pode manipular turmas de um núcleo que não pertence ao seu perfil")


def require_roles(allowed_roles: List[str]):
    def role_checker(user_role: str = Depends(get_current_user_role)):
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado: O perfil '{user_role}' não tem permissão para esta ação. Requer {allowed_roles}."
            )
        return user_role

    return role_checker
