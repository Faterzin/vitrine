// Campos por categoria — refletem o validator do back. Mudou um lado,
// mude o outro. Em produção, o ideal seria o back expor essa metadata
// via endpoint pra evitar duplicação.
const CAMPOS = {
  carro: [
    { nome: "quilometragem", label: "Quilometragem (km)", tipo: "number" },
    { nome: "combustivel", label: "Combustível", tipo: "text" },
    { nome: "portas", label: "Número de portas", tipo: "number" },
  ],
  imovel: [
    { nome: "metragem", label: "Metragem (m²)", tipo: "number" },
    { nome: "andar", label: "Andar", tipo: "number" },
    { nome: "vagas", label: "Vagas de garagem", tipo: "number" },
  ],
  freelance: [
    { nome: "stack", label: "Stack (separe por vírgula)", tipo: "text" },
    { nome: "modalidade", label: "Modalidade (remoto/presencial)", tipo: "text" },
    { nome: "valorHora", label: "Valor por hora (R$)", tipo: "number" },
  ],
};

const selectCat = document.getElementById("categoria");
const dyn = document.getElementById("atributos-dinamicos");
const form = document.getElementById("form");
const msg = document.getElementById("msg");

selectCat.addEventListener("change", () => {
  const cat = selectCat.value;
  const campos = CAMPOS[cat] || [];
  dyn.innerHTML = campos
    .map(
      (c) =>
        `<label for="${c.nome}">${c.label}</label>
         <input id="${c.nome}" name="${c.nome}" type="${c.tipo}" required />`
    )
    .join("");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  msg.className = "";

  const cat = selectCat.value;
  if (!cat) {
    msg.textContent = "Escolha uma categoria.";
    msg.className = "erro";
    return;
  }

  const atributos = {};
  for (const c of CAMPOS[cat]) {
    const el = document.getElementById(c.nome);
    let v = el.value;
    if (c.tipo === "number") v = Number(v);
    if (c.nome === "stack") v = v.split(",").map((s) => s.trim()).filter(Boolean);
    atributos[c.nome] = v;
  }

  const payload = {
    titulo: document.getElementById("titulo").value,
    categoria: cat,
    preco: Number(document.getElementById("preco").value),
    descricao: document.getElementById("descricao").value,
    imagemUrl: document.getElementById("imagemUrl").value,
    atributos,
  };

  try {
    await criar(payload);
    msg.textContent = "Anúncio publicado! Redirecionando…";
    msg.className = "sucesso";
    setTimeout(() => (location.href = "/"), 800);
  } catch (err) {
    msg.textContent = err.message;
    msg.className = "erro";
  }
});
