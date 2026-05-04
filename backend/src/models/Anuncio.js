const mongoose = require("mongoose");

// Schema intencionalmente flexível: `atributos` é Mixed para permitir
// shapes diferentes por categoria. A validação dos campos específicos
// fica no validator (validators/anuncio.js), executado no controller
// antes do save. Isso evita que o Mongoose enforça schema rígido e
// nos permite demonstrar o ponto de "schema flexível" do projeto.
const AnuncioSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    categoria: {
      type: String,
      required: true,
      enum: ["carro", "imovel", "freelance"],
    },
    preco: { type: Number, required: true, min: 0 },
    descricao: { type: String, default: "" },
    imagemUrl: { type: String, default: "" },
    atributos: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } }
);

module.exports = mongoose.model("Anuncio", AnuncioSchema);
