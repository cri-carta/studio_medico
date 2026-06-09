import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visualizza-piano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizza-piano.html',
  styleUrl: './visualizza-piano.css',
})
export class VisualizzaPianoComponent {
  // Riceve il piano già formattato dalla dashboard
  @Input() piano: any = {};

  giorniChiave = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
  pastiChiave = ['colazione', 'pranzo', 'spuntino', 'cena'];

  labelGiorni: { [key: string]: string } = {
    lunedi: 'Lunedì', martedi: 'Martedì', mercoledi: 'Mercoledì',
    giovedi: 'Giovedì', venerdi: 'Venerdì', sabato: 'Sabato', domenica: 'Domenica'
  };

  labelPasti: { [key: string]: string } = {
    colazione: '🍳 Colazione', pranzo: '☀️ Pranzo', spuntino: '🍎 Spuntino', cena: '🌙 Cena'
  };

  isEmptyPiano(): boolean {
    return !this.piano || Object.keys(this.piano).length === 0;
  }
}