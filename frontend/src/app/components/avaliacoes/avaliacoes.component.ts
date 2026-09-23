import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Turma, Curso, Modulo, NotaItem } from '../../models/interfaces';

@Component({
  selector: 'app-avaliacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avaliacoes.component.html',
  styleUrls: ['./avaliacoes.component.css'],
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
