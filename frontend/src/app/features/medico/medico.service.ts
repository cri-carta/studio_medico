import { timeout } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RispostaTabellaAI, RispostaAnalisiAI } from '../../core/models/outputAI.model';

export interface NuovaVisita {
  paziente_id: number;
  data_visita: string;
  peso: number;
  bmi: number;
  bf: number;
}

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

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPazientiPerMedico(medicoId: number): Observable<Paziente[]> {
    return this.http.get<Paziente[]>(`${this.API_URL}/medici/${medicoId}/pazienti`);
  }

  getProfiloPaziente(utenteId: number): Observable<Paziente> {
    return this.http.get<Paziente>(`${this.API_URL}/pazienti/utente/${utenteId}`);
  }

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

  getAnalisiAndamento(pazienteId: number): Observable<RispostaAnalisiAI> {
    return this.http.get<RispostaAnalisiAI>(
      `${this.API_URL}/rag/analisi/${pazienteId}`
    ).pipe(timeout(600000));
  }

  salvaVisita(visita: NuovaVisita): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/visite`, visita);
  }
}