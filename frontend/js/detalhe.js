function formatarValor(v) {
  if (v == null) return "—";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

function renderAtributos(anuncio) {
  // Itera dinamicamente o que o documento tem. Se um campo esperado
  // não existe, ele simplesmente não aparece — sem crash, sem
  // "undefined" na tela. Esta é a estratégia central pra schema
  // flexível: o front não assume nada, espelha o que veio.
  const labels = LABELS[anuncio.categoria] || {};
  const attrs = anuncio.atributos || {};
  const linhas = Object.entries(attrs).map(([chave, valor]) => {
    const rotulo = labels[chave] || chave;
    return `<tr><th>${rotulo}</th><td>${formatarValor(valor)}</td></tr>`;
  });
  if (!linhas.length) return '<p style="color:#6e6e73;">Sem atributos adicionais.</p>';
  return `<table>${linhas.join("")}</table>`;
}

async function carregar() {
  const id = new URLSearchParams(location.search).get("id");
  const div = document.getElementById("conteudo");
  if (!id) {
    div.innerHTML = '<p class="erro">ID não informado.</p>';
    return;
  }
  try {
    const a = await detalhar(id);
    const cat = CATEGORIAS.find((c) => c.id === a.categoria)?.nome || a.categoria;
    div.innerHTML = `
      <img src="${imagemFallback(a.imagemUrl)}" alt="${a.titulo ?? ""}" />
      <span class="badge">${cat}</span>
      <h2>${a.titulo ?? "Sem título"}</h2>
      <div class="preco-grande">${formatarPreco(a.preco)}</div>
      <p>${a.descricao || "Sem descrição."}</p>
      <h3>Detalhes</h3>
      ${renderAtributos(a)}
      <div class="acoes">
        <button id="btn-excluir" class="btn-excluir" title="Excluir anúncio" aria-label="Excluir anúncio">
          🗑️ Excluir anúncio
        </button>
      </div>
    `;
    document.getElementById("btn-excluir").addEventListener("click", async () => {
      if (!confirm("Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.")) return;
      try {
        await remover(id);
        location.href = "/";
      } catch (err) {
        alert("Erro ao excluir: " + err.message);
      }
    });
  } catch (e) {
    div.innerHTML = `<p class="erro">${e.message}</p>`;
  }
}

carregar();
