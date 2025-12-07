const express = require('express');
const router = express.Router();
const appointment = require('../controllers/appointmentController');

router.get('/book/:id', appointment.bookPage);
router.post('/create', appointment.create);
router.get('/my', appointment.myAppointments);

// ⭐ NEW — Dietician: My Clients
router.get('/clients', appointment.myClients);

router.post('/cancel/:id', appointment.cancel);
router.post('/remind/:id', appointment.sendReminder);

// STEP 1: Show checkout/payment page
router.post('/checkout', appointment.showCheckout);

// STEP 2: Handle payment
router.post('/pay', appointment.processPayment);

// RAZORPAY: create order
router.post('/create-order', appointment.createOrder);

module.exports = router;
