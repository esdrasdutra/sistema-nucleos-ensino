import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="app-layout">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <footer class="app-footer">
        <div class="container footer-content">
          <p>© 2026 Denominação Cristã — Sistema de Gestão de Núcleos de Ensino & Polos EAD.</p>
          <span class="footer-tagline">Desenvolvido com excelência técnica e fidelidade de marca.</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--bg-page);
    }

    .main-content {
      flex: 1;
      background-color: var(--bg-page);
    }

    .app-footer {
      background-color: var(--color-green-02);
      color: rgba(255, 255, 255, 0.8);
      padding: 1.5rem 0;
      border-top: 3px solid var(--color-olive-soft);
      font-size: 0.85rem;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-tagline {
      color: var(--color-olive-soft);
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
    }
  `]
})
export class AppComponent {}
