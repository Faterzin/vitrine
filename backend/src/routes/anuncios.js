const express = require("express");
const ctrl = require("../controllers/anuncios");

const router = express.Router();

router.get("/", ctrl.listar);
router.get("/:id", ctrl.detalhar);
router.post("/", ctrl.criar);
router.delete("/:id", ctrl.remover);

module.exports = router;
