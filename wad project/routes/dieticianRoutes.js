const express = require("express");
const router = express.Router();
const controller = require("../controllers/dieticianController");

router.get("/", controller.list);
router.get("/:id", controller.profile);

module.exports = router;
