import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PerfilUsuario } from '../../models/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  selectedRole: PerfilUsuario = 'ADMIN';
  emailInput: string = 'admin@denomimacao.org';
  senhaInput: string = '123456';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectRole(role: PerfilUsuario) {
    this.selectedRole = role;
    if (role === 'ADMIN') this.emailInput = 'admin@denomimacao.org';
    else if (role === 'GESTOR_NUCLEO') this.emailInput = 'carlos.sp@denomimacao.org';
    else this.emailInput = 'gabriel.santos@aluno.org';
  }

  realizarLogin() {
    this.authService.switchProfile(this.selectedRole);
    if (this.selectedRole === 'ALUNO') {
      this.router.navigate(['/portal-aluno']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
