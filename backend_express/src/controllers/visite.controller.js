const VisitaModel = require('../models/visita.model');

async function getVisits(req, res) {

    try {

        const visits = await VisitaModel.getAllVisits();

        res.json(visits);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

module.exports = {
    getVisits
};