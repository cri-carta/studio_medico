const db = require('../config/database');

async function getAllVisits() {

    const [rows] = await db.query(
        'SELECT * FROM visite'
    );

    return rows;
    
}

module.exports = {
    getAllVisits
};