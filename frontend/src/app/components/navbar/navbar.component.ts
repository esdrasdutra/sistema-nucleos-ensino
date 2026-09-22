import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserSession } from '../../services/auth.service';
import { PerfilUsuario } from '../../models/interfaces';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar-header">
      <div class="container navbar-container">
        <!-- Brand / Logotipo -->
        <div class="navbar-brand">
          <div class="brand-icon">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div class="brand-text">
            <span class="brand-title">NÚCLEOS DE ENSINO</span>
            <span class="brand-subtitle">GESTAO TEOLOGICA E POLOS EAD</span>
          </div>
        </div>

        <!-- Links de Navegação -->
        <nav class="navbar-menu">
          <a routerLink="/dashboard" routerLinkActive="active" *ngIf="session.perfil === 'ADMIN' || session.perfil === 'GESTOR_NUCLEO'" class="nav-link">
            <i class="fa-solid fa-chart-pie"></i> Dashboard
          </a>
          <a routerLink="/polos" routerLinkActive="active" *ngIf="session.perfil === 'ADMIN' || session.perfil === 'GESTOR_NUCLEO'" class="nav-link">
            <i class="fa-solid fa-building-columns"></i> Polos & Turmas
          </a>
          <a routerLink="/chamada" routerLinkActive="active" *ngIf="session.perfil === 'ADMIN' || session.perfil === 'GESTOR_NUCLEO'" class="nav-link">
            <i class="fa-solid fa-clipboard-user"></i> Chamada Digital
          </a>
          <a routerLink="/avaliacoes" routerLinkActive="active" *ngIf="session.perfil === 'ADMIN' || session.perfil === 'GESTOR_NUCLEO'" class="nav-link">
            <i class="fa-solid fa-award"></i> Avaliações / Notas
          </a>
          <a routerLink="/portal-aluno" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-user-graduate"></i> Portal do Aluno
          </a>
        </nav>

        <!-- Seletor de Perfil Demo & User Profile -->
        <div class="navbar-profile-section">
          <div class="profile-switcher">
            <span class="switcher-label">Perfil de Acesso:</span>
            <div class="btn-group-profile">
              <button 
                class="btn-profile" 
                [class.active]="session.perfil === 'ADMIN'"
                (click)="switchRole('ADMIN')">
                Admin
              </button>
              <button 
                class="btn-profile" 
                [class.active]="session.perfil === 'GESTOR_NUCLEO'"
                (click)="switchRole('GESTOR_NUCLEO')">
                Gestor
              </button>
              <button 
                class="btn-profile" 
                [class.active]="session.perfil === 'ALUNO'"
                (click)="switchRole('ALUNO')">
                Aluno
              </button>
            </div>
          </div>

          <div class="user-badge">
            <i class="fa-solid fa-circle-user avatar-icon"></i>
            <div class="user-info">
              <span class="user-name">{{ session.nome }}</span>
              <span class="user-role badge-role">{{ getRoleBadgeText(session.perfil) }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-header {
      background-color: var(--color-green-02);
      color: var(--color-white);
      border-bottom: 3px solid var(--color-olive-soft);
      box-shadow: var(--shadow-card);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 75px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-icon {
      width: 44px;
      height: 44px;
      background-color: var(--color-green-01);
      border: 2px solid var(--color-olive-soft);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: var(--color-olive-soft);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--color-white);
      letter-spacing: 1px;
      line-height: 1;
    }

    .brand-subtitle {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 1px;
      color: var(--color-olive-soft);
      text-transform: uppercase;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.55rem 0.9rem;
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .nav-link i {
      color: var(--color-olive-soft);
    }

    .nav-link:hover, .nav-link.active {
      background-color: var(--color-green-01);
      color: var(--color-white);
      border-bottom: 2px solid var(--color-olive-soft);
    }

    .navbar-profile-section {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .profile-switcher {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .switcher-label {
      font-size: 0.675rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-olive-soft);
    }

    .btn-group-profile {
      display: flex;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 2px;
      border-radius: 6px;
      border: 1px solid rgba(185, 180, 116, 0.3);
    }

    .btn-profile {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .btn-profile.active {
      background-color: var(--color-olive-soft);
      color: var(--color-green-02);
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background-color: rgba(18, 61, 0, 0.5);
      padding: 0.4rem 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-olive);
    }

    .avatar-icon {
      font-size: 1.5rem;
      color: var(--color-olive-soft);
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-white);

      white-space: nowrap;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge-role {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--color-olive-soft);
      text-transform: uppercase;
    }
  `]
})
export class NavbarComponent implements OnInit {
  session!: UserSession;

  constructor(private authService: AuthService) {}

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
      case 'ADMIN': return 'ADMIN (DENOMINAÇÃO)';
      case 'GESTOR_NUCLEO': return 'GESTOR DO NÚCLEO';
      case 'ALUNO': return 'ALUNO';
    }
  }
}
