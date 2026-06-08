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
    { id: 3, medico_id: 4, nome: 'Luca', cognome: 'Verdi', data_nascita: new Date('1978-07-05'), altezza: 180, obiettivo: 'Mantenimento' }
  ];

  pazientiFiltrati: Paziente[] = [];

  // Tiene traccia del paziente attualmente selezionato nella colonna di sinistra
  pazienteSelezionatoId: number | null = null;

  ngOnInit(): void {
    // 4. TEST DI SIMULAZIONE:
    // Forza il login come 'medico' per testare se le Guardie ti fanno passare
    this.authService.login('INCOLLA_IL_LUNGO_TOKEN_DI_JWT_IO');;
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
  }

  // Funzioni dei 3 pulsanti in basso
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
      this.pazienteSelezionatoId = null; // Reset selezione
    }
  }
}