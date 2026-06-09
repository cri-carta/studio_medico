
// Path: src/controllers/medico.controller.js

// ============================================================
// medico.controller.js
// Gestisce le operazioni CRUD (Create, Read, Update, Delete)
// per i medici dello Studio Medico
// ============================================================

// Modello medico: contiene le query al database per i medici
const MedicoModel = require('../models/medico.model');


// ------------------------------------------------------------
// GET MEDICI
// Restituisce la lista di tutti i medici registrati nel sistema
// ------------------------------------------------------------
async function getMedici(req, res) {
    try {

        // Recupera tutti i medici dal database
        const medici = await MedicoModel.getAllMedici();

        // Risponde con la lista dei medici in formato JSON
        res.json(medici);

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


// ------------------------------------------------------------
// GET MEDICO
// Restituisce un singolo medico cercandolo tramite il suo ID
// Se non viene trovato, restituisce un errore 404
// ------------------------------------------------------------
async function getMedico(req, res) {
    try {

        // Cerca il medico nel database tramite l'ID passato nell'URL
        const medico = await MedicoModel.getMedicoById(req.params.id);

        // Se il medico non esiste, restituisce errore 404 (non trovato)
        if (!medico) {
            return res.status(404).json({ error: 'Medico non trovato.' });
        }

        // Risponde con i dati del medico trovato in formato JSON
        res.json(medico);

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


// ------------------------------------------------------------
// CREATE MEDICO
// Crea un nuovo medico nel sistema
// Richiede obbligatoriamente: utente_id, nome e cognome
// utente_id collega il medico all'utente registrato in fase di login
// ------------------------------------------------------------
async function createMedico(req, res) {
    try {

        // Estrae utente_id, nome e cognome dal corpo della richiesta
        const { utente_id, nome, cognome } = req.body;

        // Controlla che tutti i campi obbligatori siano presenti
        if (!utente_id || !nome || !cognome) {
            return res.status(400).json({ error: 'Campi utente_id, nome e cognome obbligatori.' });
        }

        // Crea il nuovo medico nel database
        const result = await MedicoModel.createMedico(utente_id, nome, cognome);

        // Risponde con successo (201 Created) e l'ID del nuovo medico
        res.status(201).json({ message: 'Medico creato', id: result.insertId });

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


// ------------------------------------------------------------
// UPDATE MEDICO
// Aggiorna il nome e il cognome di un medico esistente
// cercandolo tramite il suo ID
// ------------------------------------------------------------
async function updateMedico(req, res) {
    try {

        // Estrae l'ID del medico dall'URL e i nuovi dati dal corpo della richiesta
        const { id }            = req.params;
        const { nome, cognome } = req.body;

        // Aggiorna il medico nel database con i nuovi valori
        await MedicoModel.updateMedico(id, nome, cognome);

        // Risponde con successo confermando l'aggiornamento
        res.json({ message: 'Medico aggiornato' });

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


// ------------------------------------------------------------
// DELETE MEDICO
// Elimina un medico dal sistema tramite il suo ID
// ------------------------------------------------------------
async function deleteMedico(req, res) {
    try {

        // Elimina il medico dal database tramite l'ID passato nell'URL
        await MedicoModel.deleteMedico(req.params.id);

        // Risponde con successo confermando l'eliminazione
        res.json({ message: 'Medico eliminato' });

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


// Esporta tutte le funzioni del controller per essere usate nelle rotte
module.exports = {
    getMedici,
    getMedico,
    createMedico,
    updateMedico,
    deleteMedico
};