from typing import Optional

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    apply_polo_scope,
    ensure_user_can_manage_polo,
    get_current_user_polo_id,
    get_current_user_role,
)
from app.models import Matricula, Turma
from app.schemas import TurmaCreate, TurmaOut


def listar_turmas(polo_id: Optional[int] = None, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    turmas = apply_polo_scope(db.query(Turma), Turma, user_role, polo_id, user_polo_id).all()
    resultado = []
    for turma in turmas:
        total = db.query(Matricula).filter(Matricula.turma_id == turma.id, Matricula.status_matricula == "ATIVO").count()
        resultado.append(TurmaOut(
            id=turma.id, polo_id=turma.polo_id, curso_id=turma.curso_id,
            nome_turma=turma.nome_turma, professor=turma.professor,
            dia_semana=turma.dia_semana, horario=turma.horario, status=turma.status,
            polo_nome=turma.polo.nome if turma.polo else None,
            curso_nome=turma.curso.nome if turma.curso else None, total_alunos=total,
        ))
    return resultado


def criar_turma(dados: TurmaCreate, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    ensure_user_can_manage_polo(user_role, user_polo_id, dados.polo_id)
    turma = Turma(
        polo_id=dados.polo_id, curso_id=dados.curso_id, nome_turma=dados.nome_turma,
        professor=dados.professor, dia_semana=dados.dia_semana, horario=dados.horario,
    )
    db.add(turma)
    db.commit()
    db.refresh(turma)
    return TurmaOut(
        id=turma.id, polo_id=turma.polo_id, curso_id=turma.curso_id,
        nome_turma=turma.nome_turma, professor=turma.professor,
        dia_semana=turma.dia_semana, horario=turma.horario, status=turma.status,
        polo_nome=turma.polo.nome if turma.polo else None,
        curso_nome=turma.curso.nome if turma.curso else None, total_alunos=0,
    )


def atualizar_turma(turma_id: int, dados: TurmaCreate, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    target_polo_id = dados.polo_id if dados.polo_id is not None else turma.polo_id
    ensure_user_can_manage_polo(user_role, user_polo_id, target_polo_id)
    turma.polo_id = dados.polo_id
    turma.curso_id = dados.curso_id
    turma.nome_turma = dados.nome_turma
    turma.professor = dados.professor
    turma.dia_semana = dados.dia_semana
    turma.horario = dados.horario
    db.commit()
    db.refresh(turma)
    total = db.query(Matricula).filter(Matricula.turma_id == turma.id, Matricula.status_matricula == "ATIVO").count()
    return TurmaOut(
        id=turma.id, polo_id=turma.polo_id, curso_id=turma.curso_id,
        nome_turma=turma.nome_turma, professor=turma.professor,
        dia_semana=turma.dia_semana, horario=turma.horario, status=turma.status,
        polo_nome=turma.polo.nome if turma.polo else None,
        curso_nome=turma.curso.nome if turma.curso else None, total_alunos=total,
    )


def deletar_turma(turma_id: int, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    if user_role == "GESTOR_NUCLEO" and (user_polo_id is None or turma.polo_id != user_polo_id):
        raise HTTPException(status_code=403, detail="Você não pode excluir turmas de um núcleo que não pertence ao seu perfil")
    db.delete(turma)
    db.commit()
    return {"message": f"Turma '{turma.nome_turma}' excluída com sucesso!"}
