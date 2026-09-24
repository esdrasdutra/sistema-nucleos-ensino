from typing import Optional

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_polo_id, get_current_user_role
from app.models import Aluno, Matricula, Modulo, NotaModulo, Presenca, SessaoAula
from app.schemas import BoletimAlunoOut, HistoricoAlunoItemOut, HistoricoAlunoOut, NotaModuloAlunoOut


def _context(aluno_id: int, user_role: str, user_polo_id: Optional[int], db: Session):
    aluno = db.get(Aluno, aluno_id)
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    if user_role == "GESTOR_NUCLEO" and (user_polo_id is None or aluno.polo_id != user_polo_id):
        raise HTTPException(status_code=403, detail="Você não pode visualizar alunos fora do seu núcleo.")
    matricula = db.query(Matricula).filter(Matricula.aluno_id == aluno_id, Matricula.status_matricula == "ATIVO").first()
    if not matricula:
        raise HTTPException(status_code=404, detail="Aluno não está enturmado em nenhuma turma ativa")
    return aluno, matricula.turma, matricula.turma.curso


def _academic(aluno_id: int, turma_id: int, curso_id: int, db: Session):
    modulos = db.query(Modulo).filter(Modulo.curso_id == curso_id).order_by(Modulo.ordem).all()
    notas = []
    total = 0.0
    quantidade = 0
    for modulo in modulos:
        nota = db.query(NotaModulo).filter(NotaModulo.aluno_id == aluno_id, NotaModulo.turma_id == turma_id, NotaModulo.modulo_id == modulo.id).first()
        valor = nota.nota if nota else 0.0
        if nota:
            total += valor
            quantidade += 1
        situacao = "APROVADO" if valor >= 7 else "RECUPERACAO" if valor >= 5 else "REPROVADO" if nota else "PENDENTE"
        notas.append((modulo, valor, situacao))
    sessoes = db.query(SessaoAula).filter(SessaoAula.turma_id == turma_id).all()
    total_presencas = db.query(Presenca).filter(Presenca.sessao_id.in_([s.id for s in sessoes]), Presenca.aluno_id == aluno_id, Presenca.presente.is_(True)).count() if sessoes else 0
    frequencia = round(total_presencas / len(sessoes) * 100, 1) if sessoes else 100.0
    return notas, round(total / quantidade, 2) if quantidade else 0.0, total_presencas, len(sessoes), frequencia


def obter_boletim_aluno(aluno_id: int, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    aluno, turma, curso = _context(aluno_id, user_role, user_polo_id, db)
    notas, media, presencas, aulas, frequencia = _academic(aluno_id, turma.id, curso.id, db)
    status = "APROVADO (BOM DESEMPENHO)" if media >= 7 and frequencia >= 75 else "EM RECUPERAÇÃO" if media >= 5 else "EM ACOMPANHAMENTO"
    return BoletimAlunoOut(aluno_id=aluno.id, aluno_nome=aluno.nome, polo_nome=aluno.polo.nome if aluno.polo else "Polo Geral", turma_nome=turma.nome_turma, curso_nome=curso.nome, media_geral=media, frequencia_percentual=frequencia, total_presencas=presencas, total_aulas=aulas, status_geral=status, notas_modulos=[NotaModuloAlunoOut(modulo_id=m.id, modulo_nome=m.nome_modulo, nota=v, situacao=s) for m, v, s in notas])


def obter_historico_aluno(aluno_id: int, user_role: str = Depends(get_current_user_role), user_polo_id: Optional[int] = Depends(get_current_user_polo_id), db: Session = Depends(get_db)):
    aluno, turma, curso = _context(aluno_id, user_role, user_polo_id, db)
    notas, media, presencas, aulas, frequencia = _academic(aluno_id, turma.id, curso.id, db)
    status = "APROVADO (BOM DESEMPENHO)" if media >= 7 and frequencia >= 75 else "EM RECUPERAÇÃO" if media >= 5 else "EM ACOMPANHAMENTO"
    return HistoricoAlunoOut(aluno_id=aluno.id, aluno_nome=aluno.nome, polo_nome=aluno.polo.nome if aluno.polo else "Polo Geral", turma_nome=turma.nome_turma, curso_nome=curso.nome, media_geral=media, frequencia_percentual=frequencia, status_geral=status, historico=[HistoricoAlunoItemOut(modulo_id=m.id, modulo_nome=m.nome_modulo, nota=v, situacao=s, presenca_total=presencas, presenca_percentual=frequencia) for m, v, s in notas])
