const express = require("express");
const router = express.Router();
const { listar, criar, atualizar, deletar } = require("../controllers/despesasController");
const { authMiddleware } = require("../middleware/auth");

router.use(authMiddleware);

router.get("/", listar);
router.post("/", criar);
router.put("/:id", atualizar);
router.delete("/:id", deletar);

module.exports = router;
