
// Path: src/controllers/pazienti.controller.js

// ============================================================
// paziente.controller.js
// Gestisce le operazioni CRUD (Create, Read, Update, Delete)
// per i pazienti dello Studio Medico
// Include l'integrazione con il sistema RAG (AI) per
// indicizzare i dati del paziente su ChromaDB
// ============================================================

// Modello paziente: contiene le query al database per i pazienti
const PazienteModel = require('../models/paziente.model');

// spawn: permette di avviare processi esterni (in questo caso Python)
const { spawn } = require('child_process');

// path: utilizzato per costruire i percorsi ai file Python in modo sicuro
const path = require('path');
const os = require('os');


// ------------------------------------------------------------
// PERCORSI DEL BACKEND AI
// PYTHON:     percorso all'eseguibile Python nel venv del backend AI
// RAG_SCRIPT: percorso allo script Python che gestisce il sistema RAG
// ------------------------------------------------------------
const RAG_SCRIPT = path.join(__dirname, '../..', 'backend_AI', 'rag_system.py');
const PYTHON = os.platform() === 'win32'
  ? path.join(__dirname, '../..', 'backend_AI', 'venv', 'Scripts', 'python.exe')
  : path.join(__dirname, '../..', 'backend_AI', 'venv', 'bin', 'python');


// ------------------------------------------------------------
// INDICIZZA PAZIENTE RAG
// Funzione interna (non esposta come rotta) che invia i dati
// del paziente al sistema RAG per indicizzarli su ChromaDB.
// Viene eseguita in background dopo la creazione del paziente
//
// Parametri:
//   id       → ID del paziente appena creato nel database
//   nome     → nome del paziente
//   cognome  → cognome del paziente
//   obiettivo→ obiettivo del paziente (es. perdita peso)
//   anamnesi → note cliniche del paziente
// ------------------------------------------------------------
function indicizzaPazienteRAG(id, nome, cognome, obiettivo, anamnesi) {
    return new Promise((resolve) => {

        // Costruisce il payload JSON da inviare allo script Python
        // L'ID viene prefissato con "paz_" per distinguerlo da altri tipi di documenti
        const payload = JSON.stringify({
            id:        `paz_${id}`,
            nome:      `${nome} ${cognome}`,
            note:      anamnesi  || '',   // Se anamnesi è vuota, usa stringa vuota
            obiettivo: obiettivo || '',   // Se obiettivo è vuoto, usa stringa vuota
        });

        // Avvia lo script Python passando il comando 'add' e il payload come argomenti
        const proc = spawn(PYTHON, [RAG_SCRIPT, 'add', payload]);

        // Quando il processo Python termina, risolve la Promise
        proc.on('close', () => resolve());
    });
}


// ------------------------------------------------------------
// GET PATIENTS
// Restituisce la lista di tutti i pazienti registrati nel sistema
// ------------------------------------------------------------
async function getPatients(req, res) {
    try {

        // Recupera tutti i pazienti dal database
        const patients = await PazienteModel.getAllPatients();

        // Risponde con la lista dei pazienti in formato JSON
        res.json(patients);

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


async function getPatientsByDoctor(req, res) {

    try {

        const { id } = req.params;

        const patients =
            await PazienteModel.getPatientsByDoctor(id);

        res.json(patients);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

}


async function getPatientByUtenteId(req, res) {
    try {
        const { utenteId } = req.params;
        const paziente = await PazienteModel.getPatientByUtenteId(utenteId);

        if (!paziente) {
            return res.status(404).json({ error: 'Paziente non trovato per questo utente' });
        }

        res.json(paziente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ------------------------------------------------------------
// CREATE PATIENT
// Crea un nuovo paziente nel sistema con tutti i suoi dati clinici
// Dopo la creazione, indicizza il paziente su ChromaDB in background
// tramite il sistema RAG per renderlo ricercabile dall'AI
// ------------------------------------------------------------
async function createPatient(req, res) {
    try {

        // Estrae tutti i campi del paziente dal corpo della richiesta
        const {
            utente_id,    // ID dell'utente collegato al paziente
            medico_id,    // ID del medico responsabile del paziente
            nome,
            cognome,
            data_nascita,
            altezza,
            obiettivo,    // Obiettivo del paziente (es. dimagrire, aumentare massa)
            anamnesi,     // Note cliniche e storia medica del paziente
            peso,
            bmi,          // Indice di massa corporea
            bf            // Percentuale di grasso corporeo (Body Fat)
        } = req.body;

        // Salva il nuovo paziente nel database con tutti i dati estratti
        const result = await PazienteModel.createPatient(
            utente_id, medico_id, nome, cognome,
            data_nascita, altezza, obiettivo, anamnesi,
            peso, bmi, bf
        );

        // Recupera l'ID del paziente appena inserito nel database
        const paziente_id = result.insertId;

        // Indicizza il paziente su ChromaDB in background (non blocca la risposta)
        // Se l'indicizzazione fallisce, logga l'errore senza interrompere il flusso
        indicizzaPazienteRAG(paziente_id, nome, cognome, obiettivo, anamnesi)
            .catch(err => console.error('[RAG] Errore indicizzazione:', err));

        // Risponde con successo (201 Created) e l'ID del nuovo paziente
        res.status(201).json({
            message: 'Paziente creato',
            id:      paziente_id
        });

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


// ------------------------------------------------------------
// UPDATE PATIENT
// Aggiorna i dati anagrafici e clinici di un paziente esistente
// cercandolo tramite il suo ID
// ------------------------------------------------------------
async function updatePatient(req, res) {
    try {

        // Estrae l'ID del paziente dall'URL
        const { id } = req.params;

        // Estrae i campi aggiornabili dal corpo della richiesta
        const { nome, cognome, data_nascita, altezza, obiettivo, anamnesi } = req.body;

        // Aggiorna il paziente nel database con i nuovi valori
        await PazienteModel.updatePatient(id, nome, cognome, data_nascita, altezza, obiettivo, anamnesi);

        // Risponde con successo confermando l'aggiornamento
        res.json({ message: 'Paziente aggiornato' });

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


// ------------------------------------------------------------
// DELETE PATIENT
// Elimina un paziente dal sistema tramite il suo ID
// ------------------------------------------------------------
async function deletePatient(req, res) {
    try {

        // Elimina il paziente dal database tramite l'ID passato nell'URL
        await PazienteModel.deletePatient(req.params.id);

        // Risponde con successo confermando l'eliminazione
        res.json({ message: 'Paziente eliminato' });

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


// Esporta tutte le funzioni del controller per essere usate nelle rotte
module.exports = {
    getPatients,
    getPatientsByDoctor,
    getPatientByUtenteId,
    createPatient,
    updatePatient,
    deletePatient
};