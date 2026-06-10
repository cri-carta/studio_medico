import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Aggiungi ChangeDetectorRef
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
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Recuperiamo l'ID utente decodificato dal token JWT
    const idNumerico = this.authService.userId();

    if (idNumerico !== null) {
      this.medicoService.getProfiloPaziente(idNumerico).subscribe({
        next: (dati: Paziente) => {
          this.paziente = dati; // I dati corrispondono alle colonne della tabella 'pazienti'

          // Chiamiamo la funzione connessa per scaricare il resto
          this.caricaDatiConnessi(dati.id);
        },
        error: (err) => {
          console.error("Errore recupero profilo", err);
          this.isLoading = false;
        }
      });
    } else {
      // Se non c'è traccia dell'ID, rimandalo al login per sicurezza
      this.router.navigate(['/auth/login']);
      this.isLoading = false;
    }
  }
// NUOVA FUNZIONE: Recupera la dieta e lo storico visite dal database
caricaDatiConnessi(pazienteId: number): void {
  console.log("1. Entrato in caricaDatiConnessi per Paziente ID:", pazienteId);
  this.medicoService.getPianoCompletoPaziente(pazienteId).subscribe({
    next: (vociPiano: PianoVoce[]) => {
      console.log("2. Il server ha risposto per il Piano Alimentare:", vociPiano);
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

      // Recupera l'elenco delle visite passate SOLO DOPO o in parallelo 
      // per la sezione progressi ma spegniamo l'isLoading qui quando la struttura 
      // è renderizzata
      console.log("3. Sto per chiamare lo Storico Visite...");
      this.medicoService.getStoricoVisite(pazienteId).subscribe({
        next: (visite: Visita[]) => {
          console.log("4. Il server ha risposto per le Visite:", visite);
          this.storicoVisite = visite;
          this.calcolaProgressi(visite);

          // ACCENSIONE VERDE: Tutti i dati (Profilo + Piano + Visite) sono nel componente.
          // Ora possiamo sbloccare la pagina in totale sicurezza!
          console.log("5. DISATTIVO CARICAMENTO ORA!");
          this.isLoading = false;
          // Forza Angular a renderizzare istantaneamente l'anagrafica saltando i blocchi pendenti
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error("Errore recupero storico visite", err);
          this.isLoading = false;
        }
      });
    },
    error: (err: any) => {
      console.error("Errore recupero piano alimentare", err);
      this.isLoading = false;
    }
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