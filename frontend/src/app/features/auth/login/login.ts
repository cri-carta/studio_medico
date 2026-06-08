import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service'; // Percorso corretto da questa cartella

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  step: 'scelta' | 'credenziali' = 'scelta';
  ruoloSelezionato: 'medico' | 'paziente' | null = null;

  email = '';
  password = '';
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selezionaRuolo(ruolo: 'medico' | 'paziente') {
    this.ruoloSelezionato = ruolo;
    this.step = 'credenziali';
  }

  tornaIndietro() {
    this.step = 'scelta';
    this.email = '';
    this.password = '';
    this.errorMsg = '';
  }

  accedi() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Inserisci email e password.';
      return;
    }

    // Per ora token mock, poi sostituisci con chiamata HTTP reale
    const token = this.ruoloSelezionato === 'medico'
      ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRG90dG9yIFJvc3NpIiwicm9sZSI6Im1lZGljbyJ9.dummy_signature'
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiUGF6aWVudGUgVGVzdCIsInJvbGUiOiJwYXppZW50ZSJ9.dummy_signature';

    this.authService.login(token);

    if (this.ruoloSelezionato === 'medico') {
      this.router.navigate(['/medico']);
    } else {
      this.router.navigate(['/paziente']);
    }
  }
}