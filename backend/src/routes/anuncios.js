const express = require("express");
const ctrl = require("../controllers/anuncios");

const router = express.Router();

router.get("/", ctrl.listar);
router.get("/:id", ctrl.detalhar);
router.post("/", ctrl.criar);

module.exports = router;
