const visitaModel = require('../models/visitaModel'); // Assicurati che il percorso sia corretto

// GET /visite
async function getAll(req, res) {
    try {
        const visite = await visitaModel.getAllVisits();
        return res.status(200).json(visite);
    } catch (error) {
        console.error("Errore in getAllVisits:", error);
        return res.status(500).json({ error: "Errore interno del server" });
    }
}

// POST /visite
async function create(req, res) {
    // Estraiamo i dati dal body della richiesta HTTP
    const { id, paziente_id, medico_id, data_visita, peso } = req.body;

    // Validazione minima dei dati obbligatori
    if (!id || !paziente_id || !medico_id || !data_visita) {
        return res.status(400).json({ error: "I campi id, paziente_id, medico_id e data_visita sono obbligatori." });
    }

    try {
        await visitaModel.createVisita(id, paziente_id, medico_id, data_visita, peso);
        return res.status(201).json({ message: "Visita creata con successo", id });
    } catch (error) {
        console.error("Errore in createVisita:", error);
        return res.status(500).json({ error: "Errore durante la creazione della visita" });
    }
}

// PUT /visite/:id
async function update(req, res) {
    const { id } = req.params; // Prendiamo l'id dall'URL (es. /visite/123)
    const { data_visita, peso } = req.body;

    if (!data_visita || !peso) {
        return res.status(400).json({ error: "I campi data_visita e peso sono richiesti per l'aggiornamento." });
    }

    try {
        const result = await visitaModel.updateVisita(id, data_visita, peso);
        
        // Verifichiamo se la riga esisteva ed è stata modificata
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Visita non trovata" });
        }

        return res.status(200).json({ message: "Visita aggiornata con successo" });
    } catch (error) {
        console.error("Errore in updateVisita:", error);
        return res.status(500).json({ error: "Errore durante l'aggiornamento della visita" });
    }
}

// DELETE /visite/:id
async function remove(req, res) {
    const { id } = req.params;

    try {
        const result = await visitaModel.deleteVisita(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Visita non trovata" });
        }

        return res.status(200).json({ message: "Visita eliminata con successo" });
    } catch (error) {
        console.error("Errore in deleteVisita:", error);
        return res.status(500).json({ error: "Errore durante l'eliminazione della visita" });
    }
}

module.exports = {
    getAll,
    create,
    update,
    remove
};