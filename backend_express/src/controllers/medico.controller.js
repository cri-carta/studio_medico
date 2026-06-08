const MedicoModel = require('../models/medico.model');

async function getMedici(req, res) {
    try {
        const medici = await MedicoModel.getAllMedici();
        res.json(medici);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getMedico(req, res) {
    try {
        const medico = await MedicoModel.getMedicoById(req.params.id);
        if (!medico) {
            return res.status(404).json({ error: 'Medico non trovato.' });
        }
        res.json(medico);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createMedico(req, res) {
    try {
        const { utente_id, nome, cognome } = req.body;

        if (!utente_id || !nome || !cognome) {
            return res.status(400).json({ error: 'Campi utente_id, nome e cognome obbligatori.' });
        }

        const result = await MedicoModel.createMedico(utente_id, nome, cognome);
        res.status(201).json({ message: 'Medico creato', id: result.insertId });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateMedico(req, res) {
    try {
        const { id }           = req.params;
        const { nome, cognome } = req.body;

        await MedicoModel.updateMedico(id, nome, cognome);
        res.json({ message: 'Medico aggiornato' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteMedico(req, res) {
    try {
        await MedicoModel.deleteMedico(req.params.id);
        res.json({ message: 'Medico eliminato' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getMedici,
    getMedico,
    createMedico,
    updateMedico,
    deleteMedico
};