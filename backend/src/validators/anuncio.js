// Validador por categoria. É AQUI que o "schema flexível" ganha
// disciplina: o Mongo aceitaria qualquer coisa, mas a aplicação
// rejeita atributos faltantes ou de tipo errado por categoria.
// Apontar este arquivo na defesa quando perguntarem onde mora a
// validação dos dados.

const REGRAS = {
  carro: {
    quilometragem: "number",
    combustivel: "string",
    portas: "number",
  },
  imovel: {
    metragem: "number",
    andar: "number",
    vagas: "number",
  },
  freelance: {
    stack: "array",
    modalidade: "string",
    valorHora: "number",
  },
};

function tipoOk(valor, tipo) {
  if (tipo === "array") return Array.isArray(valor);
  return typeof valor === tipo;
}

function validar(payload) {
  const erros = [];
  const { titulo, categoria, preco, atributos } = payload || {};

  if (!titulo || typeof titulo !== "string") erros.push("titulo é obrigatório (string)");
  if (!categoria || !REGRAS[categoria]) erros.push(`categoria inválida (use: ${Object.keys(REGRAS).join(", ")})`);
  if (preco == null || typeof preco !== "number" || preco < 0) erros.push("preco é obrigatório (number >= 0)");

  if (categoria && REGRAS[categoria]) {
    const regras = REGRAS[categoria];
    const attrs = atributos || {};
    for (const [campo, tipo] of Object.entries(regras)) {
      if (attrs[campo] === undefined || attrs[campo] === null) {
        erros.push(`atributos.${campo} é obrigatório para ${categoria}`);
      } else if (!tipoOk(attrs[campo], tipo)) {
        erros.push(`atributos.${campo} deve ser ${tipo}`);
      }
    }
  }

  return erros;
}

module.exports = { validar, REGRAS };
