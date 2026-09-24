from typing import Optional

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import apply_polo_scope, get_current_user_polo_id, get_current_user_role
from app.models import Aluno, Polo, Turma
from app.schemas import PoloCreate, PoloOut


def listar_polos(
    polo_id: Optional[int] = None,
    user_role: str = Depends(get_current_user_role),
    user_polo_id: Optional[int] = Depends(get_current_user_polo_id),
    db: Session = Depends(get_db),
):
    polos = apply_polo_scope(db.query(Polo), Polo, user_role, polo_id, user_polo_id).all()
    resultado = []
    for polo in polos:
        resp_nome = polo.responsavel.nome if polo.responsavel else "Sem Responsável"
        total_alunos = db.query(Aluno).filter(Aluno.polo_id == polo.id).count()
        total_turmas = db.query(Turma).filter(Turma.polo_id == polo.id).count()
        resultado.append(PoloOut(
            id=polo.id, nome=polo.nome, codigo=polo.codigo, cidade=polo.cidade, estado=polo.estado,
            responsavel_id=polo.responsavel_id, responsavel_nome=resp_nome,
            status=polo.status, total_alunos=total_alunos, total_turmas=total_turmas,
        ))
    return resultado


def criar_polo(dados: PoloCreate, db: Session = Depends(get_db)):
    if not dados.aceitou_termos:
        raise HTTPException(status_code=400, detail="É necessário aceitar os termos para criar um núcleo.")
    if not dados.responsavel_id:
        raise HTTPException(status_code=400, detail="Informe o gestor responsável pelo núcleo.")

    polo = Polo(
        nome=dados.nome, codigo=dados.codigo, cidade=dados.cidade,
        estado=dados.estado, responsavel_id=dados.responsavel_id,
        status=dados.status or "ATIVO",
    )
    db.add(polo)
    db.commit()
    db.refresh(polo)
    resp_nome = polo.responsavel.nome if polo.responsavel else "Sem Responsável"
    return PoloOut(
        id=polo.id, nome=polo.nome, codigo=polo.codigo, cidade=polo.cidade,
        estado=polo.estado, responsavel_id=polo.responsavel_id,
        responsavel_nome=resp_nome, status=polo.status, total_alunos=0, total_turmas=0,
    )


def atualizar_polo(polo_id: int, dados: PoloCreate, db: Session = Depends(get_db)):
    polo = db.query(Polo).filter(Polo.id == polo_id).first()
    if not polo:
        raise HTTPException(status_code=404, detail="Polo não encontrado")

    polo.nome = dados.nome
    polo.codigo = dados.codigo
    polo.cidade = dados.cidade
    polo.estado = dados.estado
    polo.responsavel_id = dados.responsavel_id
    if dados.status:
        polo.status = dados.status

    db.commit()
    db.refresh(polo)
    resp_nome = polo.responsavel.nome if polo.responsavel else "Sem Responsável"
    total_alunos = db.query(Aluno).filter(Aluno.polo_id == polo.id).count()
    total_turmas = db.query(Turma).filter(Turma.polo_id == polo.id).count()
    return PoloOut(
        id=polo.id, nome=polo.nome, codigo=polo.codigo, cidade=polo.cidade,
        estado=polo.estado, responsavel_id=polo.responsavel_id,
        responsavel_nome=resp_nome, status=polo.status,
        total_alunos=total_alunos, total_turmas=total_turmas,
    )


def deletar_polo(polo_id: int, db: Session = Depends(get_db)):
    polo = db.query(Polo).filter(Polo.id == polo_id).first()
    if not polo:
        raise HTTPException(status_code=404, detail="Polo não encontrado")
    db.delete(polo)
    db.commit()
    return {"message": f"Polo '{polo.nome}' excluído com sucesso!"}
