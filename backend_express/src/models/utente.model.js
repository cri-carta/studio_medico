//backend_express/src/models/utente.model.js
const db = require('../config/database');

// Cerca un utente nel DB tramite email. Restituisce l'oggetto utente (incluso password_hash) o undefined se non trovato.
async function findUserByEmail(email) {

    const [rows] = await db.query(

        `SELECT * FROM utenti
        WHERE email = ?`,

        [email]

    );

    return rows[0];
}

// Crea un nuovo utente con email, password già hashata e ruolo. Restituisce il risultato della query (include insertId).
async function createUser(
    email,
    password_hash,
    ruolo
) {
    const [result] = await db.query(
        `INSERT INTO utenti
        (
            email,
            password_hash,
            ruolo
        )
        VALUES (?, ?, ?)`,

        [
            email,
            password_hash,
            ruolo
        ]

    );

    return result;

}

// Recupera tutti gli utenti dal DB, escludendo la password. Restituisce un array con id, email e ruolo.
async function getAllUsers() {

    const [rows] = await db.query(

        `SELECT
            id,
            email,
            ruolo
        FROM utenti`

    );

    return rows;
}

module.exports = {
    findUserByEmail,
    createUser,
    getAllUsers
}