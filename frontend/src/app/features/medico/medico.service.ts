import { timeout } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RispostaTabellaAI, RispostaAnalisiAI } from '../../core/models/outputAI.model';

/** Dati per la registrazione di una nuova visita antropometrica. */
export interface NuovaVisita {
  paziente_id: number;
  data_visita: string;
  peso: number;
  bmi: number;
  bf: number;
}

/** Modello dati di un paziente. */
export interface Paziente {
  id: number;
  medico_id: number;
  nome: string;
  cognome: string;
  data_nascita?: Date | string;
  altezza?: number;
  obiettivo?: string;
  anamnesi?: string;
}

/** Singola voce del piano alimentare. */
export interface PianoVoce {
  giorno: string;
  tipo_pasto: string;
  alimento: string;
  grammi: number;
  kcal?: number;
  proteine?: number;
  carboidrati?: number;
  grassi?: number;
}

/** Modello dati di una visita medica. */
export interface Visita {
  id: number;
  paziente_id: number;
  medico_id: number;
  data_visita: string;
  peso: number;
  bmi: number;
  bf: number;
  note_visita?: string;
}
/**
 * @description
 * Il servizio `MedicoService` centralizza tutte le chiamate API verso il backend.
 * * Gestisce:
 * - Operazioni CRUD su pazienti e visite.
 * - Recupero dei piani alimentari (legacy e AI-generated).
 * - Stream di dati per le risposte AI tramite Server-Sent Events (SSE).
 */
@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}
/** * Recupera la lista di tutti i pazienti associati a un medico.
   * @param medicoId ID del medico loggato.
   */
  getPazientiPerMedico(medicoId: number): Observable<Paziente[]> {
    return this.http.get<Paziente[]>(`${this.API_URL}/pazienti/medico/${medicoId}`);
  }/**
   * Recupera il profilo completo di un paziente.
   * @param utenteId ID univoco dell'utente (account).
   */

  getProfiloPaziente(utenteId: number): Observable<Paziente> {
    return this.http.get<Paziente>(`${this.API_URL}/pazienti/utente/${utenteId}`);
  }
/**
   * Recupera il piano alimentare in formato strutturato (legacy).
   * @param pazienteId ID del paziente.
   */
  getPianoCompletoPaziente(pazienteId: number): Observable<PianoVoce[]> {
    return this.http.get<PianoVoce[]>(`${this.API_URL}/piani/paziente/${pazienteId}/full`);
  }
/**
   * Recupera lo storico delle visite mediche del paziente.
   * @param pazienteId ID del paziente.
   */
  getStoricoVisite(pazienteId: number): Observable<Visita[]> {
    return this.http.get<Visita[]>(`${this.API_URL}/visite/paziente/${pazienteId}`);
  }
  /**
   * Registra un nuovo utente con ruolo "paziente".
   * @param email Indirizzo email dell'utente.
   * @param password Password scelta dall'utente.
   */
  registraUtentePaziente(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.API_URL}/auth/register`, {
    email,
    password,
    ruolo: 'paziente'
  });
}
  /**
   * Crea un nuovo paziente associato al medico.
   * @param dati Dati anagrafici e clinici del paziente da creare.
   */
creaPaziente(dati: any): Observable<any> {
  return this.http.post<any>(`${this.API_URL}/pazienti`, dati);
}
/**
   * Genera la tabella del piano alimentare tramite SSE (Server-Sent Events).
   * @param pazienteId ID del paziente per cui generare il piano.
   * @returns Un Observable che emette i dati ricevuti dallo stream.
   */
  generaTabellaPiano(pazienteId: number): Observable<RispostaTabellaAI> {
    return new Observable(observer => {
      const token = localStorage.getItem('token');
      const eventSource = new EventSource(
        `${this.API_URL}/rag/tabella/${pazienteId}?token=${token}`
      );

      eventSource.addEventListener('completo', (e: any) => {
        const data = JSON.parse(e.data);
        observer.next(data);
        observer.complete();
        eventSource.close();
      });

      eventSource.addEventListener('errore', (e: any) => {
        const data = JSON.parse(e.data);
        observer.error(data);
        eventSource.close();
      });

      eventSource.onerror = (err) => {
        observer.error(err);
        eventSource.close();
      };

      return () => eventSource.close();
    });
  }
  /**
   * Recupera i dati del medico attualmente autenticato.
   */
  getMedicoDelLogin(): Observable<any> {
      return this.http.get<any>(`${this.API_URL}/medici/me`);
  }
/**
   * Recupera l'analisi dei progressi generata dall'AI.
   * @param pazienteId ID del paziente.
   * @remarks Utilizza un timeout esteso (10 min) a causa del tempo di elaborazione dell'AI.
   */
  getAnalisiAndamento(pazienteId: number): Observable<RispostaAnalisiAI> {
    return this.http.get<RispostaAnalisiAI>(
      `${this.API_URL}/rag/analisi/${pazienteId}`
    ).pipe(timeout(600000));
  }
/**
   * Salva una nuova visita antropometrica per un paziente.
   * @param visita Oggetto contenente i dati della nuova visita.
   */
  salvaVisita(visita: NuovaVisita): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/visite`, visita);
  }
  /**
   * Recupera il piano alimentare AI già salvato per un paziente.
   * @param pazienteId ID del paziente.
   */
  getPianoSalvato(pazienteId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/rag/piano/${pazienteId}`);
  }
  /**
   * Elimina un paziente dal sistema.
   * @param id ID del paziente da eliminare.
   */
  deletePaziente(
    id: number
  ): Observable<any> {

    return this.http.delete(

      `${this.API_URL}/pazienti/${id}`
    );
  }

  /**
   * Aggiorna i dati di un paziente esistente.
   * @param id ID del paziente da aggiornare.
   * @param dati Oggetto contenente i campi da modificare.
   */
  updatePaziente(
    id: number,
   dati: any
  ): Observable<any> {

    return this.http.put(

      `${this.API_URL}/pazienti/${id}`,
      dati

    );

  }


}