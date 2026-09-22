export type PerfilUsuario = 'ADMIN' | 'GESTOR_NUCLEO' | 'ALUNO';

export interface Usuario {
  id: number;
  nome: str;
  email: str;
  perfil: PerfilUsuario;
  ativo: boolean;
  data_criacao: string;
}

export interface Polo {
  id: number;
  nome: string;
  codigo: string;
  cidade: string;
  estado: string;
  responsavel_id?: number;
  responsavel_nome?: string;
  status: string;
  total_alunos?: number;
  total_turmas?: number;
}

export interface Modulo {
  id: number;
  curso_id: number;
  nome_modulo: string;
  ordem: number;
  peso_nota: number;
}

export interface Curso {
  id: number;
  nome: string;
  descricao?: string;
  carga_horaria: number;
  modulos?: Modulo[];
}

export interface Turma {
  id: number;
  polo_id: number;
  curso_id: number;
  nome_turma: string;
  professor: string;
  dia_semana: string;
  horario: string;
  status: string;
  polo_nome?: string;
  curso_nome?: string;
  total_alunos?: number;
}

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  polo_id: number;
  polo_nome?: string;
  turma_nome?: string;
  data_matricula: string;
}

export interface ItemAlunoChamada {
  aluno_id: number;
  nome: string;
  email: string;
  presente: boolean;
}

export interface SessaoChamada {
  sessao_id?: number;
  turma_id: number;
  data_aula: string;
  conteudo?: string;
  alunos: ItemAlunoChamada[];
}

export interface NotaItem {
  id: number;
  aluno_id: number;
  aluno_nome: string;
  modulo_id: number;
  modulo_nome: string;
  nota: number;
  situacao: 'APROVADO' | 'RECUPERACAO' | 'REPROVADO';
  observacoes?: string;
}

export interface NotaModuloAluno {
  modulo_id: number;
  modulo_nome: string;
  nota: number;
  situacao: string;
}

export interface BoletimAluno {
  aluno_id: number;
  aluno_nome: string;
  polo_nome: string;
  turma_nome: string;
  curso_nome: string;
  media_geral: number;
  frequencia_percentual: number;
  total_presencas: number;
  total_aulas: number;
  status_geral: string;
  notas_modulos: NotaModuloAluno[];
}

export interface DashboardOverview {
  total_polos: number;
  total_turmas: number;
  total_alunos: number;
  frequencia_media_global: number;
  media_notas_global: number;
  distribuicao_alunos_polo: { polo_nome: string; total_alunos: number }[];
  ranking_frequencia_polo: { polo_nome: string; cidade: string; taxa_presenca: number }[];
}
