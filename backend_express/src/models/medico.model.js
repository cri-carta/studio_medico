const db = require('../config/database');

async function getAllMedici() {
    const [rows] = await db.query('SELECT * FROM medici');
    return rows;
}

async function getMedicoById(id) {
    const [rows] = await db.query(
        'SELECT * FROM medici WHERE id = ?',
        [id]
    );
    return rows[0];
}

async function getMedicoByUtenteId(utente_id) {
    const [rows] = await db.query(
        'SELECT * FROM medici WHERE utente_id = ?',
        [utente_id]
    );
    return rows[0];
}

async function createMedico(utente_id, nome, cognome) {
    const [result] = await db.query(
        `INSERT INTO medici (utente_id, nome, cognome)
         VALUES (?, ?, ?)`,
        [utente_id, nome, cognome]
    );
    return result;
}

async function updateMedico(id, nome, cognome) {
    const [result] = await db.query(
        `UPDATE medici
         SET nome = ?, cognome = ?
         WHERE id = ?`,
        [nome, cognome, id]
    );
    return result;
}

async function deleteMedico(id) {
    const [result] = await db.query(
        `DELETE FROM medici WHERE id = ?`,
        [id]
    );
    return result;
}

module.exports = {
    getAllMedici,
    getMedicoById,
    getMedicoByUtenteId,
    createMedico,
    updateMedico,
    deleteMedico
};