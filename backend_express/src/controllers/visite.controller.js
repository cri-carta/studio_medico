
// Path: src/controllers/visite.controller.js

// ============================================================
// Gestisce le operazioni CRUD (Create, Read, Update, Delete)
// per le visite mediche dello Studio Medico.
// Ogni visita è associata a un paziente e a un medico,
// e registra dati come la data della visita e il peso del paziente.
// ============================================================

// Modello visita: contiene le query al database per le visite
const VisitaModel = require('../models/visita.model');


// ------------------------------------------------------------
// GET ALL
// Restituisce la lista di tutte le visite presenti nel sistema.
// ------------------------------------------------------------
async function getAll(req, res) {
    try {

        // Recupera tutte le visite dal database
        const visite = await visitaModel.getAllVisits();

        // Risponde con la lista delle visite in formato JSON (200 OK)
        return res.status(200).json(visite);

    } catch (error) {

        // Log dell'errore in console per il debug
        console.error("Errore in getAllVisits:", error);

        // Errore interno del server: restituisce messaggio generico al client
        return res.status(500).json({ error: "Errore interno del server" });
    }
}


// ------------------------------------------------------------
// CREATE
// Crea una nuova visita nel sistema.
// Campi obbligatori: id, paziente_id, medico_id, data_visita.
// Il campo peso è opzionale.
// ------------------------------------------------------------
async function create(req, res) {

    // Estrae i dati dal corpo della richiesta HTTP
    const { id, paziente_id, medico_id, data_visita, peso } = req.body;

    // Validazione: controlla che tutti i campi obbligatori siano presenti
    // Se manca anche uno solo, restituisce errore 400 (Bad Request)
    if (!id || !paziente_id || !medico_id || !data_visita) {
        return res.status(400).json({ error: "I campi id, paziente_id, medico_id e data_visita sono obbligatori." });
    }

    try {

        // Crea la nuova visita nel database con i dati forniti
        await visitaModel.createVisita(id, paziente_id, medico_id, data_visita, peso);

        // Risponde con successo (201 Created) e l'ID della visita appena creata
        return res.status(201).json({ message: "Visita creata con successo", id });

    } catch (error) {

        // Log dell'errore in console per il debug
        console.error("Errore in createVisita:", error);

        // Errore interno del server: restituisce messaggio di errore al client
        return res.status(500).json({ error: "Errore durante la creazione della visita" });
    }
}


// ------------------------------------------------------------
// UPDATE
// Aggiorna i dati di una visita esistente tramite il suo ID.
// Campi obbligatori per l'aggiornamento: data_visita e peso.
// Se la visita non esiste, restituisce errore 404.
// ------------------------------------------------------------
async function update(req, res) {

    // Estrae l'ID della visita dall'URL (es. /visite/123)
    const { id } = req.params;

    // Estrae i campi aggiornabili dal corpo della richiesta
    const { data_visita, peso } = req.body;

    // Validazione: controlla che entrambi i campi obbligatori siano presenti
    if (!data_visita || !peso) {
        return res.status(400).json({ error: "I campi data_visita e peso sono richiesti per l'aggiornamento." });
    }

    try {

        // Aggiorna la visita nel database con i nuovi valori
        const result = await visitaModel.updateVisita(id, data_visita, peso);

        // Se affectedRows è 0, nessuna riga è stata modificata: la visita non esiste
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Visita non trovata" });
        }

        // Risponde con successo confermando l'aggiornamento
        return res.status(200).json({ message: "Visita aggiornata con successo" });

    } catch (error) {

        // Log dell'errore in console per il debug
        console.error("Errore in updateVisita:", error);

        // Errore interno del server: restituisce messaggio di errore al client
        return res.status(500).json({ error: "Errore durante l'aggiornamento della visita" });
    }
}


// ------------------------------------------------------------
// REMOVE
// Elimina una visita dal sistema tramite il suo ID.
// Se la visita non esiste, restituisce errore 404.
// ------------------------------------------------------------
async function remove(req, res) {

    // Estrae l'ID della visita dall'URL
    const { id } = req.params;

    try {

        // Elimina la visita dal database tramite l'ID
        const result = await visitaModel.deleteVisita(id);

        // Se affectedRows è 0, nessuna riga è stata eliminata: la visita non esiste
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Visita non trovata" });
        }

        // Risponde con successo confermando l'eliminazione
        return res.status(200).json({ message: "Visita eliminata con successo" });

    } catch (error) {

        // Log dell'errore in console per il debug
        console.error("Errore in deleteVisita:", error);

        // Errore interno del server: restituisce messaggio di errore al client
        return res.status(500).json({ error: "Errore durante l'eliminazione della visita" });
    }
}


// Esporta tutte le funzioni del controller per essere usate nelle rotte
module.exports = {
    getAll,
    create,
    update,
    remove
};