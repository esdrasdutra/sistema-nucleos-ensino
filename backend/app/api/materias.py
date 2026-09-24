from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Curso, Materia
from app.schemas import CursoOut, MateriaCreate, MateriaOut


def listar_materias(db: Session = Depends(get_db)):
    return db.query(Materia).order_by(Materia.nome.asc()).all()


def criar_materia(dados: MateriaCreate, db: Session = Depends(get_db)):
    if db.query(Materia).filter(Materia.codigo == dados.codigo).first():
        raise HTTPException(status_code=400, detail="Já existe uma matéria com este código")
    materia = Materia(nome=dados.nome, codigo=dados.codigo, descricao=dados.descricao, status=dados.status or "ATIVA")
    db.add(materia)
    db.commit()
    db.refresh(materia)
    return materia


def atualizar_materia(materia_id: int, dados: MateriaCreate, db: Session = Depends(get_db)):
    materia = db.query(Materia).filter(Materia.id == materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Matéria não encontrada")
    materia.nome = dados.nome
    materia.codigo = dados.codigo
    materia.descricao = dados.descricao
    materia.status = dados.status or materia.status
    db.commit()
    db.refresh(materia)
    return materia


def deletar_materia(materia_id: int, db: Session = Depends(get_db)):
    materia = db.query(Materia).filter(Materia.id == materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Matéria não encontrada")
    db.delete(materia)
    db.commit()
    return {"message": f"Matéria '{materia.nome}' excluída com sucesso!"}


def listar_cursos(db: Session = Depends(get_db)):
    return db.query(Curso).all()
