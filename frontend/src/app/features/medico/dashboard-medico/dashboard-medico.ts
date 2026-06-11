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

  peso: number | null = null;
  bmi: number = 0.0;
  bf: number = 0.0;
  dataVisita: string = new Date().toISOString().split('T')[0];
  oggi: string = new Date().toISOString().split('T')[0];
  errorMsg: string = '';
  successMsg: string = '';

  dataNascitaEdit: string = '';
  modalitaModifica: boolean = false;
  modalitaAggiungi: boolean = false;
  usernameNuovoPaziente: string = '';

  toastMsg: string = '';
  toastTipo: 'success' | 'error' | 'info' = 'success';
  toastVisible: boolean = false;

  nuovoPaziente = {
    email: '',
    password: '',
    nome: '',
    cognome: '',
    data_nascita: '',
    altezza: null as number | null,
    obiettivo: '',
    anamnesi: '',
    peso: null as number | null,
    bmi: 0,
    bf: 0
  };

  constructor(
    private medicoService: MedicoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  mostraToast(msg: string, tipo: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMsg = msg;
    this.toastTipo = tipo;
    this.toastVisible = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  ngOnInit(): void {
    this.medicoService.getMedicoDelLogin().subscribe({
      next: (medico) => {
        this.medicoService.getPazientiPerMedico(medico.id).subscribe({
          next: (datiDalDb: Paziente[]) => {
            const pazientiFormattati = datiDalDb.map((p): Paziente => ({
              ...p,
              data_nascita: p.data_nascita ? new Date(p.data_nascita) : undefined
            }));
            this.pazienti = pazientiFormattati;
            this.pazientiFiltrati = pazientiFormattati;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('[DASHBOARD MEDICO] Errore caricamento pazienti:', err);
            this.errorMsg = 'Impossibile caricare la lista pazienti dal database.';
          }
        });
      },
      error: (err) => {
        console.error('[DASHBOARD MEDICO] Errore recupero medico:', err);
        this.router.navigate(['/auth/login']);
      }
    });
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
    this.dataVisita = new Date().toISOString().split('T')[0];

    this.medicoService.getPianoSalvato(id).subscribe({
      next: (res) => { this.pianoSalvatoDisponibile = true; },
      error: (err) => { this.pianoSalvatoDisponibile = false; }
    });
  }

  private calcolaEta(dataNascitaInput: Date | string | undefined | null): number {
    if (!dataNascitaInput) return 0;
    const nascita = new Date(dataNascitaInput);
    const oggi = new Date();
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const mese = oggi.getMonth() - nascita.getMonth();
    if (mese < 0 || (mese === 0 && oggi.getDate() < nascita.getDate())) eta--;
    return eta;
  }

  calcolaParametriAutomatici(): void {
    const inputPeso = document.getElementById('peso') as HTMLInputElement;
    if (!inputPeso) return;
    const pesoDigitato = parseFloat(inputPeso.value);
    if (!pesoDigitato || pesoDigitato <= 0 || !this.pazienteSelezionato || !this.pazienteSelezionato.altezza) {
      this.peso = null;
      this.bmi = 0.0;
      return;
    }
    this.peso = pesoDigitato;
    const altezzaInMetri = this.pazienteSelezionato.altezza / 100;
    this.bmi = parseFloat((this.peso / (altezzaInMetri * altezzaInMetri)).toFixed(1));
    this.nuovaVisita.bmi = this.bmi;
  }

  onGeneraTabella(): void {
    if (!this.pazienteSelezionatoId) return;
    this.caricamentoPiano = true;
    this.pianoAlimentareGenerato = null;

    this.medicoService.generaTabellaPiano(this.pazienteSelezionatoId).subscribe({
      next: (res: RispostaTabellaAI) => {
        this.caricamentoPiano = false;
        this.pianoSalvatoDisponibile = true;
        this.mostraToast('Piano generato e salvato! Clicca "Visualizza Piano" per vederlo. 🍏', 'info');
      },
      error: (err) => {
        this.mostraToast('Errore durante la generazione del piano.', 'error');
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
        this.testoAnalisiOllama = res;
        this.caricamentoAnalisi = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mostraToast("Errore durante l'elaborazione dell'analisi clinica.", 'error');
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
        this.mostraToast('Nessun piano salvato per questo paziente. Genera prima la tabella.', 'error');
      }
    });
  }

  onSalvaVisita(event: Event): void {
    event.preventDefault();

    if (!this.pazienteSelezionatoId || !this.peso || this.peso <= 0) {
      this.errorMsg = 'Inserisci un peso valido prima di salvare.';
      this.successMsg = '';
      this.cdr.detectChanges();
      return;
    }

    const payload = {
      paziente_id: this.pazienteSelezionatoId,
      data_visita: this.dataVisita,
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
        this.dataVisita = new Date().toISOString().split('T')[0];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = "Errore durante il salvataggio della visita sul server.";
        this.successMsg = '';
        this.cdr.detectChanges();
      }
    });
  }

  aggiungiPaziente(): void {
    this.modalitaAggiungi = true;
    this.usernameNuovoPaziente = '';
    this.nuovoPaziente = {
      email: '', password: '', nome: '', cognome: '',
      data_nascita: '', altezza: null, obiettivo: '',
      anamnesi: '', peso: null, bmi: 0, bf: 0
    };
  }

  chiudiAggiungi(): void {
    this.modalitaAggiungi = false;
  }

  onUsernameChange(): void {
    this.nuovoPaziente.email = this.usernameNuovoPaziente + '@email.it';
  }

  calcolaBmiBfNuovoPaziente(): void {
    if (!this.nuovoPaziente.peso || !this.nuovoPaziente.altezza) return;
    const altezzaM = this.nuovoPaziente.altezza / 100;
    this.nuovoPaziente.bmi = parseFloat((this.nuovoPaziente.peso / (altezzaM * altezzaM)).toFixed(1));
  }

  salvaNuovoPaziente(): void {
    if (!this.nuovoPaziente.email || !this.nuovoPaziente.password ||
        !this.nuovoPaziente.nome || !this.nuovoPaziente.cognome ||
        !this.nuovoPaziente.peso) {
      this.mostraToast('Compila tutti i campi obbligatori (username, password, nome, cognome, peso).', 'error');
      return;
    }

    if (this.nuovoPaziente.altezza && (this.nuovoPaziente.altezza < 90 || this.nuovoPaziente.altezza > 230)) {
      this.mostraToast('Altezza non valida. Inserisci un valore tra 90 e 230 cm.', 'error');
      return;
    }

    if (this.nuovoPaziente.peso && (this.nuovoPaziente.peso < 1 || this.nuovoPaziente.peso > 250)) {
      this.mostraToast('Peso non valido. Inserisci un valore tra 1 e 250 kg.', 'error');
      return;
    }

    this.medicoService.registraUtentePaziente(
      this.nuovoPaziente.email,
      this.nuovoPaziente.password
    ).subscribe({
      next: (resUtente) => {
        const utente_id = resUtente.id;
        this.medicoService.getMedicoDelLogin().subscribe({
          next: (medico) => {
            this.medicoService.creaPaziente({
              utente_id,
              medico_id: medico.id,
              nome: this.nuovoPaziente.nome,
              cognome: this.nuovoPaziente.cognome,
              data_nascita: this.nuovoPaziente.data_nascita,
              altezza: this.nuovoPaziente.altezza,
              obiettivo: this.nuovoPaziente.obiettivo,
              anamnesi: this.nuovoPaziente.anamnesi,
              peso: this.nuovoPaziente.peso,
              bmi: this.nuovoPaziente.bmi,
              bf: this.nuovoPaziente.bf
            }).subscribe({
              next: () => {
                this.modalitaAggiungi = false;
                this.medicoService.getMedicoDelLogin().subscribe({
                  next: (med) => {
                    this.medicoService.getPazientiPerMedico(med.id).subscribe({
                      next: (dati) => {
                        this.pazienti = dati.map(p => ({
                          ...p,
                          data_nascita: p.data_nascita ? new Date(p.data_nascita) : undefined
                        }));
                        this.pazientiFiltrati = this.pazienti;
                        this.cdr.detectChanges();
                        this.mostraToast('Paziente aggiunto con successo! ✅');
                      },
                      error: (err) => {
                        this.mostraToast('Paziente creato ma errore nel ricaricamento lista.', 'error');
                      }
                    });
                  }
                });
              },
              error: (err) => {
                this.mostraToast('Errore creazione paziente: ' + err.error?.error, 'error');
              }
            });
          },
          error: (err) => {
            this.mostraToast('Errore recupero medico: ' + err.error?.error, 'error');
          }
        });
      },
      error: (err) => {
        this.mostraToast('Errore creazione utente: ' + err.error?.error, 'error');
      }
    });
  }

  modificaPaziente(): void {
    if (!this.pazienteSelezionato) return;
    this.modalitaModifica = true;
    if (this.pazienteSelezionato.data_nascita) {
      this.dataNascitaEdit = new Date(this.pazienteSelezionato.data_nascita).toISOString().split('T')[0];
    }
  }

  chiudiModifica(): void {
    this.modalitaModifica = false;
  }

  salvaModifichePaziente(): void {
    if (!this.pazienteSelezionato) return;
    this.pazienteSelezionato.data_nascita = this.dataNascitaEdit;
    this.medicoService.updatePaziente(
      this.pazienteSelezionato.id,
      this.pazienteSelezionato
    ).subscribe({
      next: () => {
        this.modalitaModifica = false;
        this.cdr.detectChanges();
        this.mostraToast('Paziente aggiornato con successo! ✅');
      },
      error: (err: any) => {
        this.mostraToast('Errore aggiornamento paziente.', 'error');
      }
    });
  }

  eliminaPaziente(): void {
    if (!this.pazienteSelezionatoId) return;

    const conferma = confirm('Vuoi davvero eliminare questo paziente?');
    if (!conferma) return;

    this.medicoService.deletePaziente(this.pazienteSelezionatoId).subscribe({
      next: () => {
        this.pazienti = this.pazienti.filter(p => p.id !== this.pazienteSelezionatoId);
        this.pazientiFiltrati = this.pazienti;
        this.pazienteSelezionatoId = null;
        this.pazienteSelezionato = null;
        this.mostraToast('Paziente eliminato 🗑️', 'error');
      },
      error: (err) => {
        this.mostraToast('Errore eliminazione paziente.', 'error');
      }
    });
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
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}