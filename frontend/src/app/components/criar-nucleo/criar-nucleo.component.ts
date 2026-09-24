import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CriarNucleoPayload } from '../../models/interfaces';

@Component({
  selector: 'app-criar-nucleo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './criar-nucleo.component.html',
  styleUrls: ['./criar-nucleo.component.css'],
})
export class CriarNucleoComponent {
  submitting = false;
  errorMessage = '';
  payload: CriarNucleoPayload = {
    nome_nucleo: '', codigo: '', cidade: '', estado: '', nome_responsavel: '',
    email_responsavel: '', senha: '', telefone_responsavel: '', aceitou_termos: false,
  };

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  submit() {
    this.errorMessage = '';
    if (this.payload.senha.length < 8) {
      this.errorMessage = 'A senha precisa ter pelo menos 8 caracteres.';
      return;
    }
    if (!this.payload.aceitou_termos) {
      this.errorMessage = 'Aceite os termos para continuar.';
      return;
    }
    this.submitting = true;
    this.api.criarNucleoPublico({ ...this.payload, estado: this.payload.estado.toUpperCase() }).subscribe({
      next: result => {
        this.auth.startGestorSession({ id: result.usuario_id, nome: result.usuario_nome, email: result.email, perfil: 'GESTOR_NUCLEO', poloId: result.polo_id, poloNome: result.polo_nome });
        this.router.navigate(['/polos']);
      },
      error: err => {
        this.errorMessage = err.error?.detail || 'Não foi possível criar o núcleo. Tente novamente.';
        this.submitting = false;
      },
    });
  }
}
