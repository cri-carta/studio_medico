# Studio Medico — Gestione dello Studio con Piani Alimentari AI

Sistema web full-stack per la gestione di uno studio medico nutrizionistico, con generazione automatica di piani alimentari personalizzati tramite sistema RAG (Retrieval-Augmented Generation) con ChromaDB e Ollama.

---

## Tecnologie utilizzate

| Layer | Tecnologia |
|-------|-----------|
| Backend API | Node.js + Express, MySQL2 |
| Autenticazione | JWT (jsonwebtoken), bcrypt |
| Frontend | Angular (standalone components), TypeScript |
| Database | MySQL |
| AI / RAG | Python, ChromaDB, Ollama (llama3.2), nomic-embed-text |

---

## Funzionalità implementate

### Dashboard Medico
- Login con JWT e separazione dei ruoli (medico / paziente)
- Lista pazienti caricata dal database
- Aggiunta, modifica ed eliminazione pazienti
- Form effettua visita con calcolo automatico BMI e inserimento manuale Body Fat %
- Salvataggio storico visite con data personalizzabile

### Sistema RAG (AI)
- Generazione piano alimentare settimanale personalizzato via Ollama (llama3.2)
- Piano salvato nel database in formato JSON
- Visualizzazione piano con macronutrienti per giorno
- Analisi andamento clinico del paziente su tutte le visite

### Dashboard Paziente
- Visualizzazione piano nutrizionale generato dal medico
- Storico visite con progressi (peso, BMI, Body Fat)
- Andamento complessivo con calcolo delta parametri

---

## Struttura del repository