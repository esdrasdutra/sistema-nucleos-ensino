import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserSession } from '../../services/auth.service';
import { PerfilUsuario } from '../../models/interfaces';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  session!: UserSession;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentSession$.subscribe(session => {
      this.session = session;
    });
  }

  switchRole(role: PerfilUsuario) {
    this.authService.switchProfile(role);
  }

  getRoleBadgeText(perfil: PerfilUsuario): string {
    switch (perfil) {
      case 'ADMIN': return 'ADMIN';
      case 'GESTOR_NUCLEO': return 'GESTOR';
      case 'ALUNO': return 'ALUNO';
    }
  }

  realizarLogout() {
    this.router.navigate(['/home']);
  }
}
