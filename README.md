# Studio Medico — Gestione dello Studio con Piani Alimentari AI

Sistema web full-stack per la gestione di uno studio medico, con focus sulla creazione di piani alimentari personalizzati tramite intelligenza artificiale.

---

## Tecnologie utilizzate

| Layer | Tecnologia |
|-------|-----------|
| Backend | Node.js + Express 5, MySQL2 |
| Autenticazione | JWT (jsonwebtoken), bcrypt |
| Frontend | Angular 22 (standalone components), TypeScript 6 |
| Database | MySQL |
| Test API | Postman |

---

## Stato attuale del progetto

Il progetto è in **fase di sviluppo MVP**. L'infrastruttura di base è presente, ma diverse funzionalità critiche sono incomplete o presentano bug bloccanti.

### Cosa funziona

- Server Express avviato correttamente con routing strutturato
- Registrazione e login utenti con hashing bcrypt e generazione token JWT
- CRUD completo per pazienti (`/pazienti`)
- CRUD completo per piani alimentari (`/piani`) con query annidate (giorni, pasti, voci pasto)
- Shell Angular con routing lazy-loaded e interceptor JWT
- Dashboard medico con layout grafico (dati ancora hardcodati)

### Cosa non funziona

#### Bug critici (il server crasha)

- **`visite.controller.js`** — il modello viene importato come `VisitaModel` ma chiamato come `visitaModel`: tutti gli endpoint `/visite` lanciano `ReferenceError` al primo utilizzo.

#### Componenti vuoti (stub)

| File | Problema |
|------|---------|
| `auth.middleware.js` | Completamente vuoto — nessuna verifica JWT sul backend |
| `error.middleware.js` | Completamente vuoto — nessuna gestione centralizzata degli errori |
| `role.guard.ts` (Angular) | Completamente vuoto — separazione dei ruoli non funzionante |
| `ai.service.js` | Vuoto — la funzionalità AI principale non è ancora iniziata |

#### Componenti Angular placeholder

Contengono solo testo "X works!" senza implementazione reale:

- Login
- Scheda paziente
- Editor piano alimentare
- Dashboard paziente
- Visualizzatore piano

#### Mancanze infrastrutturali

- Nessun file `.env.example` — le variabili d'ambiente richieste non sono documentate nel repo
- Nessun file SQL per l'inizializzazione del database — impossibile ricreare lo schema
- La dashboard medico usa dati hardcodati invece di chiamare le API reali
- Presenza di token di test hardcodato nel codice: `authService.login('token-di-test-123', 'medico')`

---

## Analisi della Sicurezza (OWASP Top 10)

> **Il sistema NON è pronto per la produzione.** Maneggia dati medici sensibili e deve superare una revisione di sicurezza completa prima di qualsiasi deploy.

### Vulnerabilità critiche

#### A01 — Broken Access Control
Nessun middleware di autenticazione è attivo sul backend. Tutti gli endpoint (`/pazienti`, `/visite`, `/piani`, `/utenti`) sono **completamente pubblici e accessibili senza token**. Chiunque possa raggiungere il server può leggere, modificare o cancellare qualsiasi dato medico.

**Soluzione**: implementare `auth.middleware.js` con verifica JWT e applicarlo a tutte le route protette.

#### A02 — Cryptographic Failures
Il token JWT e il ruolo dell'utente sono salvati in `localStorage`, accessibile da qualsiasi script JavaScript (vettore XSS). Non è configurato HTTPS. Il logout cancella solo il token lato client, ma il token rimane valido sul backend per 24 ore senza possibilità di revoca.

**Soluzione**: utilizzare cookie `httpOnly` per il token; configurare HTTPS; implementare una blocklist dei token invalidati.

#### A04 — Insecure Design
Il campo `ruolo` viene accettato direttamente dal body della richiesta di registrazione. Un utente qualsiasi può registrarsi come `medico` senza alcuna verifica.

**Soluzione**: rimuovere `ruolo` dal body pubblico o gestirne l'assegnazione tramite un flusso amministrativo separato.

#### A05 — Security Misconfiguration
`app.use(cors())` senza argomenti permette richieste cross-origin da **qualsiasi dominio**. Non è presente `helmet.js` (nessun header di sicurezza: CSP, X-Frame-Options, HSTS). Nessun rate limiting sull'endpoint di login. Il body JSON non ha un limite di dimensione. I messaggi di errore restituiscono `error.message` raw, esponendo dettagli interni del sistema.

**Soluzione**: restringere CORS all'origine del frontend; aggiungere `helmet`; aggiungere `express-rate-limit`; impostare `{ limit: '10kb' }` su `express.json()`; usare messaggi di errore generici verso il client.

#### A07 — Identification and Authentication Failures
Il backend genera token JWT al login ma non li verifica mai nelle richieste successive. Non esistono requisiti minimi di complessità per la password. Non è presente alcun meccanismo di blocco account dopo tentativi di login falliti.

**Soluzione**: applicare `auth.middleware.js` su tutte le route protette; aggiungere validazione della password; implementare il conteggio dei tentativi falliti.

### Vulnerabilità alte

#### A08 — Software and Data Integrity Failures
Il ruolo salvato in `localStorage` può essere modificato dall'utente tramite DevTools. L'endpoint `PUT /piani/:id` accetta un `paziente_id` arbitrario, permettendo di riassegnare un piano a qualsiasi paziente senza controllo di proprietà.

#### A09 — Security Logging and Monitoring Failures
Il sistema usa solo `console.log`/`console.error`, che sono effimeri e non strutturati. Non esiste nessun audit trail: accessi ai dati, modifiche e cancellazioni non vengono registrati. I dati medici richiedono tipicamente log immutabili per ragioni di compliance.

### Controlli superati

| Categoria | Stato | Motivo |
|-----------|-------|--------|
| A03 — Injection | Superato | Tutte le query DB usano placeholder `?` parametrizzati |
| A06 — Vulnerable Components | Superato | Tutte le dipendenze sono versioni aggiornate |
| A10 — SSRF | Superato | Il backend non effettua richieste HTTP esterne |

---

## Variabili d'ambiente richieste

Creare un file `.env` nella cartella `backend_express/` con le seguenti variabili:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=studio_medico
JWT_SECRET=           # stringa casuale di almeno 32 caratteri
PORT=3000
```

---

## Avvio del progetto (sviluppo)

```bash
# Backend
cd backend_express
npm install
node server.js

# Frontend (in un terminale separato)
cd frontend
npm install
ng serve
```

> **Prerequisito**: database MySQL attivo con lo schema inizializzato (file SQL non ancora presente nel repo — da creare).

---

## Priorità di sviluppo

1. Correggere il bug `VisitaModel` / `visitaModel` in `visite.controller.js`
2. Implementare `auth.middleware.js` con verifica JWT
3. Implementare `role.guard.ts` per separare le route medico/paziente
4. Restringere CORS, aggiungere `helmet` e rate limiting
5. Bloccare l'autoassegnazione del ruolo `medico` in fase di registrazione
6. Creare `.env.example` e file SQL per lo schema del database
7. Collegare i componenti Angular alle API reali (rimuovere dati hardcodati)
8. Implementare il componente di login
9. Completare le viste placeholder (scheda paziente, piano alimentare, dashboard paziente, visualizzatore piano)
10. Implementare `ai.service.js` per la generazione automatica dei piani alimentari

---

## Struttura del repository

```
studio_medico/
├── backend_express/
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/          # database.js, env.js (vuoto)
│       ├── controllers/     # auth, pazienti, piani, utenti, visite
│       ├── middleware/      # auth.middleware.js (vuoto), error.middleware.js (vuoto)
│       ├── models/          # paziente, piano, utente, visita
│       ├── routes/          # una route file per risorsa
│       └── services/        # ai.service.js (vuoto)
├── frontend/
│   └── src/app/
│       ├── core/auth/       # auth.service, interceptor, guards
│       ├── features/
│       │   ├── auth/        # login (placeholder)
│       │   ├── medico/      # dashboard + placeholder
│       │   └── paziente/    # tutti placeholder
│       └── app.routes.ts
├── postman/                 # collection per test manuali
├── AGENTS.md                # documentazione per agenti AI
└── README.md
```
