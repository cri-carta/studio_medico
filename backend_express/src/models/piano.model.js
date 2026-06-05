const db = require('../config/database');

async function getAllPlans() {

    const [rows] = await db.query(
        'SELECT * FROM piani_alimentari'
    );

    return rows;
}

module.exports = {
    getAllPlans
};