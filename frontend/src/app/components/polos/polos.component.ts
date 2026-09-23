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
  templateUrl: './polos.component.html',
  styleUrls: ['./polos.component.css'],
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
