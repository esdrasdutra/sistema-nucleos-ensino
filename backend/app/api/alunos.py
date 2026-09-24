from typing import Optional

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import apply_polo_scope, get_current_user_polo_id, get_current_user_role
from app.models import Aluno, Matricula, Turma, Usuario
from app.schemas import AlunoCreate, AlunoOut


def listar_alunos(polo_id: Optional[int] = None, turma_id: Optional[int] = None, tipo_aluno: Optional[str] = None, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    query = apply_polo_scope(db.query(Aluno), Aluno, user_role, polo_id, user_polo_id)
    if turma_id:
        query = query.join(Matricula).filter(Matricula.turma_id == turma_id)
    if tipo_aluno:
        tipo = tipo_aluno.upper()
        if tipo not in {"JOVEM", "ADULTO"}:
            raise HTTPException(status_code=400, detail="Tipo de aluno inválido. Use JOVEM ou ADULTO.")
        query = query.filter(Aluno.tipo_aluno == tipo)
    resultado = []
    for aluno in query.all():
        matricula = db.query(Matricula).filter(Matricula.aluno_id == aluno.id, Matricula.status_matricula == "ATIVO").first()
        turma_nome = matricula.turma.nome_turma if matricula and matricula.turma else "Não Enturmado"
        resultado.append(AlunoOut(id=aluno.id, nome=aluno.nome, email=aluno.email, telefone=aluno.telefone, polo_id=aluno.polo_id, polo_nome=aluno.polo.nome if aluno.polo else None, turma_nome=turma_nome, tipo_aluno=aluno.tipo_aluno or "ADULTO", data_matricula=aluno.data_matricula))
    return resultado


def _validate_scope(user_role: str, user_polo_id: Optional[int], polo_id: int):
    if user_role == "GESTOR_NUCLEO" and (user_polo_id is None or polo_id != user_polo_id):
        raise HTTPException(status_code=403, detail="Você não pode cadastrar alunos de outro núcleo.")


def _validate_type(tipo_aluno: Optional[str]) -> str:
    tipo = (tipo_aluno or "ADULTO").upper()
    if tipo not in {"JOVEM", "ADULTO"}:
        raise HTTPException(status_code=400, detail="Tipo de aluno inválido. Use JOVEM ou ADULTO.")
    return tipo


def criar_aluno(dados: AlunoCreate, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    _validate_scope(user_role, user_polo_id, dados.polo_id)
    tipo = _validate_type(dados.tipo_aluno)
    usuario = Usuario(nome=dados.nome, email=dados.email, perfil="ALUNO")
    db.add(usuario)
    db.commit()
    aluno = Aluno(usuario_id=usuario.id, nome=dados.nome, email=dados.email, telefone=dados.telefone, polo_id=dados.polo_id, tipo_aluno=tipo)
    db.add(aluno)
    db.commit()
    db.refresh(aluno)
    turma_nome = "Não Enturmado"
    if dados.turma_id:
        db.add(Matricula(aluno_id=aluno.id, turma_id=dados.turma_id, status_matricula="ATIVO"))
        db.commit()
        turma = db.query(Turma).get(dados.turma_id)
        if turma:
            turma_nome = turma.nome_turma
    return AlunoOut(id=aluno.id, nome=aluno.nome, email=aluno.email, telefone=aluno.telefone, polo_id=aluno.polo_id, polo_nome=aluno.polo.nome if aluno.polo else None, turma_nome=turma_nome, tipo_aluno=aluno.tipo_aluno, data_matricula=aluno.data_matricula)


def atualizar_aluno(aluno_id: int, dados: AlunoCreate, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    if user_role == "GESTOR_NUCLEO" and (user_polo_id is None or aluno.polo_id != user_polo_id):
        raise HTTPException(status_code=403, detail="Você não pode alterar alunos de outro núcleo.")
    aluno.nome, aluno.email, aluno.telefone, aluno.polo_id, aluno.tipo_aluno = dados.nome, dados.email, dados.telefone, dados.polo_id, _validate_type(dados.tipo_aluno)
    if dados.turma_id:
        matricula = db.query(Matricula).filter(Matricula.aluno_id == aluno.id).first()
        if matricula:
            matricula.turma_id, matricula.status_matricula = dados.turma_id, "ATIVO"
        else:
            db.add(Matricula(aluno_id=aluno.id, turma_id=dados.turma_id, status_matricula="ATIVO"))
    db.commit()
    db.refresh(aluno)
    matricula = db.query(Matricula).filter(Matricula.aluno_id == aluno.id, Matricula.status_matricula == "ATIVO").first()
    return AlunoOut(id=aluno.id, nome=aluno.nome, email=aluno.email, telefone=aluno.telefone, polo_id=aluno.polo_id, polo_nome=aluno.polo.nome if aluno.polo else None, turma_nome=matricula.turma.nome_turma if matricula and matricula.turma else "Não Enturmado", tipo_aluno=aluno.tipo_aluno, data_matricula=aluno.data_matricula)


def deletar_aluno(aluno_id: int, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    if user_role == "GESTOR_NUCLEO" and (user_polo_id is None or aluno.polo_id != user_polo_id):
        raise HTTPException(status_code=403, detail="Você não pode remover alunos de outro núcleo.")
    db.delete(aluno)
    db.commit()
    return {"message": f"Aluno '{aluno.nome}' removido com sucesso!"}
