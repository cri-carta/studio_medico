const db = require('../config/database');

async function findUserByEmail(email) {

    const [rows] = await db.query(

        `SELECT * FROM utenti
        WHERE email = ?`,

        [email]

    );

    return rows[0];
}

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