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

async function UpdatePatient(id, nome, cognome, eta) {

    const [result] = await db.query(

        
    )
}

module.exports = {
    getAllPatients,
    createPatient
};

