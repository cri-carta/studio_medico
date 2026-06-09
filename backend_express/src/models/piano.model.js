const db = require('../config/database');

async function getPlanById(id) {
    const [rows] = await db.query(
        `SELECT * FROM piani_alimentari WHERE id = ?`,
        [id]
    );
    return rows[0];
}

// Nota: Ho rimosso le colonne gp.totale_kcal, ecc. perché non presenti in db.sql
async function getFullPlan(pianoId) {
    const query = `
        SELECT 
            gp.giorno, 
            p.tipo_pasto, 
            vp.alimento, 
            vp.grammi
        FROM piani_alimentari pa
        JOIN giorni_piano gp ON pa.id = gp.piano_id
        JOIN pasti p ON gp.id = p.giorno_id
        JOIN voci_pasto vp ON p.id = vp.pasto_id
        WHERE pa.id = ?
        ORDER BY gp.giorno, p.tipo_pasto;
    `;

    const [rows] = await db.query(query, [pianoId]);
    return rows;
}

// Aggiornato secondo la struttura: id, paziente_id, medico_id, created_at
async function createPlan(paziente_id, medico_id) {
    const [result] = await db.query(
        `INSERT INTO piani_alimentari (paziente_id, medico_id) VALUES (?, ?)`,
        [paziente_id, medico_id]
    );
    return result;
}

// In questo caso, data la struttura del DB, l'update è limitato
async function updatePlan(id, paziente_id, medico_id) {
    const [result] = await db.query(
        `UPDATE piani_alimentari SET paziente_id = ?, medico_id = ? WHERE id = ?`,
        [paziente_id, medico_id, id]
    );
    return result;
}

async function deletePlan(id) {
    const [result] = await db.query(
        `DELETE FROM piani_alimentari WHERE id = ?`,
        [id]
    );
    return result;
}

async function getAllPlans() {
    const [rows] = await db.query('SELECT * FROM piani_alimentari');
    return rows;
}

module.exports = {
    getPlanById,
    getFullPlan,
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlans // <--- AGGIUNGI QUESTA RIGA PER ESPORTARLA
};

