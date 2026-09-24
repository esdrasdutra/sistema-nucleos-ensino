import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Polo, Curso, Materia, Turma, Aluno, Usuario, SessaoChamada, NotaItem, BoletimAluno, HistoricoAluno, DashboardOverview, CriarNucleoPayload, NucleoPublicoResult
} from '../models/interfaces';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api/v1';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  criarNucleoPublico(payload: CriarNucleoPayload): Observable<NucleoPublicoResult> {
    return this.http.post<NucleoPublicoResult>(`${this.apiUrl}/onboarding/nucleo`, payload);
  }

  private getHeaders(): HttpHeaders {
    const session = this.authService.getCurrentSession();
    return new HttpHeaders({
      'X-User-Role': session.perfil || 'ADMIN',
      'X-User-Polo-ID': session.poloId?.toString() || ''
    });
  }

  // Seed / Reset
  triggerSeed(): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, {});
  }

  // Polos CRUD
  getPolos(poloId?: number): Observable<Polo[]> {
    let params = new HttpParams();
    if (poloId) params = params.set('polo_id', poloId.toString());
    return this.http.get<Polo[]>(`${this.apiUrl}/polos`, { params, headers: this.getHeaders() });
  }

  createPolo(polo: Partial<Polo>): Observable<Polo> {
    return this.http.post<Polo>(`${this.apiUrl}/polos`, polo, { headers: this.getHeaders() });
  }

  updatePolo(id: number, polo: Partial<Polo>): Observable<Polo> {
    return this.http.put<Polo>(`${this.apiUrl}/polos/${id}`, polo, { headers: this.getHeaders() });
  }

  deletePolo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/polos/${id}`, { headers: this.getHeaders() });
  }

  // Cursos
  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}/cursos`);
  }

  // Matérias CRUD
  getMaterias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.apiUrl}/materias`, { headers: this.getHeaders() });
  }

  createMateria(materia: Partial<Materia>): Observable<Materia> {
    return this.http.post<Materia>(`${this.apiUrl}/materias`, materia, { headers: this.getHeaders() });
  }

  updateMateria(id: number, materia: Partial<Materia>): Observable<Materia> {
    return this.http.put<Materia>(`${this.apiUrl}/materias/${id}`, materia, { headers: this.getHeaders() });
  }

  deleteMateria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/materias/${id}`, { headers: this.getHeaders() });
  }

  // Turmas CRUD
  getTurmas(poloId?: number): Observable<Turma[]> {
    let params = new HttpParams();
    if (poloId) params = params.set('polo_id', poloId.toString());
    return this.http.get<Turma[]>(`${this.apiUrl}/turmas`, { params, headers: this.getHeaders() });
  }

  createTurma(turma: Partial<Turma>): Observable<Turma> {
    return this.http.post<Turma>(`${this.apiUrl}/turmas`, turma, { headers: this.getHeaders() });
  }

  updateTurma(id: number, turma: Partial<Turma>): Observable<Turma> {
    return this.http.put<Turma>(`${this.apiUrl}/turmas/${id}`, turma, { headers: this.getHeaders() });
  }

  deleteTurma(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/turmas/${id}`, { headers: this.getHeaders() });
  }

  // Usuários / Gestores
  getUsuarios(perfil?: string): Observable<Usuario[]> {
    let params = new HttpParams();
    if (perfil) params = params.set('perfil', perfil);
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { params, headers: this.getHeaders() });
  }

  // Alunos CRUD
  getAlunos(poloId?: number, turmaId?: number, tipoAluno?: 'JOVEM' | 'ADULTO'): Observable<Aluno[]> {
    let params = new HttpParams();
    if (poloId) params = params.set('polo_id', poloId.toString());
    if (turmaId) params = params.set('turma_id', turmaId.toString());
    if (tipoAluno) params = params.set('tipo_aluno', tipoAluno);
    return this.http.get<Aluno[]>(`${this.apiUrl}/alunos`, { params, headers: this.getHeaders() });
  }

  createAluno(aluno: { nome: string; email: string; telefone?: string; polo_id: number; turma_id?: number; tipo_aluno?: 'JOVEM' | 'ADULTO' }): Observable<Aluno> {
    return this.http.post<Aluno>(`${this.apiUrl}/alunos`, aluno, { headers: this.getHeaders() });
  }

  updateAluno(id: number, aluno: Partial<Aluno>): Observable<Aluno> {
    return this.http.put<Aluno>(`${this.apiUrl}/alunos/${id}`, aluno, { headers: this.getHeaders() });
  }

  deleteAluno(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/alunos/${id}`, { headers: this.getHeaders() });
  }

  // Chamada Digital
  getSessaoChamada(turmaId: number, dataAula: string): Observable<SessaoChamada> {
    const params = new HttpParams()
      .set('turma_id', turmaId.toString())
      .set('data_aula', dataAula);
    return this.http.get<SessaoChamada>(`${this.apiUrl}/frequencia/sessao`, { params, headers: this.getHeaders() });
  }

  salvarChamada(payload: { turma_id: number; data_aula: string; conteudo?: string; presencas: { aluno_id: number; presente: boolean }[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/frequencia/registrar`, payload, { headers: this.getHeaders() });
  }

  deleteSessaoChamada(sessaoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/frequencia/sessao/${sessaoId}`, { headers: this.getHeaders() });
  }

  // Avaliações / Notas
  getNotasTurmaModulo(turmaId: number, moduloId: number): Observable<NotaItem[]> {
    const params = new HttpParams()
      .set('turma_id', turmaId.toString())
      .set('modulo_id', moduloId.toString());
    return this.http.get<NotaItem[]>(`${this.apiUrl}/avaliacoes`, { params, headers: this.getHeaders() });
  }

  salvarNotas(payload: { turma_id: number; modulo_id: number; notas: { aluno_id: number; nota: number; observacoes?: string }[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/avaliacoes/registrar`, payload, { headers: this.getHeaders() });
  }

  deleteNota(notaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/avaliacoes/${notaId}`, { headers: this.getHeaders() });
  }

  // Portal Aluno
  getBoletimAluno(alunoId: number): Observable<BoletimAluno> {
    return this.http.get<BoletimAluno>(`${this.apiUrl}/portal-aluno/${alunoId}`);
  }

  getHistoricoAluno(alunoId: number): Observable<HistoricoAluno> {
    return this.http.get<HistoricoAluno>(`${this.apiUrl}/historico-aluno/${alunoId}`, { headers: this.getHeaders() });
  }

  // Dashboard Overview
  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.apiUrl}/analytics/overview`, { headers: this.getHeaders() });
  }
}
