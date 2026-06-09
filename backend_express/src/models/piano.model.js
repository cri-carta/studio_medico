//backend_express/src/models/piano.model.js
const db = require('../config/database');

// Recupera un piano alimentare tramite il suo ID. Restituisce l'oggetto piano o undefined se non trovato.
async function getPlanById(id) {
    const [rows] = await db.query(
        `SELECT * FROM piani_alimentari WHERE id = ?`,
        [id]
    );
    return rows[0];
}

// Recupera il dettaglio completo di un piano: per ogni giorno, i pasti e i relativi alimenti con i grammi.
// Restituisce un array di righe, ognuna con: giorno, tipo_pasto, alimento, grammi.
// Nota: Ho rimosso le colonne gp.totale_kcal, ecc. perché non presenti in db.sql
async function getFullPlan(pianoId) {
    const query = `
        SELECT 
            gp.giorno, 
            p.tipo_pasto, 
            vp.alimento, 
            vp.grammi
        FROM piani_alimentari pa
            JOIN giorni_piano gp ON pa.id = gp.piano_id   -- collega il piano ai suoi giorni
            JOIN pasti p ON gp.id = p.giorno_id            -- collega ogni giorno ai suoi pasti
            JOIN voci_pasto vp ON p.id = vp.pasto_id       -- collega ogni pasto ai suoi alimenti
        WHERE pa.id = ?
        ORDER BY gp.giorno, p.tipo_pasto;
    `;

    const [rows] = await db.query(query, [pianoId]);
    return rows;
}

// Crea un nuovo piano alimentare associato a un paziente e un medico. Restituisce il risultato della query (include insertId).
// Aggiornato secondo la struttura: id, paziente_id, medico_id, created_at
async function createPlan(paziente_id, medico_id) {
    const [result] = await db.query(
        `INSERT INTO piani_alimentari (paziente_id, medico_id) VALUES (?, ?)`,
        [paziente_id, medico_id]
    );
    return result;
}

// Aggiorna il paziente e il medico associati a un piano tramite ID. Restituisce il risultato della query (include affectedRows).
// Nota: data la struttura del DB, non ci sono altri campi aggiornabili oltre a paziente_id e medico_id.
async function updatePlan(id, paziente_id, medico_id) {
    const [result] = await db.query(
        `UPDATE piani_alimentari SET paziente_id = ?, medico_id = ? WHERE id = ?`,
        [paziente_id, medico_id, id]
    );
    return result;
}

// Elimina un piano alimentare dal DB tramite ID. Restituisce il risultato della query (include affectedRows).
async function deletePlan(id) {
    const [result] = await db.query(
        `DELETE FROM piani_alimentari WHERE id = ?`,
        [id]
    );
    return result;
}

// Recupera tutti i piani alimentari dal DB. Restituisce un array di oggetti piano.
async function getAllPlans() {
    const [rows] = await db.query('SELECT * FROM piani_alimentari');
    return rows;
}
// Recupera il piano alimentare specifico dal DB.
async function getFullPlanByPazienteId(pazienteId) {
    const query = `
        SELECT 
            gp.giorno, 
            p.tipo_pasto, 
            vp.alimento, 
            vp.grammi,
            vp.kcal,
            vp.proteine,
            vp.carboidrati,
            vp.grassi
        FROM piani_alimentari pa
            JOIN giorni_piano gp ON pa.id = gp.piano_id
            JOIN pasti p ON gp.id = p.giorno_id
            JOIN voci_pasto vp ON p.id = vp.pasto_id
        WHERE pa.paziente_id = ?
        ORDER BY pa.created_at DESC, gp.giorno, p.tipo_pasto;
    `;

    const [rows] = await db.query(query, [pazienteId]);
    return rows;
}


module.exports = {
    getPlanById,
    getFullPlan,
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlans,
    getFullPlanByPazienteId
};