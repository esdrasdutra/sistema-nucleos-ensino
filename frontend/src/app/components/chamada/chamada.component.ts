import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Turma, SessaoChamada, ItemAlunoChamada } from '../../models/interfaces';

@Component({
  selector: 'app-chamada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chamada-page container">
      <!-- Header Mobile-First -->
      <div class="page-header">
        <div>
          <span class="sub-headline"><i class="fa-solid fa-mobile-screen"></i> SALA DE AULA & ASSIDUIDADE</span>
          <h1 class="font-display">CHAMADA DIGITAL DOS NÚCLEOS</h1>
        </div>
      </div>

      <!-- Filtros / Seletores de Chamada -->
      <div class="card filters-card mb-4">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-users-rectangle"></i> Turma do Núcleo</label>
            <select class="form-select" [(ngModel)]="selectedTurmaId" (change)="carregarChamada()">
              <option *ngFor="let t of turmas" [value]="t.id">
                {{ t.nome_turma }} ({{ t.polo_nome }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label"><i class="fa-regular fa-calendar-days"></i> Data da Aula</label>
            <input type="date" class="form-control" [(ngModel)]="selectedData" (change)="carregarChamada()">
          </div>
        </div>
      </div>

      <!-- Resumo da Chamada e Lista Interativa de Alunos -->
      <div class="card" *ngIf="sessao">
        <div class="card-header-bordered">
          <div>
            <h3><i class="fa-solid fa-clipboard-check"></i> Frequência da Aula — {{ selectedData }}</h3>
            <p class="text-muted">Clique nos botões para alterar o status de presença de cada estudante em tempo real.</p>
          </div>
          <div class="summary-badge">
            <span class="badge badge-aprovado">{{ getPresentesCount() }} / {{ sessao.alunos.length }} Presentes</span>
          </div>
        </div>

        <!-- Conteúdo Ministrado -->
        <div class="form-group mb-4">
          <label class="form-label">Conteúdo Ministrado na Aula</label>
          <input type="text" class="form-control" [(ngModel)]="sessao.conteudo" placeholder="Ex: Estudo Dirigido sobre o Livro de Gênesis - Cap. 1 a 3">
        </div>

        <!-- Lista Mobile-First de Chamada -->
        <div class="chamada-list">
          <div class="chamada-item" *ngFor="let aluno of sessao.alunos" [class.is-present]="aluno.presente">
            <div class="aluno-info">
              <span class="aluno-nome">{{ aluno.nome }}</span>
              <span class="aluno-email">{{ aluno.email }}</span>
            </div>

            <div class="toggle-buttons">
              <button 
                type="button"
                class="btn-toggle btn-presente"
                [class.active]="aluno.presente"
                (click)="aluno.presente = true">
                <i class="fa-solid fa-check"></i> Presente
              </button>
              <button 
                type="button"
                class="btn-toggle btn-ausente"
                [class.active]="!aluno.presente"
                (click)="aluno.presente = false">
                <i class="fa-solid fa-xmark"></i> Ausente
              </button>
            </div>
          </div>
        </div>

        <div class="action-footer">
          <button class="btn btn-primary btn-lg" (click)="salvarChamada()">
            <i class="fa-solid fa-floppy-disk"></i> Salvar Chamada Digital
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chamada-page {
      padding-top: 2rem;
      padding-bottom: 3rem;
    }

    .sub-headline {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--color-olive-soft);
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .mb-4 { margin-bottom: 1.5rem; }

    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 768px) {
      .filters-grid { grid-template-columns: 1fr; }
    }

    .chamada-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .chamada-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border: 1.5px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      background-color: var(--bg-surface);
      transition: var(--transition-fast);
    }

    .chamada-item.is-present {
      border-color: var(--border-green);
      background-color: var(--color-olive-light);
    }

    .aluno-info {
      display: flex;
      flex-direction: column;
    }

    .aluno-nome {
      font-weight: 700;
      color: var(--color-green-02);
      font-size: 0.95rem;
    }

    .aluno-email {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .toggle-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-toggle {
      border: 1px solid var(--border-subtle);
      background-color: var(--color-white);
      padding: 0.45rem 0.9rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition-fast);

      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-presente.active {
      background-color: var(--color-green-01);
      color: var(--color-white);
      border-color: var(--color-green-01);
    }

    .btn-ausente.active {
      background-color: var(--status-danger-text);
      color: var(--color-white);
      border-color: var(--status-danger-text);
    }

    .action-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }

    .btn-lg {
      padding: 0.9rem 2rem;
      font-size: 1rem;
    }
  `]
})
export class ChamadaComponent implements OnInit {
  turmas: Turma[] = [];
  selectedTurmaId: number = 1;
  selectedData: string = new Date().toISOString().split('T')[0];
  sessao: SessaoChamada | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getTurmas().subscribe(data => {
      this.turmas = data;
      if (this.turmas.length > 0) {
        this.selectedTurmaId = this.turmas[0].id;
        this.carregarChamada();
      }
    });
  }

  carregarChamada() {
    if (!this.selectedTurmaId || !this.selectedData) return;
    this.apiService.getSessaoChamada(this.selectedTurmaId, this.selectedData).subscribe({
      next: (data) => this.sessao = data,
      error: (err) => console.error('Erro ao buscar chamada:', err)
    });
  }

  getPresentesCount(): number {
    if (!this.sessao) return 0;
    return this.sessao.alunos.filter(a => a.presente).length;
  }

  salvarChamada() {
    if (!this.sessao) return;
    const payload = {
      turma_id: this.selectedTurmaId,
      data_aula: this.selectedData,
      conteudo: this.sessao.conteudo,
      presencas: this.sessao.alunos.map(a => ({ aluno_id: a.aluno_id, presente: a.presente }))
    };

    this.apiService.salvarChamada(payload).subscribe(() => {
      alert('Chamada Digital registrada com sucesso!');
    });
  }
}
