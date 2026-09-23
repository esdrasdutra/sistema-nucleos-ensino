import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Polo, Curso, Turma, Aluno, SessaoChamada, NotaItem, BoletimAluno, DashboardOverview
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

  // Alunos CRUD
  getAlunos(poloId?: number, turmaId?: number): Observable<Aluno[]> {
    let params = new HttpParams();
    if (poloId) params = params.set('polo_id', poloId.toString());
    if (turmaId) params = params.set('turma_id', turmaId.toString());
    return this.http.get<Aluno[]>(`${this.apiUrl}/alunos`, { params, headers: this.getHeaders() });
  }

  createAluno(aluno: { nome: string; email: string; telefone?: string; polo_id: number; turma_id?: number }): Observable<Aluno> {
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

  // Dashboard Overview
  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.apiUrl}/analytics/overview`, { headers: this.getHeaders() });
  }
}
