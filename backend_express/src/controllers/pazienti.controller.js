const PazienteModel = require('../models/paziente.model');
const { spawn }     = require('child_process');
const path          = require('path');

const PYTHON     = path.join(__dirname, '../..', 'backend_AI', 'venv', 'Scripts', 'python.exe');
const RAG_SCRIPT = path.join(__dirname, '../..', 'backend_AI', 'rag_system.py');

function indicizzaPazienteRAG(id, nome, eta, note, kcal) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({ id: `paz_${id}`, nome, eta, note, kcal });
        const proc    = spawn(PYTHON, [RAG_SCRIPT, 'add', payload]);
        proc.on('close', () => resolve());
    });
}

async function getPatients(req, res) {
    try {
        const patients = await PazienteModel.getAllPatients();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createPatient(req, res) {
    try {
        const { nome, cognome, eta, peso, bmi, bf, medico_id, note, kcal } = req.body;

        // 1. Salva su MySQL (paziente + prima visita)
        const result = await PazienteModel.createPatient(
            nome, cognome, eta, peso, bmi, bf, medico_id
        );

        const paziente_id = result.insertId;

        // 2. Indicizza su ChromaDB in background (non blocca la risposta)
        indicizzaPazienteRAG(paziente_id, `${nome} ${cognome}`, eta, note, kcal)
            .catch(err => console.error('[RAG] Errore indicizzazione:', err));

        res.status(201).json({
            message: 'Paziente creato',
            id:      paziente_id
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updatePatient(req, res) {
    try {
        const { id }                    = req.params;
        const { nome, cognome, eta }    = req.body;

        await PazienteModel.updatePatient(id, nome, cognome, eta);

        res.json({ message: 'Paziente aggiornato' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deletePatient(req, res) {
    try {
        const { id } = req.params;

        await PazienteModel.deletePatient(id);

        res.json({ message: 'Paziente eliminato' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getPatients,
    createPatient,
    updatePatient,
    deletePatient
};