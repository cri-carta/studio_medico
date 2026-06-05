const PianoModel = require('../models/piano.model');

async function getPlans(req, res) {

    try {

        const plans =
            await PianoModel.getAllPlans();

        res.json(plans);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

async function createPlan(req, res) {

    try {

        const {
            paziente_id,
            nome_piano,
            calorie,
            descrizione,
            data_creazione
        } = req.body;

        const result =
            await PianoModel.createPlan(
                paziente_id,
                nome_piano,
                calorie,
                descrizione,
                data_creazione
            );

        res.status(201).json({

            message: 'Piano creato',

            id: result.insertId

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

async function updatePlan(req, res) {

    try {

        const { id } = req.params;

        const {
            paziente_id,
            nome_piano,
            calorie,
            descrizione,
            data_creazione
        } = req.body;

        await PianoModel.updatePlan(
            id,
            paziente_id,
            nome_piano,
            calorie,
            descrizione,
            data_creazione
        );

        res.json({
            message: 'Piano aggiornato'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

async function deletePlan(req, res) {

    try {

        const { id } = req.params;

        await PianoModel.deletePlan(id);

        res.json({
            message: 'Piano eliminato'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

module.exports = {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan
};