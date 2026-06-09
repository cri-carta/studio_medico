//backend_express/src/models/visita.model.js
const db = require('../config/database');

// Recupera tutte le visite dal DB. Restituisce un array di oggetti visita.
async function getAllVisits() {
    const [rows] = await db.query('SELECT * FROM visite');
    return rows;
}

// Recupera tutte le visite di un paziente ordinate per data crescente. Restituisce un array di oggetti visita.
async function getVisiteByPaziente(paziente_id) {
    const [rows] = await db.query(
        'SELECT * FROM visite WHERE paziente_id = ? ORDER BY data_visita ASC',
        [paziente_id]
    );
    return rows;
}

// Recupera la prima e l'ultima visita di un paziente in un'unica query.
// Usa UNION ALL per unire due sottoquery separate:
//   - la prima prende la visita più vecchia (ORDER BY data_visita ASC LIMIT 1)
//   - la seconda prende la visita più recente (ORDER BY data_visita DESC LIMIT 1)
// Restituisce un array di al massimo 2 elementi: [primaVisita, ultimaVisita].
async function getPrimaUltimaVisita(paziente_id) {
    const [rows] = await db.query(
        `(SELECT * FROM visite WHERE paziente_id = ? ORDER BY data_visita ASC LIMIT 1)
         UNION ALL
         (SELECT * FROM visite WHERE paziente_id = ? ORDER BY data_visita DESC LIMIT 1)`,
        [paziente_id, paziente_id]
    );
    return rows;
}

// Inserisce una nuova visita per un paziente con i dati clinici forniti. Restituisce il risultato della query (include insertId).
async function createVisita(paziente_id, medico_id, data_visita, peso, bmi, bf) {
    const [result] = await db.query(
        `INSERT INTO visite (paziente_id, medico_id, data_visita, peso, bmi, bf)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [paziente_id, medico_id, data_visita, peso, bmi, bf]
    );
    return result;
}

// Aggiorna i dati clinici di una visita esistente tramite ID. Restituisce il risultato della query (include affectedRows).
async function updateVisita(id, data_visita, peso, bmi, bf) {
    const [result] = await db.query(
        `UPDATE visite
         SET data_visita = ?, peso = ?, bmi = ?, bf = ?
         WHERE id = ?`,
        [data_visita, peso, bmi, bf, id]
    );
    return result;
}

// Elimina una visita dal DB tramite ID. Restituisce il risultato della query (include affectedRows).
async function deleteVisita(id) {
    const [result] = await db.query(
        `DELETE FROM visite WHERE id = ?`,
        [id]
    );
    return result;
}

module.exports = {
    getAllVisits,
    getVisiteByPaziente,
    getPrimaUltimaVisita,
    createVisita,
    updateVisita,
    deleteVisita
};