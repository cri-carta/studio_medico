const db = require('../config/database');

async function getAllVisits() {
    const [rows] = await db.query('SELECT * FROM visite');
    return rows;
}

async function getVisiteByPaziente(paziente_id) {
    const [rows] = await db.query(
        'SELECT * FROM visite WHERE paziente_id = ? ORDER BY data_visita ASC',
        [paziente_id]
    );
    return rows;
}

async function getPrimaUltimaVisita(paziente_id) {
    const [rows] = await db.query(
        `(SELECT * FROM visite WHERE paziente_id = ? ORDER BY data_visita ASC LIMIT 1)
         UNION ALL
         (SELECT * FROM visite WHERE paziente_id = ? ORDER BY data_visita DESC LIMIT 1)`,
        [paziente_id, paziente_id]
    );
    return rows;
}

async function createVisita(paziente_id, medico_id, data_visita, peso, bmi, bf) {
    const [result] = await db.query(
        `INSERT INTO visite (paziente_id, medico_id, data_visita, peso, bmi, bf)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [paziente_id, medico_id, data_visita, peso, bmi, bf]
    );
    return result;
}

async function updateVisita(id, data_visita, peso, bmi, bf) {
    const [result] = await db.query(
        `UPDATE visite
         SET data_visita = ?, peso = ?, bmi = ?, bf = ?
         WHERE id = ?`,
        [data_visita, peso, bmi, bf, id]
    );
    return result;
}

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