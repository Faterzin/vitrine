const API = "/api/anuncios";

async function listar(categoria) {
  const url = categoria ? `${API}?categoria=${categoria}` : API;
  const res = await fetch(url);
  return res.json();
}

async function detalhar(id) {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error("Anúncio não encontrado");
  return res.json();
}

async function remover(id) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.erro || "Erro ao excluir");
  }
}

async function criar(payload) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.erros || [data.erro]).join(", "));
  return data;
}

const LABELS = {
  carro: { quilometragem: "Quilometragem (km)", combustivel: "Combustível", portas: "Portas" },
  imovel: { metragem: "Metragem (m²)", andar: "Andar", vagas: "Vagas de garagem" },
  freelance: { stack: "Stack", modalidade: "Modalidade", valorHora: "Valor/hora (R$)" },
};

const CATEGORIAS = [
  { id: "carro", nome: "Carros" },
  { id: "imovel", nome: "Imóveis" },
  { id: "freelance", nome: "Freelance" },
];

function formatarPreco(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function imagemFallback(url) {
  return url || "https://picsum.photos/seed/vitrine/600/400";
}
