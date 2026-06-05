const PianoModel = require('../models/piano.model');

async function getPlans(req, res) {

    try {

        const plans= await PianoModel.getAllPlans();

        res.json(plans);

    } catch (error) {

        res.status(500).json({
            error: eroor.message
        });
    }
}

module.exports = {
    getPlans
};