import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * @description
 * Componente per la gestione del login utente.
 *
 * Permette all'utente di:
 * - Selezionare il proprio ruolo (medico o paziente).
 * - Inserire le credenziali di accesso.
 * - Effettuare l'autenticazione tramite chiamata API e venire reindirizzato
 *   alla dashboard corrispondente al ruolo scelto.
 */
@Component({
  selector: 'app-login',

  /** Rende il componente utilizzabile senza NgModule. */
  standalone: true,

  /** Moduli utilizzati all'interno del template. */
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  /** Indica la schermata attualmente visualizzata. */
  step: 'scelta' | 'credenziali' = 'scelta';

  /** Memorizza il ruolo selezionato dall'utente. */
  ruoloSelezionato: 'medico' | 'paziente' | null = null;

  /** Email inserita nel form di login. */
  email = '';

  /** Password inserita nel form di login. */
  password = '';

  /** Messaggio di errore mostrato all'utente. */
  errorMsg = '';

  /** Indica se la richiesta di login è in corso. */
  caricamento = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  /**
   * Salva il ruolo selezionato e aggiorna lo stato della schermata.
   * @param ruolo Ruolo scelto dall'utente ('medico' o 'paziente').
   */
  selezionaRuolo(ruolo: 'medico' | 'paziente') {
    this.ruoloSelezionato = ruolo;
    this.step = 'credenziali';
  }

  /**
   * Ripristina i valori iniziali del form, riportando l'utente
   * alla schermata di selezione del ruolo.
   */
  tornaIndietro() {
    this.step = 'scelta';
    this.email = '';
    this.password = '';
    this.errorMsg = '';
  }

  /**
   * Gestisce l'invio delle credenziali al server.
   *
   * @remarks
   * - Verifica che email e password siano state inserite.
   * - Esegue una richiesta POST verso l'endpoint `/auth/login`.
   * - In caso di successo, salva il token tramite `AuthService` e reindirizza
   *   l'utente verso `/medico` o `/paziente` in base al ruolo selezionato.
   * - In caso di errore, mostra un messaggio generico all'utente.
   */
  accedi() {

    /* Verifica che email e password siano state inserite. */
    if (!this.email || !this.password) {
      this.errorMsg = 'Inserisci email e password.';
      return;
    }

    this.caricamento = true;
    this.errorMsg = '';

    /* Oggetto contenente le credenziali da inviare. */
    const payload = {
      email: this.email,
      password: this.password
    };
    console.log('[LOGIN] invio payload', payload);

    /* Esegue la richiesta POST verso l'endpoint di login. */
    this.http.post<any>('http://localhost:3000/auth/login', payload).subscribe({

      /* Gestisce la risposta ricevuta in caso di successo. */
      next: (res) => {
        console.log('[LOGIN] risposta server', res);

        /* Salva il token ricevuto. */
        this.authService.login(res.token);
        this.caricamento = false;

        /* Reindirizza l'utente in base al ruolo selezionato. */
        if (this.ruoloSelezionato === 'medico') {
          this.router.navigate(['/medico']);
        } else {
          this.router.navigate(['/paziente']);
        }
      },

      /* Gestisce eventuali errori restituiti dalla richiesta. */
      error: (err) => {
        this.caricamento = false;
        this.errorMsg = 'Credenziali non valide. Riprova.';
        console.error('[LOGIN] Errore:', err);

        /* Mostra il contenuto dell'errore se disponibile. */
        if (err.error) {
          console.error('[LOGIN] Errore body:', err.error);
        }
      }
    });
  }
}
