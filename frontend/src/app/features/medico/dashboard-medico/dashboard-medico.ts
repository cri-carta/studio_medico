import { CommonModule } from '@angular/common';
import { Paziente } from '../../../core/models/database.model';
import { Component, OnInit, inject } from '@angular/core'; // 1. Aggiungi inject
import { AuthService } from '../../../core/auth/auth.service'; // 2. Importa il servizio
import { MedicoService } from '../medico.service';
import { RispostaAnalisiAI, RispostaTabellaAI } from '../../../core/models/outputAI.model';

@Component({
  selector: 'app-dashboard-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-medico.html',
  styleUrls: ['./dashboard-medico.css']
})

export class DashboardMedicoComponent implements OnInit {
  // 3. Inietta il servizio
  private authService = inject(AuthService); //test

  pazienti: Paziente[] = [
    { id: 1, medico_id: 4, nome: 'Mario', cognome: 'Rossi', data_nascita: new Date('1985-04-12'), altezza: 178, obiettivo: 'Dimagrimento' },
    { id: 2, medico_id: 4, nome: 'Giulia', cognome: 'Bianchi', data_nascita: new Date('1992-11-23'), altezza: 165, obiettivo: 'Ipertrofia' },
    { id: 3, medico_id: 4, nome: 'Luca', cognome: 'Verdi', data_nascita: new Date('1978-07-05'), altezza: 180, obiettivo: 'Mantenimento' },
    { id: 4, medico_id: 4, nome: 'Chiara', cognome: 'Ferrari', data_nascita: new Date('1990-03-18'), altezza: 162, obiettivo: 'Dimagrimento' },
    { id: 5, medico_id: 4, nome: 'Alessandro', cognome: 'Ricci', data_nascita: new Date('1983-09-07'), altezza: 183, obiettivo: 'Ipertrofia' },
    { id: 6, medico_id: 4, nome: 'Francesca', cognome: 'Esposito', data_nascita: new Date('1995-01-30'), altezza: 168, obiettivo: 'Mantenimento' },
    { id: 7, medico_id: 4, nome: 'Davide', cognome: 'Colombo', data_nascita: new Date('1980-06-14'), altezza: 176, obiettivo: 'Dimagrimento' },
    { id: 8, medico_id: 4, nome: 'Sara', cognome: 'Marino', data_nascita: new Date('1998-12-02'), altezza: 170, obiettivo: 'Ipertrofia' },
    { id: 9, medico_id: 4, nome: 'Matteo', cognome: 'Greco', data_nascita: new Date('1975-08-21'), altezza: 174, obiettivo: 'Mantenimento' },
    { id: 10, medico_id: 4, nome: 'Valentina', cognome: 'Bruno', data_nascita: new Date('1993-05-09'), altezza: 160, obiettivo: 'Dimagrimento' },
    { id: 11, medico_id: 4, nome: 'Stefano', cognome: 'Conti', data_nascita: new Date('1987-02-25'), altezza: 181, obiettivo: 'Ipertrofia' },
    { id: 12, medico_id: 4, nome: 'Elena', cognome: 'Mancini', data_nascita: new Date('1996-10-11'), altezza: 166, obiettivo: 'Mantenimento' },
    { id: 9, medico_id: 4, nome: 'Matteo', cognome: 'Greco', data_nascita: new Date('1975-08-21'), altezza: 174, obiettivo: 'Mantenimento' },
    { id: 10, medico_id: 4, nome: 'Valentina', cognome: 'Bruno', data_nascita: new Date('1993-05-09'), altezza: 160, obiettivo: 'Dimagrimento' },
    { id: 11, medico_id: 4, nome: 'Stefano', cognome: 'Conti', data_nascita: new Date('1987-02-25'), altezza: 181, obiettivo: 'Ipertrofia' },
    { id: 12, medico_id: 4, nome: 'Elena', cognome: 'Mancini', data_nascita: new Date('1996-10-11'), altezza: 166, obiettivo: 'Mantenimento' }
  ];

  pazientiFiltrati: Paziente[] = [];    
  pazienteSelezionatoId: number | null = null; // Tiene traccia dell'ID del paziente attualmente selezionato nella colonna di sinistra  
  pazienteSelezionato: Paziente | null = null; // Variabile che contiene l'oggetto completo del paziente da mostrare a destra

  // VARIABILI DI STATO PER IL TASK
  caricamentoPiano: boolean = false;
  caricamentoAnalisi: boolean = false;
  testoAnalisiOllama: RispostaAnalisiAI | null = null;
  pianoAlimentareGenerato: RispostaTabellaAI | null = null;

  // Array di utilità per ciclare i giorni ordinati nell'HTML
  giorniDellaSettimana = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  tipiPasto = ['Colazione', 'Pranzo', 'Merenda', 'Cena'];

  // Oggetto di appoggio per il Form Nuova Visita
  nuovaVisita = {
    peso: 0,
    bmi: 0,
    bf: 0
  };

  // Iniezione del servizio tramite costruttore
  constructor(private medicoService: MedicoService) {}

  ngOnInit(): void {
    // 4. TEST DI SIMULAZIONE:
    // Forza il login come 'medico' per testare se le Guardie ti fanno passare
    this.authService.login('token-di-test-123', 'medico');
    this.pazientiFiltrati = this.pazienti;
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
    // Resetta i vecchi output e i campi del form al cambio paziente
    this.testoAnalisiOllama = null;
    this.pianoAlimentareGenerato = null;
    this.nuovaVisita = { peso: 0, bmi: 0, bf: 0 };
  }

  calcolaBmiBf(event: Event, field: string): void {
  const inputVal = parseFloat((event.target as HTMLInputElement).value);
  if (!inputVal || !this.pazienteSelezionato?.altezza) return;

  this.nuovaVisita.peso = inputVal;
  
  // Formula standard: BMI = peso / (altezza_metri ^ 2)
  const altezzaMetri = this.pazienteSelezionato.altezza / 100;
  this.nuovaVisita.bmi = this.nuovaVisita.peso / (altezzaMetri * altezzaMetri);

  // Formula stimata della Body Fat (BF)
  this.nuovaVisita.bf = (1.20 * this.nuovaVisita.bmi) - 5; 
}

  // TASK A: Tasto "Genera tabella" -> /api/rag/tabella
  onGeneraTabella(): void {
    if (!this.pazienteSelezionatoId) return;    
    this.caricamentoPiano = true;
    this.pianoAlimentareGenerato = null; // Resetta vecchi dati

    // Il servizio chiamerà la rotta Express passandogli il pazienteId
    this.medicoService.generaTabellaPiano(this.pazienteSelezionatoId).subscribe({
      next: (res: RispostaTabellaAI) => {
        this.pianoAlimentareGenerato = res;
        this.caricamentoPiano = false;
      },
      error: (err) => {
        console.error(err);
        alert('Errore durante la generazione del piano con il RAG.');
        this.caricamentoPiano = false;
      }
    });
  }

  // TASK B: Tasto "Analisi andamento" -> /api/rag/analisi/:id
  onAnalisiAndamento(): void {
    if (!this.pazienteSelezionatoId) return;
    this.caricamentoAnalisi = true;
    this.testoAnalisiOllama = null; // Resetta vecchi dati

    // Il servizio invia l'ID; Express estrapolerà l'anagrafica del paziente, 
    // la sua prima visita storica e l'ultima registrata per fornirle al file Python
    this.medicoService.getAnalisiAndamento(this.pazienteSelezionatoId).subscribe({
      next: (res: RispostaAnalisiAI) => {
        this.testoAnalisiOllama = res;
        this.caricamentoAnalisi = false;
      },
      error: (err) => {
        console.error(err);
        alert("Errore durante l'elaborazione dell'analisi clinica.");
        this.caricamentoAnalisi = false;
      }
    });
  }

  // TASK C: Form "Effettua visita" -> POST /api/visite
  onSalvaVisita(event: Event): void {
    event.preventDefault(); // Blocca il refresh nativo della pagina
    if (!this.pazienteSelezionatoId || this.nuovaVisita.peso <= 0) return;

    const payload = {
      paziente_id: this.pazienteSelezionatoId,
      medico_id: 4, // Il medico loggato ricavato dal DB
      data_visita: new Date().toISOString().split('T')[0], // Data odierna YYYY-MM-DD
      peso: this.nuovaVisita.peso,
      bmi: this.nuovaVisita.bmi,
      bf: this.nuovaVisita.bf
    };

    this.medicoService.salvaVisita(payload).subscribe({
      next: (res) => {
        alert('Visita salvata con successo nel database!');
        // Svuota il form
        (event.target as HTMLFormElement).reset();
        this.nuovaVisita = { peso: 0, bmi: 0, bf: 0 };
      },
      error: (err) => {
        console.error(err);
        alert("Errore durante il salvataggio della visita.");
      }
    });
  }

  // CRUD pulsanti in basso
  aggiungiPaziente(): void {
    console.log('Azione: Apertura form/modale per Nuovo Paziente');
  }

  modificaPaziente(): void {
    if (this.pazienteSelezionatoId) {
      console.log('Azione: Modifica dati del paziente con ID:', this.pazienteSelezionatoId);
    }
  }

  eliminaPaziente(): void {
    if (this.pazienteSelezionatoId) {
      console.log('Azione: Elimina definitivo dal database del paziente ID:', this.pazienteSelezionatoId);
      // Logica per rimuovere l'elemento dall'array (finto) per feedback visivo immediato
      this.pazienti = this.pazienti.filter(p => p.id !== this.pazienteSelezionatoId);
      this.pazientiFiltrati = this.pazienti;
      this.pazienteSelezionatoId = null;
      this.pazienteSelezionato = null;
    }
  }
}