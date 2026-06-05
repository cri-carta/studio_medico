const db = require('../config/database');

async function getAllPatients() {

    const [rows] = await db.query(
        'SELECT * FROM pazienti'
    );

    return rows;
}

async function createPatient(nome, cognome, eta) {

    const [result] = await db.query(

        `INSERT INTO pazienti
        (nome, cognome, eta)
        VALUES (?, ?, ?)`,

        [nome, cognome, eta]

    );

    return result;
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
        `DELETE FROM pazienti
        WHERE id = ?`,

        [id]

    );

    return result;
    
}

module.exports = {
    getAllPatients,
    createPatient,
    updatePatient,
    deletePatient
};

