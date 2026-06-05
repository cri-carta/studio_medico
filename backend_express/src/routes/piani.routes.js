const express = require('express');

const router = express.Router();

const {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan
} = require('../controllers/piani.controller');

router.get('/', getPlans);

router.post('/', createPlan);

router.put('/:id', updatePlan);

router.delete('/:id', deletePlan);

module.exports = router;