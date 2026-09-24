import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BoletimAluno, HistoricoAluno, Aluno } from '../../models/interfaces';

@Component({
  selector: 'app-portal-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portal-aluno.component.html',
  styleUrls: ['./portal-aluno.component.css'],
})
export class PortalAlunoComponent implements OnInit {
  boletim: BoletimAluno | null = null;
  historico: HistoricoAluno | null = null;
  todosAlunos: Aluno[] = [];
  selectedAlunoId: number = 1;
  selectedTipoAluno: 'TODOS' | 'JOVEM' | 'ADULTO' = 'TODOS';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.carregarAlunos();

    this.authService.currentSession$.subscribe(session => {
      if (session.alunoId) {
        this.selectedAlunoId = session.alunoId;
        this.carregarBoletim();
      }
    });
  }

  carregarAlunos() {
    const poloId = this.authService.getCurrentSession().poloId;
    const tipoAluno = this.selectedTipoAluno === 'TODOS' ? undefined : this.selectedTipoAluno;

    this.apiService.getAlunos(poloId, undefined, tipoAluno).subscribe(alunosData => {
      this.todosAlunos = alunosData;
      const current = this.authService.getCurrentSession();
      if (current.alunoId && this.todosAlunos.some(a => a.id === current.alunoId)) {
        this.selectedAlunoId = current.alunoId;
      } else if (this.todosAlunos.length > 0) {
        this.selectedAlunoId = this.todosAlunos[0].id;
      }
      this.carregarBoletim();
    });
  }

  onTipoAlunoChange() {
    this.carregarAlunos();
  }

  getAlunoTipoSelecionado(): string | undefined {
    return this.todosAlunos.find(a => a.id === this.selectedAlunoId)?.tipo_aluno;
  }

  carregarBoletim() {
    if (!this.selectedAlunoId) return;
    this.apiService.getBoletimAluno(this.selectedAlunoId).subscribe({
      next: (data) => this.boletim = data,
      error: (err) => console.error('Erro ao buscar boletim:', err)
    });

    this.apiService.getHistoricoAluno(this.selectedAlunoId).subscribe({
      next: (data) => this.historico = data,
      error: (err) => console.error('Erro ao buscar histórico do aluno:', err)
    });
  }
}
