const express = require('express');
const router = express.Router();
const visiteController = require('../controllers/visite.controller'); 


router.get('/', visiteController.getAll);


router.post('/', visiteController.create);


router.put('/:id', visiteController.update);


router.delete('/:id', visiteController.remove);

module.exports = router;