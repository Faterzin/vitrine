const Anuncio = require("../models/Anuncio");
const { validar } = require("../validators/anuncio");

async function listar(req, res) {
  const filtro = {};
  if (req.query.categoria) filtro.categoria = req.query.categoria;
  const anuncios = await Anuncio.find(filtro).sort({ criadoEm: -1 }).lean();
  res.json(anuncios);
}

async function detalhar(req, res) {
  try {
    const anuncio = await Anuncio.findById(req.params.id).lean();
    if (!anuncio) return res.status(404).json({ erro: "Anúncio não encontrado" });
    res.json(anuncio);
  } catch (e) {
    res.status(400).json({ erro: "ID inválido" });
  }
}

async function criar(req, res) {
  const erros = validar(req.body);
  if (erros.length) return res.status(400).json({ erros });

  const { titulo, categoria, preco, descricao, imagemUrl, atributos } = req.body;
  const anuncio = await Anuncio.create({
    titulo,
    categoria,
    preco,
    descricao: descricao || "",
    imagemUrl: imagemUrl || "",
    atributos: atributos || {},
  });
  res.status(201).json(anuncio);
}

module.exports = { listar, detalhar, criar };
