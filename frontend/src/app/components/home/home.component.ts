import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PerfilUsuario } from '../../models/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-page">
      <!-- Main Split Hero Layout -->
      <main class="container main-split-section">
        
        <!-- LADO ESQUERDO: Informações Institucionais do QGU UMADESPA -->
        <div class="info-section">
          <div class="header-tag">
            <i class="fa-solid fa-cross"></i> UMADESPA & ENSINO TEOLÓGICO
          </div>
          
          <h1 class="font-display hero-title">QGU — UMADESPA</h1>
          <h2 class="hero-subtitle">QUARTEL GENERAL DE ENSINO & QUALIFICAÇÃO DE LÍDERES</h2>
          
          <p class="hero-description">
            O <strong>QGU (Quartel General UMADESPA)</strong> é a plataforma oficial de gestão de núcleos de ensino teológico e formação ministerial. Desenvolvido para unificar a capacitação acadêmica, acompanhamento de assiduidade e desenvolvimento espiritual dos estudantes e líderes locais.
          </p>

          <!-- Cards das Atividades Desenvolvidas -->
          <div class="atividades-grid">
            <div class="atividade-card">
              <div class="atividade-icon"><i class="fa-solid fa-book-bible"></i></div>
              <div>
                <span class="atividade-title">Formação Teológica Unificada</span>
                <span class="atividade-desc">Grade curricular estruturada com módulos de Bibliologia, Teologia e Homilética.</span>
              </div>
            </div>

            <div class="atividade-card">
              <div class="atividade-icon"><i class="fa-solid fa-sitemap"></i></div>
              <div>
                <span class="atividade-title">Gestão Descentralizada de Polos</span>
                <span class="atividade-desc">Supervisão de núcleos regionais e congregacionais com gestores dedicados.</span>
              </div>
            </div>

            <div class="atividade-card">
              <div class="atividade-icon"><i class="fa-solid fa-clipboard-check"></i></div>
              <div>
                <span class="atividade-title">Chamada Digital & Avaliação</span>
                <span class="atividade-desc">Frequência mobile em sala de aula e boletim de acompanhamento por módulo.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- LADO DIREITO: Form de Login Integrado -->
        <div class="login-section">
          <div class="card login-card">
            <div class="login-card-header">
              <div class="login-badge-icon">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <h3 class="font-display login-title">ACESSO AO SISTEMA</h3>
              <p class="login-subtitle">Entre com suas credenciais para acessar a plataforma</p>
            </div>

            <form (ngSubmit)="realizarLogin()">
              <!-- Seletor de Perfil de Acesso -->
              <div class="form-group">
                <label class="form-label">Perfil de Acesso</label>
                <div class="role-selector-tabs">
                  <button 
                    type="button"
                    class="tab-role"
                    [class.active]="selectedRole === 'ADMIN'"
                    (click)="selectRole('ADMIN')">
                    Admin
                  </button>
                  <button 
                    type="button"
                    class="tab-role"
                    [class.active]="selectedRole === 'GESTOR_NUCLEO'"
                    (click)="selectRole('GESTOR_NUCLEO')">
                    Gestor
                  </button>
                  <button 
                    type="button"
                    class="tab-role"
                    [class.active]="selectedRole === 'ALUNO'"
                    (click)="selectRole('ALUNO')">
                    Aluno
                  </button>
                </div>
              </div>

              <!-- Campo E-mail -->
              <div class="form-group">
                <label class="form-label">E-mail ou Usuário</label>
                <div class="input-with-icon">
                  <i class="fa-solid fa-envelope input-icon"></i>
                  <input 
                    type="email" 
                    class="form-control input-has-icon" 
                    [(ngModel)]="emailInput" 
                    name="email" 
                    placeholder="seu.email@denomimacao.org" 
                    required>
                </div>
              </div>

              <!-- Campo Senha -->
              <div class="form-group">
                <label class="form-label">Senha de Acesso</label>
                <div class="input-with-icon">
                  <i class="fa-solid fa-lock input-icon"></i>
                  <input 
                    type="password" 
                    class="form-control input-has-icon" 
                    [(ngModel)]="senhaInput" 
                    name="senha" 
                    placeholder="••••••••" 
                    required>
                </div>
              </div>

              <!-- Botão de Login com Cores do Cliente (#123D00) -->
              <button type="submit" class="btn btn-primary btn-block btn-login">
                <i class="fa-solid fa-right-to-bracket"></i> Acessar Plataforma
              </button>

              <div class="login-footer">
                <span class="support-text">Precisa de ajuda ou acesso? Contate a secretaria do QGU.</span>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .home-page {
      background-color: var(--bg-page);
      min-height: calc(100vh - 140px);
      display: flex;
      align-items: center;
      padding: 3rem 0;
    }

    .main-split-section {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 3.5rem;
      align-items: center;
    }

    @media (max-width: 992px) {
      .main-split-section {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
    }

    .header-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--color-olive-light);
      color: var(--color-green-02);
      border: 1px solid var(--color-olive-soft);
      padding: 0.4rem 0.9rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    .hero-title {
      font-size: 3.8rem;
      color: var(--color-green-01);
      line-height: 1;
      margin-bottom: 0.3rem;
    }

    .hero-subtitle {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-olive-soft);
      letter-spacing: 1px;
      margin-bottom: 1.25rem;
    }

    .hero-description {
      font-size: 1.05rem;
      color: var(--text-body);
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .atividades-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .atividade-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-left: 4px solid var(--color-green-01);
      padding: 1rem 1.25rem;
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
    }

    .atividade-card:hover {
      border-color: var(--color-olive-soft);
      transform: translateX(4px);
    }

    .atividade-icon {
      font-size: 1.4rem;
      color: var(--color-green-01);
      margin-top: 0.1rem;
    }

    .atividade-title {
      display: block;
      font-weight: 700;
      color: var(--color-green-02);
      font-size: 0.95rem;
    }

    .atividade-desc {
      font-size: 0.825rem;
      color: var(--text-muted);
    }

    /* Formulário de Login */
    .login-card {
      border: 2px solid var(--color-olive-soft);
      box-shadow: var(--shadow-hover);
      padding: 2.25rem;
      background-color: var(--bg-surface);
    }

    .login-card-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }

    .login-badge-icon {
      width: 54px;
      height: 54px;
      background-color: var(--color-green-02);
      color: var(--color-olive-soft);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      margin: 0 auto 1rem auto;
      box-shadow: var(--shadow-olive-glow);
    }

    .login-title {
      font-size: 2rem;
      color: var(--color-green-01);
    }

    .login-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .role-selector-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.4rem;
      background-color: var(--color-olive-light);
      padding: 4px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-olive);
    }

    .tab-role {
      background: none;
      border: none;
      padding: 0.5rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-green-02);
      border-radius: 4px;
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .tab-role.active {
      background-color: var(--color-green-01);
      color: var(--color-white);
    }

    .input-with-icon {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-olive-soft);
    }

    .input-has-icon {
      padding-left: 2.75rem;
    }

    .btn-block {
      width: 100%;
    }

    .btn-login {
      padding: 0.9rem;
      font-size: 1rem;
      letter-spacing: 0.5px;
      margin-top: 1rem;
    }

    .login-footer {
      text-align: center;
      margin-top: 1.25rem;
    }

    .support-text {
      font-size: 0.775rem;
      color: var(--text-muted);
    }
  `]
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
