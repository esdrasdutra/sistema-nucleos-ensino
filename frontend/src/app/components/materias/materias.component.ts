import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Materia } from '../../models/interfaces';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.css'],
})
export class MateriasComponent implements OnInit {
  materias: Materia[] = [];
  showModal = false;
  editandoId: number | null = null;

  novaMateria: Partial<Materia> = {
    nome: '',
    codigo: '',
    descricao: '',
    status: 'ATIVA'
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

  loadData() {
    this.apiService.getMaterias().subscribe({
      next: (data) => this.materias = data,
      error: (err) => console.error('Erro ao carregar matérias:', err)
    });
  }

  openModalCriar() {
    this.editandoId = null;
    this.novaMateria = {
      nome: '',
      codigo: '',
      descricao: '',
      status: 'ATIVA'
    };
    this.showModal = true;
  }

  editarMateria(materia: Materia) {
    this.editandoId = materia.id;
    this.novaMateria = { ...materia };
    this.showModal = true;
  }

  salvarMateria() {
    if (!this.novaMateria.nome || !this.novaMateria.codigo) {
      alert('Informe o nome e o código da matéria.');
      return;
    }

    if (this.editandoId) {
      this.apiService.updateMateria(this.editandoId, this.novaMateria).subscribe({
        next: () => {
          this.showModal = false;
          this.loadData();
          alert('Matéria atualizada com sucesso!');
        },
        error: (err) => alert(err.error?.detail || 'Erro ao atualizar matéria.')
      });
      return;
    }

    this.apiService.createMateria(this.novaMateria).subscribe({
      next: () => {
        this.showModal = false;
        this.loadData();
        alert('Matéria cadastrada com sucesso!');
      },
      error: (err) => alert(err.error?.detail || 'Erro ao criar matéria.')
    });
  }

  excluirMateria(materia: Materia) {
    if (confirm(`Tem certeza que deseja excluir a matéria '${materia.nome}'?`)) {
      this.apiService.deleteMateria(materia.id).subscribe({
        next: () => {
          this.loadData();
          alert('Matéria excluída com sucesso!');
        },
        error: (err) => alert(err.error?.detail || 'Erro ao excluir matéria.')
      });
    }
  }
}
