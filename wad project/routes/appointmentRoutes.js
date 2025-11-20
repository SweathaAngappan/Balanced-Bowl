const express = require("express");
const router = express.Router();
const controller = require("../controllers/appointmentController");

// book flow
router.get("/book/:did", controller.bookForm);
router.post("/book/:did", controller.book);

// payment mock
router.get("/:id/pay", controller.payPage);
router.post("/:id/pay/mock", controller.mockPay);

// user appointments
router.get("/my", controller.myAppointments);

module.exports = router;
