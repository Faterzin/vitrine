let categoriaAtual = null;

function renderFiltros() {
  const div = document.getElementById("filtros");
  const botoes = [
    { id: null, nome: "Todos" },
    ...CATEGORIAS,
  ];
  div.innerHTML = botoes
    .map(
      (b) =>
        `<button class="${categoriaAtual === b.id ? "ativo" : ""}" data-cat="${b.id ?? ""}">${b.nome}</button>`
    )
    .join("");
  div.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      categoriaAtual = btn.dataset.cat || null;
      carregar();
    });
  });
}

function renderCard(a) {
  // Tudo aqui é defensivo: optional chaining + fallback "—".
  // É o ponto exato a ser apontado na defesa quando perguntarem
  // como o front lida com campos ausentes.
  const cat = CATEGORIAS.find((c) => c.id === a.categoria)?.nome || a.categoria;
  return `
    <div class="card" onclick="location.href='/detalhe.html?id=${a._id}'">
      <img src="${imagemFallback(a.imagemUrl)}" alt="${a.titulo ?? "Anúncio"}" />
      <div class="conteudo">
        <span class="badge">${cat}</span>
        <h3>${a.titulo ?? "Sem título"}</h3>
        <div class="preco">${formatarPreco(a.preco)}</div>
      </div>
    </div>
  `;
}

async function carregar() {
  renderFiltros();
  const grid = document.getElementById("grid");
  grid.innerHTML = '<div class="vazio">Carregando...</div>';
  try {
    const anuncios = await listar(categoriaAtual);
    if (!anuncios.length) {
      grid.innerHTML = '<div class="vazio">Nenhum anúncio ainda.</div>';
      return;
    }
    grid.innerHTML = anuncios.map(renderCard).join("");
  } catch (e) {
    grid.innerHTML = `<div class="vazio">Erro: ${e.message}</div>`;
  }
}

carregar();
