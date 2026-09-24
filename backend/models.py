from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    senha_hash = Column(String(200), nullable=False, default="pbkdf2:sha256...")
    perfil = Column(String(30), nullable=False, default="ALUNO")  # ADMIN, GESTOR_NUCLEO, ALUNO
    ativo = Column(Boolean, default=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    polos_gerenciados = relationship("Polo", back_populates="responsavel", foreign_keys="Polo.responsavel_id")
    aluno_perfil = relationship("Aluno", back_populates="usuario", uselist=False)

class Polo(Base):
    __tablename__ = "polos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    codigo = Column(String(20), unique=True, nullable=False)
    cidade = Column(String(100), nullable=False)
    estado = Column(String(2), nullable=False)
    responsavel_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    status = Column(String(20), default="ATIVO")
    data_criacao = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    responsavel = relationship("Usuario", back_populates="polos_gerenciados", foreign_keys=[responsavel_id])
    turmas = relationship("Turma", back_populates="polo", cascade="all, delete-orphan")
    alunos = relationship("Aluno", back_populates="polo")

class Curso(Base):
    __tablename__ = "cursos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    descricao = Column(Text, nullable=True)
    carga_horaria = Column(Integer, default=120)

    # Relacionamentos
    modulos = relationship("Modulo", back_populates="curso", cascade="all, delete-orphan", order_by="Modulo.ordem")
    turmas = relationship("Turma", back_populates="curso")

class Materia(Base):
    __tablename__ = "materias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False, unique=True)
    codigo = Column(String(30), nullable=False, unique=True)
    descricao = Column(Text, nullable=True)
    status = Column(String(20), default="ATIVA")
    data_criacao = Column(DateTime, default=datetime.utcnow)

class Modulo(Base):
    __tablename__ = "modulos"

    id = Column(Integer, primary_key=True, index=True)
    curso_id = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    nome_modulo = Column(String(150), nullable=False)
    ordem = Column(Integer, default=1)
    peso_nota = Column(Float, default=1.0)

    # Relacionamentos
    curso = relationship("Curso", back_populates="modulos")
    notas = relationship("NotaModulo", back_populates="modulo")

class Turma(Base):
    __tablename__ = "turmas"

    id = Column(Integer, primary_key=True, index=True)
    polo_id = Column(Integer, ForeignKey("polos.id"), nullable=False)
    curso_id = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    nome_turma = Column(String(100), nullable=False)
    professor = Column(String(120), nullable=False)
    dia_semana = Column(String(30), nullable=False, default="Sábado")
    horario = Column(String(30), nullable=False, default="19:00 - 21:30")
    status = Column(String(20), default="EM_ANDAMENTO")

    # Relacionamentos
    polo = relationship("Polo", back_populates="turmas")
    curso = relationship("Curso", back_populates="turmas")
    matriculas = relationship("Matricula", back_populates="turma", cascade="all, delete-orphan")
    sessoes_aula = relationship("SessaoAula", back_populates="turma", cascade="all, delete-orphan")
    notas = relationship("NotaModulo", back_populates="turma")

class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(120), nullable=False)
    telefone = Column(String(30), nullable=True)
    polo_id = Column(Integer, ForeignKey("polos.id"), nullable=False)
    tipo_aluno = Column(String(20), nullable=False, default="ADULTO")
    data_matricula = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacionamentos
    usuario = relationship("Usuario", back_populates="aluno_perfil")
    polo = relationship("Polo", back_populates="alunos")
    matriculas = relationship("Matricula", back_populates="aluno", cascade="all, delete-orphan")
    presencas = relationship("Presenca", back_populates="aluno")
    notas = relationship("NotaModulo", back_populates="aluno")

class Matricula(Base):
    __tablename__ = "matriculas"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    turma_id = Column(Integer, ForeignKey("turmas.id"), nullable=False)
    status_matricula = Column(String(20), default="ATIVO")  # ATIVO, CONCLUIDO, TRANCADO
    data_enturmacao = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacionamentos
    aluno = relationship("Aluno", back_populates="matriculas")
    turma = relationship("Turma", back_populates="matriculas")

class SessaoAula(Base):
    __tablename__ = "sessoes_aula"

    id = Column(Integer, primary_key=True, index=True)
    turma_id = Column(Integer, ForeignKey("turmas.id"), nullable=False)
    data_aula = Column(String(20), nullable=False)  # YYYY-MM-DD
    conteudo = Column(Text, nullable=True)
    data_registro = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacionamentos
    turma = relationship("Turma", back_populates="sessoes_aula")
    presencas = relationship("Presenca", back_populates="sessao", cascade="all, delete-orphan")

class Presenca(Base):
    __tablename__ = "presencas"

    id = Column(Integer, primary_key=True, index=True)
    sessao_id = Column(Integer, ForeignKey("sessoes_aula.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    presente = Column(Boolean, default=True)

    # Relacionamentos
    sessao = relationship("SessaoAula", back_populates="presencas")
    aluno = relationship("Aluno", back_populates="presencas")

class NotaModulo(Base):
    __tablename__ = "notas_modulo"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    turma_id = Column(Integer, ForeignKey("turmas.id"), nullable=False)
    modulo_id = Column(Integer, ForeignKey("modulos.id"), nullable=False)
    nota = Column(Float, nullable=False, default=0.0)
    observacoes = Column(Text, nullable=True)
    data_lancamento = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacionamentos
    aluno = relationship("Aluno", back_populates="notas")
    turma = relationship("Turma", back_populates="notas")
    modulo = relationship("Modulo", back_populates="notas")
