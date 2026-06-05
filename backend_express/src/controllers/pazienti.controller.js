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

async function createPatient(req, res) {

    try {

        const {
            nome,
            cognome,
            eta
        } = req.body;

        const result =
            await PazienteModel.createPatient(
                nome,
                cognome,
                eta
            );

        res.status(201).json({

            message: 'Paziente creato',

            id: result.insertId

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

module.exports = {
    getPatients,
    createPatient
};