const db = require('../config/database');

async function getAllPatients() {
    const [rows] = await db.query('SELECT * FROM pazienti');
    return rows;
}

async function getPatientsByDoctor(id) {
    const [rows] = await db.query(
        `SELECT p.id, p.utente_id, p.medico_id, p.nome, p.cognome, p.data_nascita, p.altezza, p.obiettivo, p.anamnesi
         FROM pazienti AS p
         WHERE p.medico_id = ?`,
        [id]
    );
    return rows;
}

async function getPatientById(id) {
    const [rows] = await db.query(
        'SELECT * FROM pazienti WHERE id = ?',
        [id]
    );
    return rows[0];
}

async function getPatientByUtenteId(utenteId) {
    const [rows] = await db.query(
        'SELECT * FROM pazienti WHERE utente_id = ?',
        [utenteId]
    );
    return rows[0];
}

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

        await conn.query(
            `INSERT INTO visite (paziente_id, medico_id, data_visita, peso, bmi, bf)
             VALUES (?, ?, CURDATE(), ?, ?, ?)`,
            [paziente_id, medico_id, peso, bmi, bf]
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

async function updatePatient(id, nome, cognome, data_nascita, altezza, obiettivo, anamnesi) {
    const [result] = await db.query(
        `UPDATE pazienti
         SET nome = ?, cognome = ?, data_nascita = ?, altezza = ?, obiettivo = ?, anamnesi = ?
         WHERE id = ?`,
        [nome, cognome, data_nascita, altezza, obiettivo, anamnesi, id]
    );
    return result;
}

async function deletePatient(id) {
    const [result] = await db.query(
        `DELETE FROM pazienti WHERE id = ?`,
        [id]
    );
    return result;
}

module.exports = {
    getAllPatients,
    getPatientsByDoctor,
    getPatientById,
    getPatientByUtenteId,
    createPatient,
    updatePatient,
    deletePatient
};