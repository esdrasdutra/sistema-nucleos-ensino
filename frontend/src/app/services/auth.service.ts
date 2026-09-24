import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PerfilUsuario } from '../models/interfaces';

export interface UserSession {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  poloId?: number;
  poloNome?: string;
  alunoId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSIONS: Record<PerfilUsuario, UserSession> = {
    ADMIN: {
      id: 1,
      nome: 'Pr. Marcos Silva (Super Admin)',
      email: 'admin@denomimacao.org',
      perfil: 'ADMIN'
    },
    GESTOR_NUCLEO: {
      id: 2,
      nome: 'Pr. Carlos Eduardo',
      email: 'carlos.sp@denomimacao.org',
      perfil: 'GESTOR_NUCLEO',
      poloId: 1,
      poloNome: 'Núcleo Central São Paulo'
    },
    ALUNO: {
      id: 6,
      nome: 'Gabriel Santos',
      email: 'gabriel.santos@aluno.org',
      perfil: 'ALUNO',
      poloId: 1,
      poloNome: 'Núcleo Central São Paulo',
      alunoId: 1
    }
  };

  private currentSessionSubject = new BehaviorSubject<UserSession>(this.SESSIONS.ADMIN);
  public currentSession$ = this.currentSessionSubject.asObservable();

  // Signal reativo para o Angular 18
  public activeSessionSignal = signal<UserSession>(this.SESSIONS.ADMIN);

  switchProfile(perfil: PerfilUsuario) {
    const session = this.SESSIONS[perfil];
    if (session) {
      this.currentSessionSubject.next(session);
      this.activeSessionSignal.set(session);
    }
  }

  startGestorSession(session: UserSession) {
    this.currentSessionSubject.next(session);
    this.activeSessionSignal.set(session);
  }

  getCurrentSession(): UserSession {
    return this.currentSessionSubject.value;
  }
}
