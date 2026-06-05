const PazienteModel = require('../models/paziente.model');

async function getPatients(req, res) {

    try {

        const patients = await PazienteModel.getAllPatients();

        res.json(patients);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
}

module.exports = {
    getPatients
};