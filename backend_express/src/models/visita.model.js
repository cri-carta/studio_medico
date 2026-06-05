const db = require('../config/database');

async function getAllVisits() {

    const [rows] = await db.query(
        'SELECT * FROM visite'
    );

    return rows;
    
}

async function createVisita(id, paziente_id, medico_id, data_visita, peso) {
    const [result] = await db.query(
        `INSERT INTO visite
        (id, paziente_id, medico_id, data_visita, peso)
        VALUES (?, ?, ?, ?, ?)`
        
        [id, paziente_id, medico_id, data_visita, peso]
    );
    
    return result;
}

async function updateVisita(id, data_visita, peso) {
    const [result] = await db.query(
        `UPDATE visite
        (id, data_visita, peso)`
        
        [id, data_visita, peso]

        
    );    

    return result;
}

async function deleteVisita(id, data_visita, peso) {
    const [result] = await db.query(
        `DELETE visite
        (id, data_visita, peso)`
        
        [id, data_visita, peso]

        
    );    

    return result;
}



module.exports = {
    getAllVisits,
    createVisita,
    updateVisita,
    deleteVisita

};