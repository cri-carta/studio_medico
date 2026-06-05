const db = require('../config/database');

async function getPlanById(id) {

    const [rows] = await db.query(

        `SELECT * FROM piani_alimentari
        WHERE id = ?`,

        [id]

    );

    return rows[0];
}



async function getFullPlan(pianoId) {
    const query = `
        SELECT 
            gp.giorno, 
            p.tipo_pasto, 
            vp.alimento, 
            vp.grammi,
            gp.totale_kcal, gp.totale_proteine, gp.totale_carboidrati, gp.totale_grassi
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

async function createPlan(
    paziente_id,
    nome_piano,
    calorie,
    descrizione,
    data_creazione
) {

    const [result] = await db.query(

        `INSERT INTO piani_alimentari
        (
            paziente_id,
            nome_piano,
            calorie,
            descrizione,
            data_creazione
        )
        VALUES (?, ?, ?, ?, ?)`,

        [
            paziente_id,
            nome_piano,
            calorie,
            descrizione,
            data_creazione
        ]

    );

    return result;
}

async function updatePlan(
    id,
    paziente_id,
    nome_piano,
    calorie,
    descrizione,
    data_creazione
) {

    const [result] = await db.query(

        `UPDATE piani_alimentari
        SET
            paziente_id = ?,
            nome_piano = ?,
            calorie = ?,
            descrizione = ?,
            data_creazione = ?
        WHERE id = ?`,

        [
            paziente_id,
            nome_piano,
            calorie,
            descrizione,
            data_creazione,
            id
        ]

    );

    return result;
}

async function deletePlan(id) {

    const [result] = await db.query(

        `DELETE FROM piani_alimentari
        WHERE id = ?`,

        [id]

    );

    return result;
}

module.exports = {
    getPlanById,
    getFullPlan,
    createPlan,
    updatePlan,
    deletePlan
};