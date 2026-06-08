const express = require('express');

const router = express.Router();

const {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getPlanById,
    getFullPlan
} = require('../controllers/piani.controller');

router.get('/', getPlans);
router.get('/:id/full', getFullPlan);
router.get('/:id', getPlanById);
router.post('/', createPlan);

router.put('/:id', updatePlan);

router.delete('/:id', deletePlan);

module.exports = router;