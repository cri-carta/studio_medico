# Studio Medico — Gestione dello Studio con Piani Alimentari AI

Sistema web full-stack per la gestione di uno studio medico nutrizionistico, con generazione automatica di piani alimentari personalizzati tramite un sistema RAG (Retrieval-Augmented Generation) basato su ChromaDB e Ollama, eseguito interamente in locale.

---

## Il mio ruolo

Progetto di gruppo realizzato durante lo stage come Python Developer ML/AI. Ho coordinato il team, scelto lo stack e l'architettura, sviluppato il sistema RAG e integrato frontend, backend Express e backend AI in un'unica applicazione funzionante.

---

## Tecnologie utilizzate

| Layer | Tecnologia |
|-------|-----------|
| Frontend | Angular (standalone components), TypeScript |
| Backend API | Node.js + Express, MySQL2 |
| Autenticazione | JWT (jsonwebtoken), bcrypt |
| Database | MySQL / MariaDB |
| AI / RAG | Python, ChromaDB, Ollama (llama3.2), nomic-embed-text |

---

## Architettura

```
Angular  ──REST──▶  Express  ──child_process──▶  rag_system.py  ──▶  ChromaDB + Ollama
                       │
                       └──▶ MySQL (utenti, pazienti, visite, piani)
```

---

## Come funziona il RAG

1. **Base di conoscenza.** Il modulo contiene 22 schede (`LINEE_GUIDA` in `rag_system.py`) divise per categoria: linee guida OMS, alimenti, patologie (con cibi consigliati e da evitare), stili alimentari, micronutrienti, organizzazione dei pasti, nutrizione sportiva.
2. **Indicizzazione.** Schede e profili dei pazienti vengono divisi in chunk da 60 parole (overlap 15) e indicizzati in due collezioni ChromaDB (`conoscenza` e `pazienti`) con embedding `nomic-embed-text`.
3. **Retrieval.** Per ogni richiesta vengono recuperati i 3 chunk più rilevanti (similarità coseno), solo se superano una soglia di 0.50. Sotto soglia il sistema dichiara di non avere informazioni invece di generare comunque una risposta.
4. **Generazione.** llama3.2 genera il piano settimanale in formato JSON (temperatura 0.1), seguendo uno schema fisso: 7 giorni, 4 pasti, macronutrienti e calorie giornaliere.
5. **Integrazione.** Express invoca il modulo Python tramite `child_process`, salva il piano in MySQL e Angular lo visualizza per giorno e per pasto.

Lo stesso modulo genera anche un'analisi dell'andamento del paziente a partire dallo storico delle visite.

---

## Funzionalità implementate

### Dashboard Medico
- Login con JWT e separazione dei ruoli (medico / paziente)
- Gestione pazienti: aggiunta, modifica, eliminazione
- Visita con calcolo automatico del BMI e inserimento della Body Fat %
- Storico visite con data personalizzabile
- Generazione del piano alimentare e dell'analisi dell'andamento tramite AI

### Dashboard Paziente
- Visualizzazione del piano nutrizionale generato dal medico
- Storico visite con progressi (peso, BMI, Body Fat) e calcolo delle variazioni

---

## Problemi affrontati

- **Integrazione del codice del team.** Push non coordinati rompevano spesso il progetto. Partendo da una versione funzionante, ho ricollegato il frontend al backend correggendo endpoint REST e path errati, l'ordine delle route Express (es. `/medici/me` prima di `/:id`) e il recupero dell'id del medico dal token JWT.
- **Scelta del modello.** Con `llama3.2:1b` la generazione era più veloce ma i macronutrienti risultavano errati: sono tornato a `llama3.2`, accettando tempi di risposta più lunghi in cambio di output corretti.
- **Formato dell'output.** Ho corretto lo schema JSON richiesto al modello e adattato il frontend alla struttura reale della risposta.
- **Qualità dei piani.** I primi piani erano ripetitivi, poco vari e talvolta con alimenti poco adatti al paziente. Ho ampliato la base di conoscenza da 4 a 22 schede. Le cause residue sono la temperatura bassa (scelta per avere un JSON stabile, a scapito della varietà), il contesto limitato (3 chunk) e le dimensioni del modello, vincolate dall'hardware disponibile.

---

## Limiti e cosa rifarei

- **Calcoli fuori dal modello.** Calorie e macronutrienti sono calcolati dall'LLM: li ricalcolerei in codice a partire da una tabella alimenti, usando il modello solo per comporre i pasti.
- **Vincoli del paziente garantiti.** Inserirei sempre il profilo del paziente nel prompt invece di affidarlo al retrieval, e verificherei in codice che il piano non contenga alimenti vietati per le sue patologie o intolleranze.
- **Validazione dell'output.** Se il JSON non è valido oggi il sistema restituisce un errore: aggiungerei validazione dello schema e un nuovo tentativo automatico.
- **Servizio AI sempre attivo.** Ogni richiesta avvia un nuovo processo Python: in produzione esporrei il modulo come servizio (es. FastAPI).
- **Modello più potente.** Con hardware adeguato userei un modello più grande per migliorare varietà, rispetto dei vincoli e qualità dell'analisi.
- **Test e revisione medica.** Mancano test automatici; trattandosi di dati sanitari, il piano dovrebbe essere sempre approvato dal medico prima di arrivare al paziente.

---

## Struttura del repository

```
studio_medico/
├── backend_AI/                # Modulo RAG Python
│   ├── rag_system.py          # SistemaRAG: base di conoscenza, retrieval, generazione
│   └── requirements.txt
├── backend_express/           # API REST Node.js
│   └── src/ (config, controllers, middleware, models, routes, services)
├── frontend/                  # App Angular
│   └── src/app/features/ (auth, medico, paziente)
├── setup_studio_medico.sql    # Creazione e popolamento del database
└── README.md
```

---

## Installazione e avvio

### Prerequisiti
- Node.js 18+, Python 3.10+, MySQL 8+ o MariaDB
- [Ollama](https://ollama.com) con i modelli `llama3.2` e `nomic-embed-text`

### 1. Database
```bash
mysql -u root -p < setup_studio_medico.sql
```

### 2. Backend AI
```bash
cd backend_AI
python -m venv venv
venv\Scripts\activate          # su Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
ollama pull llama3.2
ollama pull nomic-embed-text
python rag_system.py seed "{}"   # indicizza la base di conoscenza
```

### 3. Backend Express
Creare `backend_express/.env` con `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`, `PORT`.
```bash
cd backend_express
npm install
npm start          # http://localhost:3000
```

### 4. Frontend
```bash
cd frontend
npm install
ng serve           # http://localhost:4200
```

### Credenziali demo
- Medico: `luca.ferrari@studio.it` / `password123`
