const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");

// NOTE: in production add middleware to require admin
router.get("/", controller.dashboard);
router.post("/user/:id/delete", controller.deleteUser);

module.exports = router;
