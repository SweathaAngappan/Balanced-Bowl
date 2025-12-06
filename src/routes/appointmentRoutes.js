const express = require('express');
const router = express.Router();
const appointment = require('../controllers/appointmentController');

router.get('/book/:id', appointment.bookPage);
router.post('/create', appointment.create);
router.get('/my', appointment.myAppointments);

module.exports = router;
