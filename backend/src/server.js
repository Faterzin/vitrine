require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { connect } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Frontend estático servido pela mesma porta — simplifica entrega.
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

const PORT = process.env.PORT || 3000;

connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Vitrine no ar em http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Falha ao conectar Mongo:", err.message);
    process.exit(1);
  });
