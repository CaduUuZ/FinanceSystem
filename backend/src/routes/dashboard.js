const express = require("express");
const router = express.Router();
const { resumo } = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/auth");

router.use(authMiddleware);

router.get("/resumo", resumo);

module.exports = router;
