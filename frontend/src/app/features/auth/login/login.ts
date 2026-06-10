import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  step: 'scelta' | 'credenziali' = 'scelta';
  ruoloSelezionato: 'medico' | 'paziente' | null = null;

  email = '';
  password = '';
  errorMsg = '';
  caricamento = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
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

    this.caricamento = true;
    this.errorMsg = '';

    const payload = {
      email: this.email,
      password: this.password
    };
    console.log('[LOGIN] invio payload', payload);

    this.http.post<any>('http://localhost:3000/auth/login', payload).subscribe({
      next: (res) => {
        console.log('[LOGIN] risposta server', res);
        this.authService.login(res.token);
        this.caricamento = false;

        if (this.ruoloSelezionato === 'medico') {
          this.router.navigate(['/medico']);
        } else {
          this.router.navigate(['/paziente']);
        }
      },
      error: (err) => {
        this.caricamento = false;
        this.errorMsg = 'Credenziali non valide. Riprova.';
        console.error('[LOGIN] Errore:', err);
        if (err.error) {
          console.error('[LOGIN] Errore body:', err.error);
        }
      }
    });
  }
}