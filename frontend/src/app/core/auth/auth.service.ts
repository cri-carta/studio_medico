import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService { // <--- Importante: "export" qui
  userRole = signal<string | null>(localStorage.getItem('role'));

  login(token: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    this.userRole.set(role);
  }

  logout() {
    localStorage.clear();
    this.userRole.set(null);
  }
}