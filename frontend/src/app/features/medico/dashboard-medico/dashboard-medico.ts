import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Paziente } from '../../../core/models/database.model';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { MedicoService } from '../medico.service';
import { Router } from '@angular/router';
import { RispostaAnalisiAI, RispostaTabellaAI, PianoSettimanaleAI } from '../../../core/models/outputAI.model';

@Component({
  selector: 'app-dashboard-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-medico.html',
  styleUrls: ['./dashboard-medico.css']
})
export class DashboardMedicoComponent implements OnInit {
  private authService = inject(AuthService);

  // pazienti: Paziente[] = [
  //   { id: 1, medico_id: 4, nome: 'Mario', cognome: 'Rossi', data_nascita: new Date('1985-04-12'), altezza: 178, obiettivo: 'Dimagrimento' },
  //   { id: 2, medico_id: 4, nome: 'Giulia', cognome: 'Bianchi', data_nascita: new Date('1992-11-23'), altezza: 165, obiettivo: 'Ipertrofia' },
  //   { id: 3, medico_id: 4, nome: 'Luca', cognome: 'Verdi', data_nascita: new Date('1978-07-05'), altezza: 180, obiettivo: 'Mantenimento' },
  //   { id: 4, medico_id: 4, nome: 'Chiara', cognome: 'Ferrari', data_nascita: new Date('1990-03-18'), altezza: 162, obiettivo: 'Dimagrimento' },
  //   { id: 5, medico_id: 4, nome: 'Alessandro', cognome: 'Ricci', data_nascita: new Date('1983-09-07'), altezza: 183, obiettivo: 'Ipertrofia' },
  //   { id: 6, medico_id: 4, nome: 'Francesca', cognome: 'Esposito', data_nascita: new Date('1995-01-30'), altezza: 168, obiettivo: 'Mantenimento' },
  //   { id: 7, medico_id: 4, nome: 'Davide', cognome: 'Colombo', data_nascita: new Date('1980-06-14'), altezza: 176, obiettivo: 'Dimagrimento' },
  //   { id: 8, medico_id: 4, nome: 'Sara', cognome: 'Marino', data_nascita: new Date('1998-12-02'), altezza: 170, obiettivo: 'Ipertrofia' },
  //   { id: 9, medico_id: 4, nome: 'Matteo', cognome: 'Greco', data_nascita: new Date('1975-08-21'), altezza: 174, obiettivo: 'Mantenimento' },
  //   { id: 10, medico_id: 4, nome: 'Valentina', cognome: 'Bruno', data_nascita: new Date('1993-05-09'), altezza: 160, obiettivo: 'Dimagrimento' },
  //   { id: 11, medico_id: 4, nome: 'Stefano', cognome: 'Conti', data_nascita: new Date('1987-02-25'), altezza: 181, obiettivo: 'Ipertrofia' },
  //   { id: 12, medico_id: 4, nome: 'Elena', cognome: 'Mancini', data_nascita: new Date('1996-10-11'), altezza: 166, obiettivo: 'Mantenimento' },
  // ];

  pazienti: Paziente[] = [];
  pazientiFiltrati: Paziente[] = [];
  pazienteSelezionatoId: number | null = null;
  pazienteSelezionato: Paziente | null = null;

  nuovaVisita = { bmi: 0.0, bf: 0.0 };
  caricamentoPiano: boolean = false;
  caricamentoAnalisi: boolean = false;
  pianoSalvatoDisponibile: boolean = false;
  testoAnalisiOllama: RispostaAnalisiAI | null = null;
  pianoAlimentareGenerato: PianoSettimanaleAI | null = null;

  giorniDellaSettimana = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  tipiPasto = ['Colazione', 'Pranzo', 'Merenda', 'Cena'] as const;

  peso: number | null = null;
  bmi: number = 0.0;
  bf: number = 0.0;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(
    private medicoService: MedicoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.pazientiFiltrati = this.pazienti;
    // Recuperiamo l'ID del medico connesso tramite l'AuthService
    const medicoId = this.authService.userId();

    if (medicoId !== null) {
      // Chiamata HTTP al database
      this.medicoService.getPazientiPerMedico(medicoId).subscribe({
        next: (datiDalDb: Paziente[]) => {
          console.log('[DASHBOARD MEDICO] Pazienti caricati dal DB:', datiDalDb);
          this.pazienti = datiDalDb;
          this.pazientiFiltrati = datiDalDb; // Popoliamo subito anche la lista filtrata per la sidebar
        },
        error: (err) => {
          console.error('[DASHBOARD MEDICO] Errore caricamento pazienti:', err);
          this.errorMsg = 'Impossibile caricare la lista pazienti dal database.';
        }
      });
    } else {
      // Se non c'è sessione attiva, rimanda al login di sicurezza
      this.router.navigate(['/auth/login']);
    }
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.pazientiFiltrati = this.pazienti.filter(p =>
      p.nome.toLowerCase().includes(query) ||
      p.cognome.toLowerCase().includes(query)
    );
  }

  selezionaPaziente(id: number): void {
    this.pazienteSelezionatoId = id;
    this.pazienteSelezionato = this.pazienti.find(p => p.id === id) || null;
    this.testoAnalisiOllama = null;
    this.pianoAlimentareGenerato = null;
    this.errorMsg = '';
    this.successMsg = '';
    this.peso = null;
    this.bmi = 0.0;
    this.bf = 0.0;

    this.medicoService.getPianoSalvato(id).subscribe({
      next: (res) => {
        console.log('[PIANO] trovato:', res);
        this.pianoSalvatoDisponibile = true;
      },
      error: (err) => {
        console.log('[PIANO] non trovato:', err.status);
        this.pianoSalvatoDisponibile = false;
      }
    });
  }

  private calcolaEta(dataNascitaInput: Date | string | undefined | null): number {
    if (!dataNascitaInput) return 0;
    const nascita = new Date(dataNascitaInput);
    const oggi = new Date();
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const mese = oggi.getMonth() - nascita.getMonth();
    if (mese < 0 || (mese === 0 && oggi.getDate() < nascita.getDate())) {
      eta--;
    }
    return eta;
  }

  calcolaParametriAutomatici(): void {
    const inputPeso = document.getElementById('peso') as HTMLInputElement;
    if (!inputPeso) return;

    const pesoDigitato = parseFloat(inputPeso.value);

    if (!pesoDigitato || pesoDigitato <= 0 || !this.pazienteSelezionato || !this.pazienteSelezionato.altezza) {
      this.peso = null;
      this.bmi = 0.0;
      this.bf = 0.0;
      return;
    }

    this.peso = pesoDigitato;
    const altezzaInMetri = this.pazienteSelezionato.altezza / 100;
    this.bmi = parseFloat((this.peso / (altezzaInMetri * altezzaInMetri)).toFixed(1));

    const eta = this.calcolaEta(this.pazienteSelezionato.data_nascita);
    const sessoFattore = 1;
    const bfCalcolata = (1.20 * this.bmi) + (0.23 * eta) - (10.8 * sessoFattore) - 5.4;
    this.bf = bfCalcolata > 0 ? parseFloat(bfCalcolata.toFixed(1)) : 0.0;

    this.nuovaVisita.bmi = this.bmi;
    this.nuovaVisita.bf = this.bf;
  }

  onGeneraTabella(): void {
    if (!this.pazienteSelezionatoId) return;
    this.caricamentoPiano = true;
    this.pianoAlimentareGenerato = null;

    this.medicoService.generaTabellaPiano(this.pazienteSelezionatoId).subscribe({
      next: (res: RispostaTabellaAI) => {
        console.log('[TABELLA] Piano generato e salvato nel DB');
        this.caricamentoPiano = false;
        this.pianoSalvatoDisponibile = true;
        alert('Piano generato e salvato! Clicca "Visualizza Piano" per vederlo.');
      },
      error: (err) => {
        console.error('[TABELLA] Errore:', err);
        alert('Errore durante la generazione del piano.');
        this.caricamentoPiano = false;
      }
    });
  }

  onAnalisiAndamento(): void {
    if (!this.pazienteSelezionatoId) return;
    this.caricamentoAnalisi = true;
    this.testoAnalisiOllama = null;

    this.medicoService.getAnalisiAndamento(this.pazienteSelezionatoId).subscribe({
      next: (res: RispostaAnalisiAI) => {
        console.log('[ANALISI] Risposta ricevuta:', res);
        this.testoAnalisiOllama = res;
        this.caricamentoAnalisi = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[ANALISI] Errore:', err);
        alert("Errore durante l'elaborazione dell'analisi clinica.");
        this.caricamentoAnalisi = false;
      }
    });
  }

  onVisualizzaPiano(): void {
    if (!this.pazienteSelezionatoId) return;
    this.medicoService.getPianoSalvato(this.pazienteSelezionatoId).subscribe({
      next: (res) => {
        this.pianoAlimentareGenerato = res.piano;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Nessun piano salvato per questo paziente. Genera prima la tabella.');
      }
    });
  }

  onSalvaVisita(event: Event): void {
    event.preventDefault();

    if (!this.pazienteSelezionatoId || !this.peso || this.peso <= 0) {
      this.errorMsg = 'Inserisci un peso valido prima di salvare.';
      this.successMsg = '';
      return;
    }

    const oggi = new Date();
    const dataVisita = oggi.toISOString().split('T')[0];

    const payload = {
      paziente_id: this.pazienteSelezionatoId,
      data_visita: dataVisita,
      peso: this.peso,
      bmi: this.bmi,
      bf: this.bf
    };

    this.medicoService.salvaVisita(payload).subscribe({
      next: (res) => {
        this.successMsg = 'Visita salvata con successo nel database!';
        this.errorMsg = '';
        this.peso = null;
        this.bmi = 0.0;
        this.bf = 0.0;
      },
      error: (err) => {
        this.errorMsg = "Errore durante il salvataggio della visita sul server.";
        this.successMsg = '';
        console.error(err);
      }
    });
  }

  aggiungiPaziente(): void { console.log('Azione: Nuovo Paziente'); }
  modificaPaziente(): void { console.log('Azione: Modifica', this.pazienteSelezionatoId); }

  eliminaPaziente(): void {
    if (this.pazienteSelezionatoId) {
      this.pazienti = this.pazienti.filter(p => p.id !== this.pazienteSelezionatoId);
      this.pazientiFiltrati = this.pazienti;
      this.pazienteSelezionatoId = null;
      this.pazienteSelezionato = null;
    }
  }

  getGiorni(): {giorno: string, dati: any}[] {
    if (!this.pianoAlimentareGenerato?.piano_settimanale) return [];
    return Object.entries(this.pianoAlimentareGenerato.piano_settimanale)
      .map(([giorno, dati]) => ({ giorno, dati }));
  }

  getPasti(datiGiorno: any): {tipo: string, alimenti: any[]}[] {
    if (!datiGiorno?.pasti) return [];
    return Object.entries(datiGiorno.pasti)
      .map(([tipo, alimenti]) => ({ tipo, alimenti: alimenti as any[] }));
  }

  logout() {
    console.log("Esecuzione Logout...");
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}