import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paziente } from '../../../core/models/database.model';
import { MedicoService } from '../../medico/medico.service';
import { Router } from '@angular/router'; // Inserito per gestire il reindirizzamento al logout
import { VisualizzaPianoComponent } from '../visualizza-piano/visualizza-piano';
@Component({
  selector: 'app-dashboard-paziente',
  standalone: true,
  imports: [CommonModule, VisualizzaPianoComponent],
  templateUrl: './dashboard-paziente.html',
  styleUrls: ['./dashboard-paziente.css']
})

export class DashboardPazienteComponent implements OnInit {
  paziente: Paziente | null = null;
  vistaAttiva: 'tabella' | 'progressi' = 'tabella';
  isLoading: boolean = true;
  pianoStrutturato: any = {};
  storicoVisite: any[] = [];

  giorniChiave = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
  pastiChiave = ['colazione', 'pranzo', 'spuntino', 'cena'];

  constructor(
    private medicoService: MedicoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Recuperiamo la stringa salvata nel browser al momento del login
    const stringaUtenteId = localStorage.getItem('utenteId');

    // 2. Se esiste, facciamo il cast a numero e chiamiamo il backend
    if (stringaUtenteId) {
      const idNumerico = Number(stringaUtenteId);

      this.medicoService.getProfiloPaziente(idNumerico).subscribe({
        next: (dati) => {
          this.paziente = dati; // I dati corrispondono alle colonne della tabella 'pazienti'
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Errore recupero profilo", err);
          this.isLoading = false;
        }
      });
    } else {
      // Se non c'è traccia dell'ID (es. localStorage svuotato), rimandalo al login per sicurezza
      this.router.navigate(['/login']);
    }
  }
// NUOVA FUNZIONE: Recupera la dieta e lo storico visite dal database
caricaDatiConnessi(pazienteId: number): void {
  this.medicoService.getPianoCompletoPaziente(pazienteId).subscribe({
    next: (vociPiano) => {
      this.inizializzaMappaVuota();

      vociPiano.forEach(voce => {
        // ========================================================
        // QUI C'È IL "PUNTO 2": Protezione per maiuscole e spazi
        // ========================================================
        const g = voce.giorno.toLowerCase().trim();
        const p = voce.tipo_pasto.toLowerCase().trim();

        if (this.pianoStrutturato[g] && this.pianoStrutturato[g][p]) {
          this.pianoStrutturato[g][p].push(voce);
        }
      });

      // Spegniamo il caricamento solo quando i dati della tabella sono pronti
      this.isLoading = false;
    },
    error: (err) => {
      console.error("Errore recupero piano alimentare", err);
      this.isLoading = false;
    }
  });

  // Recupera anche l'elenco delle visite passate per la sezione progressi
  this.medicoService.getStoricoVisite(pazienteId).subscribe({
    next: (visite) => {
      this.storicoVisite = visite;
    },
    error: (err) => console.error("Errore recupero storico visite", err)
  });
}

// NUOVA FUNZIONE: Genera la struttura iniziale ad albero vuota
private inizializzaMappaVuota(): void {
  this.giorniChiave.forEach(g => {
    this.pianoStrutturato[g] = {};
    this.pastiChiave.forEach(p => {
      this.pianoStrutturato[g][p] = [];
    });
  });
}


  setVista(tipo: 'tabella' | 'progressi') {
    this.vistaAttiva = tipo;
  }

  logout() {
    console.log("Esecuzione Logout...");
    localStorage.clear(); // Svuota i dati di sessione (token, ruolo, utenteId)
    this.router.navigate(['/login']); // Reindirizza l'utente alla pagina di login
  }
}