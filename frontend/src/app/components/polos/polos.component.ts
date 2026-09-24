import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Curso, Polo, Turma, Usuario } from '../../models/interfaces';

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
  cursos: Curso[] = [];
  gestores: Usuario[] = [];
  showModal = false;
  showTurmaModal = false;
  editandoId: number | null = null;
  editandoTurmaId: number | null = null;

  novoPolo: Partial<Polo> = {
    nome: '', codigo: '', cidade: '', estado: 'SP',
    responsavel_id: undefined, status: 'ATIVO', aceitou_termos: false
  };

  novaTurma: Partial<Turma> = {
    polo_id: undefined,
    curso_id: undefined,
    nome_turma: '',
    professor: '',
    dia_semana: 'Sábado',
    horario: '19:00 - 21:30',
    status: 'EM_ANDAMENTO'
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
    const poloId = this.authService.getCurrentSession().poloId;
    this.apiService.getPolos(poloId).subscribe(data => this.polos = data);
    this.apiService.getTurmas(poloId).subscribe(data => this.turmas = data);
    this.apiService.getUsuarios('GESTOR_NUCLEO').subscribe(data => {
      this.gestores = data.filter(usuario => usuario.perfil === 'GESTOR_NUCLEO');
    });
    this.apiService.getCursos().subscribe(data => this.cursos = data);
  }

  openModalCriar() {
    this.editandoId = null;
    this.novoPolo = { nome: '', codigo: '', cidade: '', estado: 'SP', responsavel_id: undefined, status: 'ATIVO', aceitou_termos: false };
    this.showModal = true;
  }

  openTurmaModal() {
    const session = this.authService.getCurrentSession();
    this.editandoTurmaId = null;
    this.novaTurma = {
      polo_id: session.poloId || this.polos[0]?.id,
      curso_id: this.cursos[0]?.id,
      nome_turma: '',
      professor: '',
      dia_semana: 'Sábado',
      horario: '19:00 - 21:30',
      status: 'EM_ANDAMENTO'
    };
    this.showTurmaModal = true;
  }

  editarPolo(polo: Polo) {
    this.editandoId = polo.id;
    this.novoPolo = { ...polo };
    this.showModal = true;
  }

  salvarPolo() {
    if (!this.novoPolo.nome || !this.novoPolo.codigo) {
      alert('Preencha nome e código do núcleo.');
      return;
    }

    if (!this.novoPolo.responsavel_id) {
      alert('Selecione o gestor responsável pelo núcleo.');
      return;
    }

    if (!this.novoPolo.aceitou_termos) {
      alert('É necessário aceitar os termos para criar o núcleo.');
      return;
    }

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

  editarTurma(turma: Turma) {
    this.editandoTurmaId = turma.id;
    this.novaTurma = { ...turma };
    this.showTurmaModal = true;
  }

  salvarTurma() {
    if (!this.novaTurma.nome_turma || !this.novaTurma.professor) {
      alert('Preencha nome da turma e professor responsável.');
      return;
    }

    if (!this.novaTurma.polo_id) {
      alert('Selecione o núcleo da turma.');
      return;
    }

    if (!this.novaTurma.curso_id) {
      alert('Selecione o curso da turma.');
      return;
    }

    const payload = {
      ...this.novaTurma,
      polo_id: Number(this.novaTurma.polo_id),
      curso_id: Number(this.novaTurma.curso_id)
    };

    if (this.editandoTurmaId) {
      this.apiService.updateTurma(this.editandoTurmaId, payload).subscribe({
        next: () => {
          this.showTurmaModal = false;
          this.loadData();
          alert('Turma atualizada com sucesso!');
        },
        error: (err) => alert(err.error?.detail || 'Erro ao atualizar turma.')
      });
      return;
    }

    this.apiService.createTurma(payload).subscribe({
      next: () => {
        this.showTurmaModal = false;
        this.loadData();
        alert('Turma cadastrada com sucesso!');
      },
      error: (err) => alert(err.error?.detail || 'Erro ao criar turma.')
    });
  }

  excluirPolo(polo: Polo) {
    if (confirm(`Tem certeza que deseja excluir o Núcleo '${polo.nome}'?`)) {
      this.apiService.deletePolo(polo.id).subscribe({
        next: () => {
          this.loadData();
          alert('Núcleo excluído com sucesso!');
        },
        error: (err) => alert(err.error?.detail || 'Erro ao excluir núcleo.')
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
