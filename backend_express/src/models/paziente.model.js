const db = require('../config/database');

async function getAllPatients() {

    const [rows] = await db.query(
        'SELECT * FROM pazienti'
    );

    return rows;
}

module.exports = {
    getAllPatients
};