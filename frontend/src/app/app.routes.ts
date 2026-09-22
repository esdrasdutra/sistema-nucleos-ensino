import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PolosComponent } from './components/polos/polos.component';
import { ChamadaComponent } from './components/chamada/chamada.component';
import { AvaliacoesComponent } from './components/avaliacoes/avaliacoes.component';
import { PortalAlunoComponent } from './components/portal-aluno/portal-aluno.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'polos', component: PolosComponent },
  { path: 'chamada', component: ChamadaComponent },
  { path: 'avaliacoes', component: AvaliacoesComponent },
  { path: 'portal-aluno', component: PortalAlunoComponent },
  { path: '**', redirectTo: 'home' }
];
