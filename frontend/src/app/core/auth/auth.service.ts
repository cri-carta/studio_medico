import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

/**
 * Interfaccia per la struttura del payload presente nel token JWT.
 */
interface CustomJwtPayload {
  id?: number;
  email?: string;
  role: string;
  exp?: number;
}

/**
 * Servizio per la gestione dell'autenticazione tramite JWT.
 * Si occupa di memorizzare il token e decodificarne le informazioni (ruolo, ID).
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * Estrae il ruolo dell'utente dal token JWT memorizzato nel localStorage.
   * @returns Il ruolo dell'utente ('medico' o 'paziente') o null se il token è assente/non valido.
   */
  userRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Decodifica la stringa Base64 per leggere il payload JSON
      const decoded = jwtDecode<CustomJwtPayload>(token);
      return decoded.role;
    } catch (error) {
      console.error('Token non valido o corrotto:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Estrae l'ID univoco dell'utente dal token JWT.
   * @returns L'ID numerico dell'utente o null se non disponibile.
   */
  userId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      return decoded.id ?? null;
    } catch (error) {
      console.error('Token non valido o corrotto:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Memorizza il token JWT nel localStorage.
   * @param token Stringa del token ricevuto dal server.
   */
  login(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Rimuove il token dal localStorage, effettuando il logout dell'utente.
   */
  logout(): void {
    localStorage.removeItem('token');
  }
}