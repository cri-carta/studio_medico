import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service'; // Percorso corretto da questa cartella

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h2>🩺 Studio Medico - Login di Test</h2>
      <p>Usa i pulsanti qui sotto per simulare l'accesso rapido con i JWT:</p>

      <div style="margin-top: 20px;">
        <button (click)="loginComeMedico()" style="padding: 10px 20px; margin: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Accedi come MEDICO
        </button>

        <button (click)="loginComePaziente()" style="padding: 10px 20px; margin: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Accedi come PAZIENTE
        </button>
      </div>
    </div>
  `
})
export class LoginComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  loginComeMedico() {
    // Questo è il token mock che contiene "role": "medico"
    const tokenMedico = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRG90dG9yIFJvc3NpIiwicm9sZSI6Im1lZGljbyJ9.dummy_signature';

    this.authService.login(tokenMedico); // Passiamo 1 solo argomento come richiesto!
    this.router.navigate(['/medico/dashboard']);
  }

  loginComePaziente() {
    // Questo è il token mock che contiene "role": "paziente"
    const tokenPaziente = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiUGF6aWVudGUgVGVzdCIsInJvbGUiOiJwYXppZW50ZSJ9.dummy_signature';

    this.authService.login(tokenPaziente); // Passiamo 1 solo argomento come richiesto!
    this.router.navigate(['/paziente']);
  }
}