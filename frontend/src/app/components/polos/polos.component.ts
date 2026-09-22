import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Polo, Turma, Usuario } from '../../models/interfaces';

@Component({
  selector: 'app-polos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="polos-page container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <span class="sub-headline"><i class="fa-solid fa-building-columns"></i> REDE DESCENTRALIZADA</span>
          <h1 class="font-display">GESTÃO DE POLOS E RESPONSÁVEIS</h1>
        </div>
        <button class="btn btn-primary" (click)="openModalCriar()" *ngIf="isUserAdmin()">
          <i class="fa-solid fa-plus"></i> Novo Polo de Ensino
        </button>
      </div>

      <!-- Grid de Polos -->
      <div class="polos-grid">
        <div class="card polo-card" *ngFor="let polo of polos">
          <div class="polo-card-header">
            <span class="polo-code">{{ polo.codigo }}</span>
            <span class="badge badge-sucesso">{{ polo.status }}</span>
          </div>

          <h2 class="polo-title font-display">{{ polo.nome }}</h2>
          <p class="polo-location"><i class="fa-solid fa-location-dot"></i> {{ polo.cidade }} - {{ polo.estado }}</p>

          <div class="responsavel-box">
            <i class="fa-solid fa-user-shield responsavel-icon"></i>
            <div>
              <span class="responsavel-label">Responsável do Núcleo</span>
              <span class="responsavel-nome">{{ polo.responsavel_nome || 'Sem Responsável' }}</span>
            </div>
          </div>

          <div class="polo-stats">
            <div class="stat-item">
              <span class="stat-num">{{ polo.total_alunos }}</span>
              <span class="stat-desc">Alunos</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ polo.total_turmas }}</span>
              <span class="stat-desc">Turmas</span>
            </div>
          </div>

          <!-- Ações CRUD (Update / Delete) -->
          <div class="card-crud-actions" *ngIf="isUserAdmin()">
            <button class="btn btn-secondary btn-sm" (click)="editarPolo(polo)">
              <i class="fa-solid fa-pen-to-square"></i> Editar
            </button>
            <button class="btn btn-secondary btn-sm btn-delete" (click)="excluirPolo(polo)">
              <i class="fa-solid fa-trash"></i> Excluir
            </button>
          </div>
        </div>
      </div>

      <!-- Tabela de Turmas da Rede com Ações CRUD -->
      <div class="card mt-4">
        <div class="card-header-bordered">
          <h3><i class="fa-solid fa-book-bookmark"></i> Turmas Ativas na Rede Teológica</h3>
          <span class="badge badge-olive">Horários e Professores</span>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Nome da Turma</th>
                <th>Polo / Núcleo</th>
                <th>Professor / Preletor</th>
                <th>Dia & Horário</th>
                <th>Alunos</th>
                <th>Status</th>
                <th *ngIf="isUserAdmin() || isUserGestor()">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let turma of turmas">
                <td><strong>{{ turma.nome_turma }}</strong></td>
                <td>{{ turma.polo_nome }}</td>
                <td>{{ turma.professor }}</td>
                <td><i class="fa-regular fa-clock"></i> {{ turma.dia_semana }} ({{ turma.horario }})</td>
                <td><span class="badge badge-olive">{{ turma.total_alunos }} Alunos</span></td>
                <td><span class="badge badge-sucesso">{{ turma.status }}</span></td>
                <td *ngIf="isUserAdmin() || isUserGestor()">
                  <button class="btn btn-secondary btn-sm" (click)="excluirTurma(turma)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Criar / Editar Polo -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-card">
          <div class="modal-header">
            <h2 class="font-display">{{ editandoId ? 'Editar Polo de Ensino' : 'Cadastrar Novo Polo' }}</h2>
            <button class="close-btn" (click)="showModal = false">&times;</button>
          </div>

          <form (ngSubmit)="salvarPolo()">
            <div class="form-group">
              <label class="form-label">Nome do Polo / Núcleo</label>
              <input type="text" class="form-control" [(ngModel)]="novoPolo.nome" name="nome" placeholder="Ex: Polo Salvador - Centro" required>
            </div>

            <div class="form-group">
              <label class="form-label">Código Único (Identificador)</label>
              <input type="text" class="form-control" [(ngModel)]="novoPolo.codigo" name="codigo" placeholder="Ex: POLO-SSA-05" required>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Cidade</label>
                <input type="text" class="form-control" [(ngModel)]="novoPolo.cidade" name="cidade" placeholder="Salvador" required>
              </div>
              <div class="form-group">
                <label class="form-label">Estado (UF)</label>
                <input type="text" class="form-control" [(ngModel)]="novoPolo.estado" name="estado" placeholder="BA" required maxlength="2">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Responsável do Núcleo (Gestor)</label>
              <select class="form-select" [(ngModel)]="novoPolo.responsavel_id" name="responsavel_id">
                <option [ngValue]="null">Selecione o Responsável...</option>
                <option *ngFor="let gestor of gestores" [value]="gestor.id">
                  {{ gestor.nome }} ({{ gestor.email }})
                </option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">{{ editandoId ? 'Atualizar Polo' : 'Cadastrar Polo' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .polos-page { padding-top: 2rem; padding-bottom: 3rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .sub-headline { font-size: 0.75rem; font-weight: 800; color: var(--color-olive-soft); letter-spacing: 1.5px; text-transform: uppercase; }
    .polos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .polo-card { display: flex; flex-direction: column; }
    .polo-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .polo-code { font-size: 0.75rem; font-weight: 800; color: var(--color-olive-soft); letter-spacing: 1px; }
    .polo-title { font-size: 1.8rem; color: var(--color-green-01); margin-bottom: 0.25rem; }
    .polo-location { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; }
    .responsavel-box { background-color: var(--color-olive-light); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 4px solid var(--color-olive-soft); display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
    .responsavel-icon { font-size: 1.25rem; color: var(--color-green-01); }
    .responsavel-label { display: block; font-size: 0.675rem; font-weight: 800; text-transform: uppercase; color: var(--color-green-02); }
    .responsavel-nome { font-size: 0.85rem; font-weight: 700; color: var(--color-green-01); }
    .polo-stats { display: flex; align-items: center; justify-content: space-around; background-color: var(--bg-surface-alt); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-top: auto; }
    .stat-item { display: flex; flex-direction: column; align-items: center; }
    .stat-num { font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: var(--color-green-01); line-height: 1; }
    .stat-desc { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .stat-divider { width: 1px; height: 30px; background-color: var(--border-subtle); }
    .card-crud-actions { display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); }
    .btn-delete:hover { background-color: var(--status-danger-bg); color: var(--status-danger-text); border-color: var(--status-danger-text); }
    .mt-4 { margin-top: 2.5rem; }
    .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(12, 40, 0, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-card { background-color: var(--bg-surface); width: 100%; max-width: 500px; border-radius: var(--radius-md); padding: 2rem; box-shadow: var(--shadow-hover); border: 2px solid var(--color-olive-soft); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
    .grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class PolosComponent implements OnInit {
  polos: Polo[] = [];
  turmas: Turma[] = [];
  gestores: Usuario[] = [];
  showModal = false;
  editandoId: number | null = null;

  novoPolo: Partial<Polo> = {
    nome: '', codigo: '', cidade: '', estado: 'SP',
    responsavel_id: undefined, status: 'ATIVO'
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  isUserAdmin(): boolean {
    return this.authService.getCurrentSession().perfil === 'ADMIN';
  }

  isUserGestor(): boolean {
    return this.authService.getCurrentSession().perfil === 'GESTOR_NUCLEO';
  }

  loadData() {
    this.apiService.getPolos().subscribe(data => this.polos = data);
    this.apiService.getTurmas().subscribe(data => this.turmas = data);
  }

  openModalCriar() {
    this.editandoId = null;
    this.novoPolo = { nome: '', codigo: '', cidade: '', estado: 'SP', responsavel_id: undefined, status: 'ATIVO' };
    this.showModal = true;
  }

  editarPolo(polo: Polo) {
    this.editandoId = polo.id;
    this.novoPolo = { ...polo };
    this.showModal = true;
  }

  salvarPolo() {
    if (!this.novoPolo.nome || !this.novoPolo.codigo) return;

    if (this.editandoId) {
      this.apiService.updatePolo(this.editandoId, this.novoPolo).subscribe({
        next: () => {
          this.showModal = false;
          this.loadData();
          alert('Polo atualizado com sucesso!');
        },
        error: (err) => alert(err.error?.detail || 'Erro ao atualizar polo.')
      });
    } else {
      this.apiService.createPolo(this.novoPolo).subscribe({
        next: () => {
          this.showModal = false;
          this.loadData();
          alert('Polo cadastrado com sucesso!');
        },
        error: (err) => alert(err.error?.detail || 'Erro ao criar polo.')
      });
    }
  }

  excluirPolo(polo: Polo) {
    if (confirm(`Tem certeza que deseja excluir o Polo '${polo.nome}'?`)) {
      this.apiService.deletePolo(polo.id).subscribe({
        next: () => {
          this.loadData();
          alert('Polo excluído com sucesso!');
        },
        error: (err) => alert(err.error?.detail || 'Erro ao excluir polo.')
      });
    }
  }

  excluirTurma(turma: Turma) {
    if (confirm(`Tem certeza que deseja excluir a Turma '${turma.nome_turma}'?`)) {
      this.apiService.deleteTurma(turma.id).subscribe({
        next: () => {
          this.loadData();
          alert('Turma excluída com sucesso!');
        },
        error: (err) => alert(err.error?.detail || 'Erro ao excluir turma.')
      });
    }
  }
}
