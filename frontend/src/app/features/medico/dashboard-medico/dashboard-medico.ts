import { CommonModule } from '@angular/common';
import { Paziente } from '../../../core/models/database.model';
import { Component, OnInit, inject } from '@angular/core'; // 1. Aggiungi inject
import { AuthService } from '../../../core/auth/auth.service'; // 2. Importa il servizio
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
  
  // Tiene traccia dell'ID del paziente attualmente selezionato nella colonna di sinistra
  pazienteSelezionatoId: number | null = null;

  // Variabile che contiene l'oggetto completo del paziente da mostrare a destra
  pazienteSelezionato: Paziente | null = null;

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