import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { DashboardOverview } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page container">
      <!-- Header do Dashboard com Tipografia Morganite -->
      <div class="dashboard-header">
        <div>
          <span class="sub-headline"><i class="fa-solid fa-chart-line"></i> PAINEL ADMINISTRATIVO</span>
          <h1 class="font-display main-headline">PANORAMA GERAL DOS NÚCLEOS TEOLÓGICOS</h1>
        </div>
        <button class="btn btn-secondary btn-sm" (click)="reloadSeed()">
          <i class="fa-solid fa-rotate-right"></i> Resetar Dados de Demo
        </button>
      </div>

      <!-- KPI Grid com Tipografia Gigante em Morganite -->
      <div class="kpi-grid" *ngIf="overview">
        <div class="kpi-card">
          <span class="kpi-title">Polos de Ensino</span>
          <div class="kpi-value">{{ overview.total_polos }}</div>
          <span class="kpi-subtext"><i class="fa-solid fa-location-dot"></i> Núcleos Ativos</span>
        </div>

        <div class="kpi-card kpi-olive">
          <span class="kpi-title">Turmas em Andamento</span>
          <div class="kpi-value">{{ overview.total_turmas }}</div>
          <span class="kpi-subtext"><i class="fa-solid fa-book-open"></i> Grade Curricular</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Alunos Matriculados</span>
          <div class="kpi-value">{{ overview.total_alunos }}</div>
          <span class="kpi-subtext"><i class="fa-solid fa-user-graduate"></i> Estudantes de Teologia</span>
        </div>

        <div class="kpi-card kpi-olive">
          <span class="kpi-title">Presença Global Média</span>
          <div class="kpi-value">{{ overview.frequencia_media_global }}%</div>
          <span class="kpi-subtext"><i class="fa-solid fa-calendar-check"></i> Assiduidade nos Núcleos</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Média Acadêmica Geral</span>
          <div class="kpi-value">{{ overview.media_notas_global }}</div>
          <span class="kpi-subtext"><i class="fa-solid fa-star"></i> Desempenho dos Módulos</span>
        </div>
      </div>

      <!-- Seção de Tabelas Analíticas -->
      <div class="analytics-grid" *ngIf="overview">
        <!-- Ranking de Frequência por Polo -->
        <div class="card">
          <div class="card-header-bordered">
            <h3><i class="fa-solid fa-ranking-star"></i> Assiduidade e Presença por Polo EAD</h3>
            <span class="badge badge-olive">Atualizado em Tempo Real</span>
          </div>

          <div class="table-responsive">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Polo de Ensino</th>
                  <th>Cidade / Estado</th>
                  <th>Assiduidade (%)</th>
                  <th>Progresso Visual</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let polo of overview.ranking_frequencia_polo">
                  <td><strong>{{ polo.polo_nome }}</strong></td>
                  <td>{{ polo.cidade }}</td>
                  <td><span class="badge badge-aprovado">{{ polo.taxa_presenca }}%</span></td>
                  <td style="width: 40%;">
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" [style.width.%]="polo.taxa_presenca"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Distribuição de Alunos por Polo -->
        <div class="card">
          <div class="card-header-bordered">
            <h3><i class="fa-solid fa-chart-pie"></i> Distribuição de Estudantes</h3>
            <span class="badge badge-sucesso">Capacidade dos Núcleos</span>
          </div>

          <div class="polo-distribution-list">
            <div class="dist-item" *ngFor="let dist of overview.distribuicao_alunos_polo">
              <div class="dist-info">
                <span class="dist-name">{{ dist.polo_nome }}</span>
                <span class="dist-count">{{ dist.total_alunos }} Alunos</span>
              </div>
              <div class="dist-bar-bg">
                <div class="dist-bar-fill" [style.width.%]="(dist.total_alunos / overview.total_alunos) * 100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding-top: 2rem;
      padding-bottom: 3rem;
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
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
      font-size: 2.8rem;
      margin-top: 0.2rem;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    .kpi-subtext {
      font-size: 0.775rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 1.75rem;
    }

    @media (max-width: 992px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }

    .progress-bar-bg {
      height: 10px;
      background-color: var(--color-olive-light);
      border-radius: var(--radius-full);
      overflow: hidden;
      border: 1px solid var(--border-olive);
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-green-01), var(--color-olive-soft));
      border-radius: var(--radius-full);
    }

    .polo-distribution-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-top: 1rem;
    }

    .dist-item {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .dist-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .dist-name {
      color: var(--color-green-02);
    }

    .dist-count {
      color: var(--color-green-01);
      font-weight: 700;
    }

    .dist-bar-bg {
      height: 8px;
      background-color: var(--border-subtle);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .dist-bar-fill {
      height: 100%;
      background-color: var(--color-green-01);
      border-radius: var(--radius-full);
    }
  `]
})
export class DashboardComponent implements OnInit {
  overview: DashboardOverview | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getDashboardOverview().subscribe({
      next: (data) => this.overview = data,
      error: (err) => console.error('Erro ao carregar analytics:', err)
    });
  }

  reloadSeed() {
    this.apiService.triggerSeed().subscribe(() => {
      this.loadData();
      alert('Banco de dados semeado com sucesso!');
    });
  }
}
