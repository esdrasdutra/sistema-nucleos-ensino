from typing import Optional

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import ensure_turma_scope, get_current_user_polo_id, get_current_user_role
from app.models import Matricula, Modulo, NotaModulo, Presenca, SessaoAula
from app.schemas import LancarNotaRequest, NotaOut, RegistrarChamadaRequest


def obter_sessao_chamada(turma_id: int, data_aula: str, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    ensure_turma_scope(turma_id, user_role, user_polo_id, db)
    sessao = db.query(SessaoAula).filter(SessaoAula.turma_id == turma_id, SessaoAula.data_aula == data_aula).first()
    matriculas = db.query(Matricula).filter(Matricula.turma_id == turma_id, Matricula.status_matricula == "ATIVO").all()
    presencas = {item.aluno_id: item.presente for item in sessao.presencas} if sessao else {}
    return {"sessao_id": sessao.id if sessao else None, "turma_id": turma_id, "data_aula": data_aula, "conteudo": sessao.conteudo if sessao else "", "alunos": [{"aluno_id": m.aluno.id, "nome": m.aluno.nome, "email": m.aluno.email, "presente": presencas.get(m.aluno.id, True)} for m in matriculas]}


def registrar_chamada(dados: RegistrarChamadaRequest, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    ensure_turma_scope(dados.turma_id, user_role, user_polo_id, db)
    sessao = db.query(SessaoAula).filter(SessaoAula.turma_id == dados.turma_id, SessaoAula.data_aula == dados.data_aula).first()
    if not sessao:
        sessao = SessaoAula(turma_id=dados.turma_id, data_aula=dados.data_aula, conteudo=dados.conteudo or f"Aula do dia {dados.data_aula}")
        db.add(sessao)
        db.commit()
        db.refresh(sessao)
    elif dados.conteudo:
        sessao.conteudo = dados.conteudo
    db.query(Presenca).filter(Presenca.sessao_id == sessao.id).delete()
    db.add_all([Presenca(sessao_id=sessao.id, aluno_id=item.aluno_id, presente=item.presente) for item in dados.presencas])
    db.commit()
    return {"message": "Chamada registrada com sucesso!", "sessao_id": sessao.id}


def obter_notas_turma(turma_id: int, modulo_id: int, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    ensure_turma_scope(turma_id, user_role, user_polo_id, db)
    modulo = db.query(Modulo).get(modulo_id)
    if not modulo:
        raise HTTPException(status_code=404, detail="Módulo não encontrado")
    resultado = []
    for matricula in db.query(Matricula).filter(Matricula.turma_id == turma_id, Matricula.status_matricula == "ATIVO").all():
        nota = db.query(NotaModulo).filter(NotaModulo.aluno_id == matricula.aluno_id, NotaModulo.turma_id == turma_id, NotaModulo.modulo_id == modulo_id).first()
        valor = nota.nota if nota else 0.0
        situacao = "APROVADO" if valor >= 7 else "RECUPERACAO" if valor >= 5 else "REPROVADO"
        resultado.append(NotaOut(id=nota.id if nota else 0, aluno_id=matricula.aluno_id, aluno_nome=matricula.aluno.nome, modulo_id=modulo_id, modulo_nome=modulo.nome_modulo, nota=valor, situacao=situacao, observacoes=nota.observacoes if nota else ""))
    return resultado


def registrar_notas(dados: LancarNotaRequest, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    ensure_turma_scope(dados.turma_id, user_role, user_polo_id, db)
    for item in dados.notas:
        nota = db.query(NotaModulo).filter(NotaModulo.aluno_id == item.aluno_id, NotaModulo.turma_id == dados.turma_id, NotaModulo.modulo_id == dados.modulo_id).first()
        if nota:
            nota.nota = item.nota
            if item.observacoes:
                nota.observacoes = item.observacoes
        else:
            db.add(NotaModulo(aluno_id=item.aluno_id, turma_id=dados.turma_id, modulo_id=dados.modulo_id, nota=item.nota, observacoes=item.observacoes or ""))
    db.commit()
    return {"message": "Notas registradas com sucesso!"}
