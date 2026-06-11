const PazienteModel = require('../models/paziente.model');
const { spawn } = require('child_process');

const RAG_SCRIPT = 'C:\\Users\\user\\Desktop\\studio_medico\\backend_AI\\rag_system.py';
const PYTHON = 'C:\\Users\\user\\Desktop\\studio_medico\\backend_AI\\venv\\Scripts\\python.exe';

function indicizzaPazienteRAG(id, nome, cognome, obiettivo, anamnesi) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            id:        `paz_${id}`,
            nome:      `${nome} ${cognome}`,
            note:      anamnesi  || '',
            obiettivo: obiettivo || '',
        });
        const proc = spawn(PYTHON, [RAG_SCRIPT, 'add', payload]);
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

async function getPatientsByDoctor(req, res) {
    try {
        const { id } = req.params;
        const patients = await PazienteModel.getPatientsByDoctor(id);
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

async function createPatient(req, res) {
    try {
        const { utente_id, medico_id, nome, cognome, data_nascita, altezza, obiettivo, anamnesi, peso, bmi, bf } = req.body;

        const result = await PazienteModel.createPatient(
            utente_id, medico_id, nome, cognome,
            data_nascita, altezza, obiettivo, anamnesi,
            peso, bmi, bf
        );

        const paziente_id = result.insertId;

        indicizzaPazienteRAG(paziente_id, nome, cognome, obiettivo, anamnesi)
            .catch(err => console.error('[RAG] Errore indicizzazione:', err));

        res.status(201).json({ message: 'Paziente creato', id: paziente_id });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updatePatient(req, res) {
    try {
        const { id } = req.params;
        const { nome, cognome, data_nascita, altezza, obiettivo, anamnesi } = req.body;
        await PazienteModel.updatePatient(id, nome, cognome, data_nascita, altezza, obiettivo, anamnesi);
        res.json({ message: 'Paziente aggiornato' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deletePatient(req, res) {
    try {
        const paziente = await PazienteModel.getPatientById(req.params.id);
        if (!paziente) {
            return res.status(404).json({ error: 'Paziente non trovato' });
        }
        await PazienteModel.deletePatient(req.params.id);
        const db = require('../config/database');
        await db.query('DELETE FROM utenti WHERE id = ?', [paziente.utente_id]);
        res.json({ message: 'Paziente eliminato' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getPatients,
    getPatientsByDoctor,
    getPatientByUtenteId,
    createPatient,
    updatePatient,
    deletePatient
};