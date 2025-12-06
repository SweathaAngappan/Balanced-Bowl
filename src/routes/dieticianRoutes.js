const express = require('express');
const router = express.Router();
const dietician = require('../controllers/dieticianController');

router.get('/', dietician.list);
router.get('/:id', dietician.showProfile);
router.post('/create', dietician.createProfile); // protected in real app

module.exports = router;
