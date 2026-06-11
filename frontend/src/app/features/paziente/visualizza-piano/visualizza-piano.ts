import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente responsabile della visualizzazione dettagliata del piano settimanale.
 * Visualizza i pasti suddivisi per giorni della settimana.
 */
@Component({
  selector: 'app-visualizza-piano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizza-piano.html',
  styleUrl: './visualizza-piano.css',
})
export class VisualizzaPianoComponent {

  /**
   * Oggetto che contiene la struttura del piano alimentare.
   * Ricevuto come input dal componente padre (es. Dashboard).
   */
  @Input() piano: any = {};

  /** Array utilizzato per iterare i giorni della settimana nel template */
  giorniChiave = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];

  /** Array utilizzato per iterare le tipologie di pasto nel template */
  pastiChiave = ['colazione', 'pranzo', 'spuntino', 'cena'];

  /** Mappatura delle chiavi giorni con le relative etichette leggibili */
  labelGiorni: { [key: string]: string } = {
    lunedi: 'Lunedì', martedi: 'Martedì', mercoledi: 'Mercoledì',
    giovedi: 'Giovedì', venerdi: 'Venerdì', sabato: 'Sabato', domenica: 'Domenica'
  };

  /** Mappatura delle chiavi pasti con icone ed etichette */
  labelPasti: { [key: string]: string } = {
    colazione: '🍳 Colazione', pranzo: '☀️ Pranzo', spuntino: '🍎 Spuntino', cena: '🌙 Cena'
  };

  /**
   * Verifica se il piano fornito è vuoto o non definito.
   * @returns {boolean} True se il piano è vuoto.
   */
  isEmptyPiano(): boolean {
    return !this.piano || Object.keys(this.piano).length === 0;
  }
}