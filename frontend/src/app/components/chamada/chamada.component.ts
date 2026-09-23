import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Turma, SessaoChamada, ItemAlunoChamada } from '../../models/interfaces';

@Component({
  selector: 'app-chamada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chamada.component.html',
  styleUrls: ['./chamada.component.css'],
})
export class ChamadaComponent implements OnInit {
  turmas: Turma[] = [];
  selectedTurmaId: number = 1;
  selectedData: string = new Date().toISOString().split('T')[0];
  sessao: SessaoChamada | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const poloId = this.authService.getCurrentSession().poloId;
    this.apiService.getTurmas(poloId).subscribe(data => {
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
