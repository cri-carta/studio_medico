import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/*
* Componente principale dell'applicazione.
*/
@Component({
  selector: 'app-root',

  /* Permette l'utilizzo del RouterOutlet nel template. */
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {

  /* Signal inizializzato con il valore 'frontend'. */
  protected readonly title = signal('frontend');
}
