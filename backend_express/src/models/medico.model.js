//backend_express/src/models/medico.model.js
const db = require('../config/database');

// Recupera tutti i medici dal DB. Restituisce un array di oggetti medico.
async function getAllMedici() {
    const [rows] = await db.query('SELECT * FROM medici');
    return rows;
}

// Recupera un singolo medico tramite il suo ID. Restituisce l'oggetto medico o undefined se non trovato.
async function getMedicoById(id) {
    const [rows] = await db.query(
        'SELECT * FROM medici WHERE id = ?',
        [id]
    );
    return rows[0];
}

// Recupera un medico tramite l'ID dell'utente associato. Restituisce l'oggetto medico o undefined se non trovato.
async function getMedicoByUtenteId(utente_id) {
    const [rows] = await db.query(
        'SELECT * FROM medici WHERE utente_id = ?',
        [utente_id]
    );
    return rows[0];
}

// Inserisce un nuovo medico nel DB con i dati forniti. Restituisce il risultato della query (include insertId).
async function createMedico(utente_id, nome, cognome) {
    const [result] = await db.query(
        `INSERT INTO medici (utente_id, nome, cognome)
         VALUES (?, ?, ?)`,
        [utente_id, nome, cognome]
    );
    return result;
}

// Aggiorna nome e cognome di un medico esistente tramite ID. Restituisce il risultato della query (include affectedRows).
async function updateMedico(id, nome, cognome) {
    const [result] = await db.query(
        `UPDATE medici
         SET nome = ?, cognome = ?
         WHERE id = ?`,
        [nome, cognome, id]
    );
    return result;
}

// Elimina un medico dal DB tramite ID. Restituisce il risultato della query (include affectedRows).
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