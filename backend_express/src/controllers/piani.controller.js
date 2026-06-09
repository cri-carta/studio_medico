
// Path: src/controllers/piani.controller.js

// ============================================================
// Gestisce le operazioni CRUD (Create, Read, Update, Delete)
// per i piani alimentari/di allenamento dello Studio Medico.
// Ogni piano è associato a un paziente e a un medico
// ============================================================

// Modello piano: contiene le query al database per i piani
const PianoModel = require('../models/piano.model');


// ------------------------------------------------------------
// GET PLANS
// Restituisce la lista di tutti i piani presenti nel sistema.
// Rotta: GET /piani
// ------------------------------------------------------------
async function getPlans(req, res) {

    try {

        // Recupera tutti i piani dal database
        const plans =
            await PianoModel.getAllPlans();

        // Risponde con la lista dei piani in formato JSON
        res.json(plans);

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({
            error: error.message
        });

    }
}


// ------------------------------------------------------------
// CREATE PLAN
// Crea un nuovo piano associandolo a un paziente e a un medico.
// Include log di debug per monitorare i dati ricevuti e
// log dettagliati in caso di errore SQL.
// ------------------------------------------------------------
async function createPlan(req, res) {
    try {

        // DEBUG: stampa in console i dati ricevuti nel body della richiesta
        console.log("Dati ricevuti in POST /piani:", req.body);

        // Estrae l'ID del paziente e del medico dal corpo della richiesta
        const { paziente_id, medico_id } = req.body;

        // Crea il nuovo piano nel database collegandolo al paziente e al medico
        const result = await PianoModel.createPlan(paziente_id, medico_id);

        // Risponde con successo (201 Created) e l'ID del nuovo piano
        res.status(201).json({ message: 'Piano creato', id: result.insertId });

    } catch (error) {

        // Log dettagliato dell'errore per facilitare il debug in fase di sviluppo
        console.error("--- ERRORE CRITICO DETTAGLIATO ---");
        console.error("Messaggio:", error.message);   // Messaggio leggibile dell'errore
        console.error("Codice errore SQL:", error.code); // Codice specifico dell'errore SQL
        console.error("Stack trace:", error.stack);   // Traccia completa dello stack

        // Restituisce il messaggio di errore al client
        res.status(500).json({ error: error.message });
    }
}


// ------------------------------------------------------------
// UPDATE PLAN
// Aggiorna i dati di un piano esistente tramite il suo ID.
// Permette di modificare il paziente e il medico associati.
// ------------------------------------------------------------
async function updatePlan(req, res) {
    try {

        // Estrae l'ID del piano dall'URL
        const { id } = req.params;

        // Estrae i campi aggiornabili dal corpo della richiesta
        const { paziente_id, medico_id } = req.body; // Solo i campi esistenti

        // Aggiorna il piano nel database con i nuovi valori
        await PianoModel.updatePlan(id, paziente_id, medico_id);

        // Risponde con successo confermando l'aggiornamento
        res.json({ message: 'Piano aggiornato' });

    } catch (error) {
        // ... log dell'errore ...
    }
}


// ------------------------------------------------------------
// DELETE PLAN
// Elimina un piano dal sistema tramite il suo ID.
// ------------------------------------------------------------
async function deletePlan(req, res) {

    try {

        // Estrae l'ID del piano dall'URL
        const { id } = req.params;

        // Elimina il piano dal database
        await PianoModel.deletePlan(id);

        // Risponde con successo confermando l'eliminazione
        res.json({
            message: 'Piano eliminato'
        });

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({
            error: error.message
        });

    }
}


// ------------------------------------------------------------
// GET ALL PLANS (versione con controlli di debug avanzati)
// Versione alternativa di getPlans con log aggiuntivi per
// verificare che PianoModel sia caricato correttamente.
// ------------------------------------------------------------
async function getAllPlans() {

    // DEBUG: log di ingresso per verificare che la funzione venga chiamata
    console.log("Entrato in getPlans, provo a chiamare il modello...");

    try {

        // Verifica che PianoModel e il metodo getAllPlans siano definiti correttamente
        // Se mancano, lancia un errore esplicito per facilitare il debug
        if (!PianoModel || typeof PianoModel.getAllPlans !== 'function') {
            throw new Error("PianoModel o getAllPlans non definiti correttamente!");
        }

        // Recupera tutti i piani dal database
        const plans = await PianoModel.getAllPlans();

        // DEBUG: stampa i risultati ottenuti dalla query
        console.log("Query completata, risultati:", plans);

        res.json(plans);

    } catch (error) {

        // Log fatale: stampa l'errore completo in console per il debug
        console.error("ERRORE FATALE IN GETPLANS:", error);

        // Restituisce errore al client includendo anche lo stack trace
        // per identificare esattamente dove si è verificato il problema
        res.status(500).json({
            error: error.message,
            stack: error.stack // Stack incluso per facilitare il debug
        });
    }
}


// ------------------------------------------------------------
// GET PLAN BY ID
// Restituisce un singolo piano cercandolo tramite il suo ID.
// Se non viene trovato, restituisce un errore 404.
// ------------------------------------------------------------
async function getPlanById(req, res) {
    try {

        // Estrae l'ID del piano dall'URL
        const { id } = req.params;

        // Cerca il piano nel database tramite l'ID
        const plan = await PianoModel.getPlanById(id);

        // Se il piano non esiste, restituisce errore 404 (non trovato)
        if (!plan) {
            return res.status(404).json({ message: "Piano non trovato" });
        }

        // Risponde con i dati del piano trovato in formato JSON
        res.json(plan);

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}


// ------------------------------------------------------------
// GET FULL PLAN
// Restituisce un piano completo con tutti i dettagli associati
// (es. esercizi, pasti, visite) tramite il suo ID.
// Utile per visualizzare la scheda completa di un paziente.
// ------------------------------------------------------------
async function getFullPlan(req, res) {
    try {

        // Estrae l'ID del piano dall'URL
        const { id } = req.params;

        // Recupera il piano completo con tutti i dati associati dal database
        const plan = await PianoModel.getFullPlan(id);

        // Risponde con il piano completo in formato JSON
        res.json(plan);

    } catch (error) {

        // Errore interno del server: restituisce il messaggio di errore
        res.status(500).json({ error: error.message });
    }
}
async function getFullPlanByPazienteId(req, res) {
    try {
        const { pazienteId } = req.params;
        const plan = await PianoModel.getFullPlanByPazienteId(pazienteId);
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Esporta la funzione insieme alle altre

// Esporta tutte le funzioni del controller per essere usate nelle rotte
module.exports = {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlans,
    getPlanById,
    getFullPlan,
    getFullPlanByPazienteId
};