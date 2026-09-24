from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# Base Schemas
class UsuarioBase(BaseModel):
    nome: str
    email: str
    perfil: str  # ADMIN, GESTOR_NUCLEO, ALUNO

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioOut(UsuarioBase):
    id: int
    ativo: bool
    data_criacao: datetime

    class Config:
        from_attributes = True

# Polo Schemas
class PoloBase(BaseModel):
    nome: str
    codigo: str
    cidade: str
    estado: str
    responsavel_id: Optional[int] = None
    status: Optional[str] = "ATIVO"

class PoloCreate(PoloBase):
    aceitou_termos: bool = False

class PoloOut(PoloBase):
    id: int
    responsavel_nome: Optional[str] = None
    total_alunos: Optional[int] = 0
    total_turmas: Optional[int] = 0

    class Config:
        from_attributes = True

# Materia Schemas
class MateriaBase(BaseModel):
    nome: str
    codigo: str
    descricao: Optional[str] = None
    status: Optional[str] = "ATIVA"

class MateriaCreate(MateriaBase):
    pass

class MateriaOut(MateriaBase):
    id: int
    data_criacao: datetime

    class Config:
        from_attributes = True

# Modulo Schemas
class ModuloBase(BaseModel):
    nome_modulo: str
    ordem: int
    peso_nota: float = 1.0

class ModuloOut(ModuloBase):
    id: int
    curso_id: int

    class Config:
        from_attributes = True

# Curso Schemas
class CursoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    carga_horaria: int = 120

class CursoOut(CursoBase):
    id: int
    modulos: List[ModuloOut] = []

    class Config:
        from_attributes = True

# Turma Schemas
class TurmaBase(BaseModel):
    polo_id: int
    curso_id: int
    nome_turma: str
    professor: str
    dia_semana: str
    horario: str

class TurmaCreate(TurmaBase):
    pass

class TurmaOut(TurmaBase):
    id: int
    polo_nome: Optional[str] = None
    curso_nome: Optional[str] = None
    status: str
    total_alunos: Optional[int] = 0

    class Config:
        from_attributes = True

# Aluno Schemas
class AlunoBase(BaseModel):
    nome: str
    email: str
    telefone: Optional[str] = None
    polo_id: int
    tipo_aluno: Optional[str] = "ADULTO"

class AlunoCreate(AlunoBase):
    turma_id: Optional[int] = None

class AlunoOut(AlunoBase):
    id: int
    polo_nome: Optional[str] = None
    turma_nome: Optional[str] = None
    data_matricula: datetime

    class Config:
        from_attributes = True

# Chamada / Presenca Schemas
class ItemPresenca(BaseModel):
    aluno_id: int
    presente: bool

class RegistrarChamadaRequest(BaseModel):
    turma_id: int
    data_aula: str  # YYYY-MM-DD
    conteudo: Optional[str] = None
    presencas: List[ItemPresenca]

class PresencaOut(BaseModel):
    id: int
    aluno_id: int
    aluno_nome: str
    presente: bool

class SessaoAulaOut(BaseModel):
    id: int
    turma_id: int
    data_aula: str
    conteudo: Optional[str]
    presencas: List[PresencaOut] = []

# Nota Schemas
class LancarNotaItem(BaseModel):
    aluno_id: int
    nota: float
    observacoes: Optional[str] = None

class LancarNotaRequest(BaseModel):
    turma_id: int
    modulo_id: int
    notas: List[LancarNotaItem]

class NotaOut(BaseModel):
    id: int
    aluno_id: int
    aluno_nome: str
    modulo_id: int
    modulo_nome: str
    nota: float
    situacao: str  # APROVADO, RECUPERACAO, REPROVADO
    observacoes: Optional[str]

# Portal Aluno Schemas
class NotaModuloAlunoOut(BaseModel):
    modulo_id: int
    modulo_nome: str
    nota: float
    situacao: str

class BoletimAlunoOut(BaseModel):
    aluno_id: int
    aluno_nome: str
    polo_nome: str
    turma_nome: str
    curso_nome: str
    media_geral: float
    frequencia_percentual: float
    total_presencas: int
    total_aulas: int
    status_geral: str
    notas_modulos: List[NotaModuloAlunoOut] = []

class HistoricoAlunoItemOut(BaseModel):
    modulo_id: int
    modulo_nome: str
    nota: float
    situacao: str
    presenca_total: int
    presenca_percentual: float

class HistoricoAlunoOut(BaseModel):
    aluno_id: int
    aluno_nome: str
    polo_nome: str
    turma_nome: str
    curso_nome: str
    media_geral: float
    frequencia_percentual: float
    status_geral: str
    historico: List[HistoricoAlunoItemOut] = []

# Analytics / Overview
class DashboardOverviewOut(BaseModel):
    total_polos: int
    total_turmas: int
    total_alunos: int
    frequencia_media_global: float
    media_notas_global: float
    distribuicao_alunos_polo: List[dict]
    ranking_frequencia_polo: List[dict]
