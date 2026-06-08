const db = require('../config/database');

async function getAllPatients() {
    const [rows] = await db.query('SELECT * FROM pazienti');
    return rows;
}

async function getPatientById(id) {
    const [rows] = await db.query(
        'SELECT * FROM pazienti WHERE id = ?',
        [id]
    );
    return rows[0];
}

async function createPatient(nome, cognome, eta, peso, bmi, bf, medico_id) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Crea il paziente
        const [result] = await conn.query(
            `INSERT INTO pazienti (nome, cognome, eta)
             VALUES (?, ?, ?)`,
            [nome, cognome, eta]
        );

        const paziente_id = result.insertId;

        // Crea automaticamente la prima visita
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

async function updatePatient(id, nome, cognome, eta) {
    const [result] = await db.query(
        `UPDATE pazienti
         SET nome = ?, cognome = ?, eta = ?
         WHERE id = ?`,
        [nome, cognome, eta, id]
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
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
};