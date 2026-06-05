
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal che contiene il ruolo corrente (null se non autenticato)
  userRole = signal<string | null>(localStorage.getItem('role'));

  // Metodo per aggiornare lo stato dopo il login (da chiamare col JWT del collega)
  login(token: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    this.userRole.set(role);
  }

  // Pulizia totale
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.userRole.set(null);
  }
}