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
  templateUrl: './portal-aluno.component.html',
  styleUrls: ['./portal-aluno.component.css'],
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
    const poloId = this.authService.getCurrentSession().poloId;
    this.apiService.getAlunos(poloId).subscribe(alunosData => {
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
