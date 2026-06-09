import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paziente } from '../../../core/models/database.model';
import { MedicoService, PianoVoce, Visita } from '../../medico/medico.service';
import { Router } from '@angular/router'; // Inserito per gestire il reindirizzamento al logout
import { AuthService } from '../../../core/auth/auth.service';
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
  pianoStrutturato: Record<string, Record<string, PianoVoce[]>> = {};
  storicoVisite: Visita[] = [];
  progressSummary = {
    primoPeso: 0,
    ultimoPeso: 0,
    pesoDelta: 0,
    primoBMI: 0,
    ultimoBMI: 0,
    bmiDelta: 0,
    primoBF: 0,
    ultimoBF: 0,
    bfDelta: 0,
    dataInizio: '',
    dataFine: ''
  };

  giorniChiave = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
  pastiChiave = ['colazione', 'pranzo', 'spuntino', 'cena'];

  constructor(
    private medicoService: MedicoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Recuperiamo l'ID utente decodificato dal token JWT
    const idNumerico = this.authService.userId();

    if (idNumerico !== null) {
      this.medicoService.getProfiloPaziente(idNumerico).subscribe({
        next: (dati: Paziente) => {
          this.paziente = dati; // I dati corrispondono alle colonne della tabella 'pazienti'
          this.caricaDatiConnessi(dati.id);
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Errore recupero profilo", err);
          this.isLoading = false;
        }
      });
    } else {
      // Se non c'è traccia dell'ID, rimandalo al login per sicurezza
      this.router.navigate(['/auth/login']);
    }
  }
// NUOVA FUNZIONE: Recupera la dieta e lo storico visite dal database
caricaDatiConnessi(pazienteId: number): void {
  this.medicoService.getPianoCompletoPaziente(pazienteId).subscribe({
    next: (vociPiano: PianoVoce[]) => {
      this.inizializzaMappaVuota();

      vociPiano.forEach((voce: PianoVoce) => {
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
    error: (err: any) => {
      console.error("Errore recupero piano alimentare", err);
      this.isLoading = false;
    }
  });

  // Recupera anche l'elenco delle visite passate per la sezione progressi
  this.medicoService.getStoricoVisite(pazienteId).subscribe({
    next: (visite: Visita[]) => {
      this.storicoVisite = visite;
      this.calcolaProgressi(visite);
    },
    error: (err: any) => console.error("Errore recupero storico visite", err)
  });
}

private calcolaProgressi(visite: Visita[]): void {
  if (!visite || visite.length < 2) {
    return;
  }

  const sorted = [...visite].sort(
    (a, b) => new Date(a.data_visita).getTime() - new Date(b.data_visita).getTime()
  );

  const primo = sorted[0];
  const ultimo = sorted[sorted.length - 1];

  this.progressSummary = {
    primoPeso: primo.peso,
    ultimoPeso: ultimo.peso,
    pesoDelta: Number((ultimo.peso - primo.peso).toFixed(1)),
    primoBMI: primo.bmi,
    ultimoBMI: ultimo.bmi,
    bmiDelta: Number((ultimo.bmi - primo.bmi).toFixed(1)),
    primoBF: primo.bf,
    ultimoBF: ultimo.bf,
    bfDelta: Number((ultimo.bf - primo.bf).toFixed(1)),
    dataInizio: primo.data_visita,
    dataFine: ultimo.data_visita
  };
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
    this.router.navigate(['/auth/login']); // Reindirizza l'utente alla pagina di login
  }
}