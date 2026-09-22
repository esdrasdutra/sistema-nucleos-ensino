import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Turma, Curso, Modulo, NotaItem } from '../../models/interfaces';

@Component({
  selector: 'app-avaliacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="avaliacoes-page container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <span class="sub-headline"><i class="fa-solid fa-award"></i> ACOMPANHAMENTO ACADÊMICO</span>
          <h1 class="font-display">AVALIAÇÃO E NOTAS POR MÓDULO</h1>
        </div>
      </div>

      <!-- Filtros de Turma e Módulo -->
      <div class="card filters-card mb-4">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-users"></i> Turma do Núcleo</label>
            <select class="form-select" [(ngModel)]="selectedTurmaId" (change)="onTurmaChange()">
              <option *ngFor="let t of turmas" [value]="t.id">
                {{ t.nome_turma }} ({{ t.polo_nome }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-book-open"></i> Módulo Curricular</label>
            <select class="form-select" [(ngModel)]="selectedModuloId" (change)="carregarNotas()">
              <option *ngFor="let m of modulos" [value]="m.id">
                {{ m.nome_modulo }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Matriz de Lançamento de Notas -->
      <div class="card" *ngIf="notas.length > 0">
        <div class="card-header-bordered">
          <div>
            <h3><i class="fa-solid fa-pen-to-square"></i> Matriz de Lançamento de Avaliações</h3>
            <p class="text-muted">Insira a nota obtida pelo aluno no módulo selecionado (0 a 10).</p>
          </div>
          <span class="badge badge-olive">Média de Aprovação: 7.0</span>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Estudante</th>
                <th>Módulo Avaliado</th>
                <th style="width: 140px;">Nota (0.0 - 10.0)</th>
                <th>Situação do Aluno</th>
                <th>Observações do Professor</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of notas">
                <td>
                  <strong>{{ item.aluno_nome }}</strong>
                </td>
                <td>{{ item.modulo_nome }}</td>
                <td>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10" 
                    class="form-control input-nota" 
                    [(ngModel)]="item.nota"
                    (input)="recalcularSituacao(item)">
                </td>
                <td>
                  <span 
                    class="badge" 
                    [class.badge-aprovado]="item.situacao === 'APROVADO'"
                    [class.badge-recuperacao]="item.situacao === 'RECUPERACAO'"
                    [class.badge-reprovado]="item.situacao === 'REPROVADO'">
                    {{ item.situacao }}
                  </span>
                </td>
                <td>
                  <input type="text" class="form-control" [(ngModel)]="item.observacoes" placeholder="Feedback ou observação...">
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="action-footer">
          <button class="btn btn-primary btn-lg" (click)="salvarNotas()">
            <i class="fa-solid fa-floppy-disk"></i> Salvar Avaliações do Módulo
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avaliacoes-page {
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
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .input-nota {
      font-weight: 800;
      font-size: 1.05rem;
      color: var(--color-green-01);
      text-align: center;
    }

    .action-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 1.5rem;
      margin-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }
  `]
})
export class AvaliacoesComponent implements OnInit {
  turmas: Turma[] = [];
  modulos: Modulo[] = [];
  selectedTurmaId: number = 1;
  selectedModuloId: number = 1;
  notas: NotaItem[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getTurmas().subscribe(turmasData => {
      this.turmas = turmasData;
      this.apiService.getCursos().subscribe(cursosData => {
        if (cursosData.length > 0 && cursosData[0].modulos) {
          this.modulos = cursosData[0].modulos;
          if (this.turmas.length > 0) this.selectedTurmaId = this.turmas[0].id;
          if (this.modulos.length > 0) this.selectedModuloId = this.modulos[0].id;
          this.carregarNotas();
        }
      });
    });
  }

  onTurmaChange() {
    this.carregarNotas();
  }

  carregarNotas() {
    if (!this.selectedTurmaId || !this.selectedModuloId) return;
    this.apiService.getNotasTurmaModulo(this.selectedTurmaId, this.selectedModuloId).subscribe({
      next: (data) => this.notas = data,
      error: (err) => console.error('Erro ao carregar notas:', err)
    });
  }

  recalcularSituacao(item: NotaItem) {
    if (item.nota >= 7.0) {
      item.situacao = 'APROVADO';
    } else if (item.nota >= 5.0) {
      item.situacao = 'RECUPERACAO';
    } else {
      item.situacao = 'REPROVADO';
    }
  }

  salvarNotas() {
    const payload = {
      turma_id: this.selectedTurmaId,
      modulo_id: this.selectedModuloId,
      notas: this.notas.map(n => ({ aluno_id: n.aluno_id, nota: n.nota, observacoes: n.observacoes }))
    };

    this.apiService.salvarNotas(payload).subscribe(() => {
      alert('Avaliações registradas com sucesso!');
    });
  }
}
