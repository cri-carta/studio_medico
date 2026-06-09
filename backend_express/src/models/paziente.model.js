//backend_express/src/models/paziente.model.js
const db = require('../config/database');

// Recupera tutti i pazienti dal DB. Restituisce un array di oggetti paziente.
async function getAllPatients() {
    const [rows] = await db.query('SELECT * FROM pazienti');
    return rows;
}

// Recupera un singolo paziente tramite il suo ID. Restituisce l'oggetto paziente o undefined se non trovato.
async function getPatientById(id) {
    const [rows] = await db.query(
        'SELECT * FROM pazienti WHERE id = ?',
        [id]
    );
    return rows[0];
}

// Crea un nuovo paziente e la sua prima visita insieme.
// Se una delle due operazioni fallisce, nessuna delle due viene salvata nel DB e viene eseguito il rollback.
// Restituisce un oggetto con l'insertId del paziente appena creato.
async function createPatient(utente_id, medico_id, nome, cognome, data_nascita, altezza, obiettivo, anamnesi, peso, bmi, bf) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [result] = await conn.query(
            `INSERT INTO pazienti (utente_id, medico_id, nome, cognome, data_nascita, altezza, obiettivo, anamnesi)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [utente_id, medico_id, nome, cognome, data_nascita, altezza, obiettivo, anamnesi]
        );

        const paziente_id = result.insertId;

        // Prima visita automatica
        await conn.query(
            `INSERT INTO visite (paziente_id, data_visita, peso, bmi, bf)
             VALUES (?, CURDATE(), ?, ?, ?)`,
            [paziente_id, peso, bmi, bf]
        );

        await conn.commit();
        return { insertId: paziente_id };

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

// Aggiorna i dati anagrafici e clinici di un paziente tramite ID. Restituisce il risultato della query (include affectedRows).
async function updatePatient(id, nome, cognome, data_nascita, altezza, obiettivo, anamnesi) {
    const [result] = await db.query(
        `UPDATE pazienti
         SET nome = ?, cognome = ?, data_nascita = ?, altezza = ?, obiettivo = ?, anamnesi = ?
         WHERE id = ?`,
        [nome, cognome, data_nascita, altezza, obiettivo, anamnesi, id]
    );
    return result;
}

// Elimina un paziente dal DB tramite ID. Restituisce il risultato della query (include affectedRows).
async function deletePatient(id) {
    const [result] = await db.query(
        `DELETE FROM pazienti WHERE id = ?`,
        [id]
    );
    return result;
}

module.exports = {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient
};