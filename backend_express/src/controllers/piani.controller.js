const PianoModel = require('../models/piano.model');

async function getPlans(req, res) {

    try {

        const plans =
            await PianoModel.getAllPlans();

        res.json(plans);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}
async function createPlan(req, res) {
    try {
        console.log("Dati ricevuti in POST /piani:", req.body); // DEBUG
        const { paziente_id, medico_id } = req.body;
        
        const result = await PianoModel.createPlan(paziente_id, medico_id);
        
        res.status(201).json({ message: 'Piano creato', id: result.insertId });
    } catch (error) {
        console.error("--- ERRORE CRITICO DETTAGLIATO ---");
        console.error("Messaggio:", error.message);
        console.error("Codice errore SQL:", error.code);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ error: error.message });
    }
}

async function updatePlan(req, res) {
    try {
        const { id } = req.params;
        const { paziente_id, medico_id } = req.body; // Solo i campi esistenti

        await PianoModel.updatePlan(id, paziente_id, medico_id);

        res.json({ message: 'Piano aggiornato' });
    } catch (error) {
        // ... log dell'errore ...
    }
}
async function deletePlan(req, res) {

    try {

        const { id } = req.params;

        await PianoModel.deletePlan(id);

        res.json({
            message: 'Piano eliminato'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}
async function getAllPlans() {
    console.log("Entrato in getPlans, provo a chiamare il modello...");
    try {
        // Forza il log per vedere se PianoModel è definito
        if (!PianoModel || typeof PianoModel.getAllPlans !== 'function') {
            throw new Error("PianoModel o getAllPlans non definiti correttamente!");
        }

        const plans = await PianoModel.getAllPlans();
        console.log("Query completata, risultati:", plans);
        res.json(plans);
    } catch (error) {
        console.error("ERRORE FATALE IN GETPLANS:", error); // Questo deve apparire in console!
        res.status(500).json({ 
            error: error.message,
            stack: error.stack // Aggiungiamo lo stack per vedere dove fallisce
        });
    }
}

async function getPlanById(req, res) {
    try {
        const { id } = req.params;
        const plan = await PianoModel.getPlanById(id);
        if (!plan) {
            return res.status(404).json({ message: "Piano non trovato" });
        }
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// AGGIUNGI ANCHE QUESTA SE LA USI NELLE ROTTE
async function getFullPlan(req, res) {
    try {
        const { id } = req.params;
        const plan = await PianoModel.getFullPlan(id);
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Ricordati di esportarla nel module.exports in fondo al file!
module.exports = {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlans,
    getPlanById,
    getFullPlan
};