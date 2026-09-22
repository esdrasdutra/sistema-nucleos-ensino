import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BoletimAluno, Aluno } from '../../models/interfaces';

@Component({
  selector: 'app-portal-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="portal-page container">
      <!-- Header com Destaque Institucional -->
      <div class="portal-header card">
        <div class="header-left">
          <span class="sub-headline"><i class="fa-solid fa-graduation-cap"></i> ÁREA EXCLUSIVA DO ESTUDANTE</span>
          <h1 class="font-display main-headline">PORTAL DO ALUNO & BOLETIM</h1>
          <p class="aluno-subinfo" *ngIf="boletim">
            <strong>{{ boletim.aluno_nome }}</strong> — {{ boletim.curso_nome }} | {{ boletim.polo_nome }}
          </p>
        </div>

        <div class="student-selector">
          <label class="form-label">Simular Aluno:</label>
          <select class="form-select" [(ngModel)]="selectedAlunoId" (change)="carregarBoletim()">
            <option *ngFor="let a of todosAlunos" [value]="a.id">
              {{ a.nome }} ({{ a.polo_nome }})
            </option>
          </select>
        </div>
      </div>

      <!-- Cards de Métricas Acadêmicas em Morganite -->
      <div class="metrics-grid mb-4" *ngIf="boletim">
        <div class="kpi-card">
          <span class="kpi-title">Média Ponderada Geral</span>
          <div class="kpi-value">{{ boletim.media_geral }}</div>
          <span class="kpi-subtext">Rendimento de 0 a 10</span>
        </div>

        <div class="kpi-card kpi-olive">
          <span class="kpi-title">Taxa de Assiduidade</span>
          <div class="kpi-value">{{ boletim.frequencia_percentual }}%</div>
          <span class="kpi-subtext">{{ boletim.total_presencas }} de {{ boletim.total_aulas }} Aulas Presentes</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Status Geral Acadêmico</span>
          <div class="kpi-status-badge">
            <span class="badge badge-aprovado" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
              <i class="fa-solid fa-circle-check"></i> {{ boletim.status_geral }}
            </span>
          </div>
          <span class="kpi-subtext">Situação de Matrícula: ATIVA</span>
        </div>
      </div>

      <!-- Tabela do Boletim Escolar por Módulo -->
      <div class="card" *ngIf="boletim">
        <div class="card-header-bordered">
          <h3><i class="fa-solid fa-list-check"></i> Histórico de Módulos e Desempenho</h3>
          <span class="badge badge-olive">Grade Curricular Teológica</span>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Módulo Curricular</th>
                <th>Nota Obtida</th>
                <th>Status do Módulo</th>
                <th>Requisito de Aprovação</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of boletim.notas_modulos">
                <td><strong>{{ m.modulo_nome }}</strong></td>
                <td>
                  <span class="nota-destaque" [class.nota-alta]="m.nota >= 7.0">
                    {{ m.nota > 0 ? m.nota : 'Pendente' }}
                  </span>
                </td>
                <td>
                  <span 
                    class="badge" 
                    [class.badge-aprovado]="m.situacao === 'APROVADO'"
                    [class.badge-recuperacao]="m.situacao === 'RECUPERACAO'"
                    [class.badge-reprovado]="m.situacao === 'REPROVADO'">
                    {{ m.situacao }}
                  </span>
                </td>
                <td>Nota mínima >= 7.0 + Frequência mínima 75%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .portal-page {
      padding-top: 2rem;
      padding-bottom: 3rem;
    }

    .portal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, var(--color-white), var(--color-olive-light));
      border-left: 6px solid var(--color-green-01);
      margin-bottom: 2rem;
    }

    .sub-headline {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--color-olive-soft);
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .main-headline {
      font-size: 2.5rem;
    }

    .aluno-subinfo {
      color: var(--color-green-01);
      font-size: 0.95rem;
      margin-top: 0.25rem;
    }

    .student-selector {
      width: 280px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .kpi-status-badge {
      margin: 0.75rem 0;
    }

    .mb-4 { margin-bottom: 1.5rem; }

    .nota-destaque {
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--text-dark);
    }

    .nota-alta {
      color: var(--color-green-01);
    }
  `]
})
export class PortalAlunoComponent implements OnInit {
  boletim: BoletimAluno | null = null;
  todosAlunos: Aluno[] = [];
  selectedAlunoId: number = 1;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.apiService.getAlunos().subscribe(alunosData => {
      this.todosAlunos = alunosData;
      const current = this.authService.getCurrentSession();
      if (current.alunoId) {
        this.selectedAlunoId = current.alunoId;
      } else if (this.todosAlunos.length > 0) {
        this.selectedAlunoId = this.todosAlunos[0].id;
      }
      this.carregarBoletim();
    });

    this.authService.currentSession$.subscribe(session => {
      if (session.alunoId) {
        this.selectedAlunoId = session.alunoId;
        this.carregarBoletim();
      }
    });
  }

  carregarBoletim() {
    if (!this.selectedAlunoId) return;
    this.apiService.getBoletimAluno(this.selectedAlunoId).subscribe({
      next: (data) => this.boletim = data,
      error: (err) => console.error('Erro ao buscar boletim:', err)
    });
  }
}
