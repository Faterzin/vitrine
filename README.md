# Vitrine

> Plataforma de classificados (estilo OLX simplificado) construída sobre **MongoDB** para explorar **schema flexível**: anúncios de naturezas completamente diferentes (carros, imóveis, serviços freelance) coexistem na mesma coleção, cada um com seus próprios atributos.

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-8.x-880000)

Trabalho da disciplina de **Banco de Dados** — Projeto 3.

---

## Índice

- [O problema](#o-problema)
- [O que o sistema faz](#o-que-o-sistema-faz)
- [Stack](#stack)
- [Como rodar localmente](#como-rodar-localmente)
- [API](#api)
- [Modelagem dos documentos](#modelagem-dos-documentos)
- [Tratamento de campos ausentes](#tratamento-de-campos-ausentes)
- [MongoDB vs PostgreSQL](#mongodb-vs-postgresql--reflexão)
- [Adicionando uma nova categoria](#adicionando-uma-nova-categoria)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Limitações e fora-de-escopo](#limitações-e-fora-de-escopo)

---

## O problema

Em um banco relacional como o PostgreSQL, armazenar anúncios de tipos completamente diferentes na mesma tabela exige malabarismo: dezenas de colunas opcionais que ficam nulas na maioria dos registros, herança de tabelas, ou padrões EAV difíceis de consultar.

Um carro tem **quilometragem, combustível, portas**. Um apartamento tem **metragem, andar, vagas**. Um freelance tem **stack, modalidade, valor/hora**. Esses campos não se encontram entre si.

O MongoDB foi projetado exatamente pra isso: cada documento traz o próprio "shape", e dois documentos da mesma coleção podem ter campos completamente diferentes.

**O desafio central:** fazer dados tão diferentes coexistirem na mesma coleção e exibi-los corretamente no front-end, sem quebrar quando um campo esperado não existe.

---

## O que o sistema faz

- **Feed unificado** com anúncios de todas as categorias na mesma tela
- **Filtro por categoria** (Carros, Imóveis, Freelance, ou Todos)
- **Página de detalhe** que renderiza dinamicamente apenas os atributos do documento — não há código por categoria na renderização
- **Cadastro** de novo anúncio com formulário que muda os campos automaticamente conforme a categoria selecionada
- **Exclusão** de anúncios direto pela página de detalhe
- **Tratamento defensivo de campos ausentes** — se um atributo não existe, exibe `—` em vez de quebrar

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Backend | Node.js + Express |
| ODM | Mongoose (schema com `Mixed` para flexibilidade) |
| Banco | MongoDB Atlas (cluster M0 grátis) |
| Frontend | HTML + CSS + JS puros (sem framework) |

O backend serve o frontend estático na **mesma porta** (`express.static`), então tudo roda em uma única URL.

---

## Como rodar localmente

### 1. Pré-requisitos
- Node.js 18+
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas) com um cluster M0
- IP liberado em **Network Access** (use `0.0.0.0/0` pra simplificar)

### 2. Configurar variáveis de ambiente
```bash
cd backend
cp .env.example .env
# edite .env e cole a connection string do Atlas em MONGODB_URI
```

`.env.example`:
```
MONGODB_URI=mongodb+srv://USUARIO:SENHA@CLUSTER.mongodb.net/vitrine?retryWrites=true&w=majority
PORT=3000
```

### 3. Instalar e subir
```bash
npm install
npm start
```

Abra [`http://localhost:3000`](http://localhost:3000).

### 4. (Opcional) Popular com exemplos
Importe `docs/exemplos.json` na coleção `anuncios` via MongoDB Compass, ou cadastre pelos próprios formulários da aplicação.

---

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/anuncios` | Lista todos. Aceita `?categoria=carro\|imovel\|freelance` |
| `GET` | `/api/anuncios/:id` | Detalhe de um anúncio |
| `POST` | `/api/anuncios` | Cria. Valida `categoria` e atributos obrigatórios |
| `DELETE` | `/api/anuncios/:id` | Remove um anúncio |

### Exemplo — criar um carro

```bash
curl -X POST http://localhost:3000/api/anuncios \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Honda Civic 2018",
    "categoria": "carro",
    "preco": 78000,
    "descricao": "Único dono",
    "atributos": {
      "quilometragem": 65000,
      "combustivel": "flex",
      "portas": 4
    }
  }'
```

### Exemplo — erro de validação (atributo faltando)

```bash
curl -X POST http://localhost:3000/api/anuncios \
  -H "Content-Type: application/json" \
  -d '{ "titulo": "X", "categoria": "carro", "preco": 1000 }'

# 400 Bad Request
# { "erros": [
#     "atributos.quilometragem é obrigatório para carro",
#     "atributos.combustivel é obrigatório para carro",
#     "atributos.portas é obrigatório para carro"
# ]}
```

---

## Modelagem dos documentos

Coleção única: `anuncios`. Cada documento representa um anúncio de qualquer tipo.

### Campos comuns (todo documento tem)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `_id` | ObjectId | Gerado pelo Mongo |
| `titulo` | string | Obrigatório |
| `categoria` | enum | `carro` \| `imovel` \| `freelance` — **discriminator** |
| `preco` | number | Obrigatório, >= 0 |
| `descricao` | string | Opcional |
| `imagemUrl` | string | Opcional (URL ou placeholder do `picsum`) |
| `atributos` | object (Mixed) | Atributos específicos da categoria |
| `criadoEm`, `atualizadoEm` | Date | `timestamps` do Mongoose |

### Atributos específicos por categoria

| Atributo | Carro | Imóvel | Freelance |
| --- | :---: | :---: | :---: |
| `quilometragem` | ✅ number | — | — |
| `combustivel` | ✅ string | — | — |
| `portas` | ✅ number | — | — |
| `metragem` | — | ✅ number | — |
| `andar` | — | ✅ number | — |
| `vagas` | — | ✅ number | — |
| `stack` | — | — | ✅ array |
| `modalidade` | — | — | ✅ string |
| `valorHora` | — | — | ✅ number |

### Por que aninhar os atributos em `atributos: {}`?

Esta é a decisão central da modelagem. Em vez de espalhar os campos específicos no nível raiz, todos vivem dentro de um sub-objeto `atributos`. Vantagens:

- **Renderização genérica:** o front itera `Object.entries(anuncio.atributos)` em vez de ter um `switch (categoria)`
- **Crescer é barato:** adicionar uma categoria nova é apenas uma nova entrada no validator + labels — nenhuma migração de schema
- **Separação clara:** o que é comum a todos os anúncios fica no nível raiz; o que é específico fica no sub-objeto. Lendo o documento, você sabe imediatamente.

### Por que `Mixed`?

O schema do Mongoose define:

```js
atributos: { type: mongoose.Schema.Types.Mixed, default: {} }
```

`Mixed` faz o Mongoose aceitar **qualquer estrutura** ali dentro. A disciplina não vem do ODM — vem do **validator manual em `backend/src/validators/anuncio.js`**, que checa, por categoria, quais atributos são obrigatórios e seus tipos antes do `Anuncio.create`.

Esse é o trade-off honesto do schema flexível: o banco para de te proteger, então a aplicação precisa proteger.

---

## Tratamento de campos ausentes

Três camadas de proteção contra "documento sem o campo X":

### 1. Entrada (backend)
[`backend/src/validators/anuncio.js`](backend/src/validators/anuncio.js) — função `validar` rejeita com `400 Bad Request` se faltar atributo obrigatório ou se o tipo estiver errado. Roda **antes** do `Anuncio.create` no controller.

### 2. Renderização do feed (frontend)
[`frontend/js/feed.js`](frontend/js/feed.js) — usa optional chaining e fallbacks:
```js
${a.titulo ?? "Sem título"}
${formatarPreco(a.preco)}        // trata null
${imagemFallback(a.imagemUrl)}   // placeholder se vazio
```

### 3. Página de detalhe (frontend)
[`frontend/js/detalhe.js`](frontend/js/detalhe.js) — **nunca acessa um campo pelo nome esperado**. Itera o que veio:

```js
const linhas = Object.entries(anuncio.atributos || {}).map(([chave, valor]) => {
  const rotulo = labels[chave] || chave;
  return `<tr><th>${rotulo}</th><td>${formatarValor(valor)}</td></tr>`;
});
```

Se o campo não existe no documento, ele simplesmente não aparece. Não há `undefined` na tela porque não há acesso especulativo.

> **Resumindo:** o front não acessa, ele espelha. O documento dita o que aparece.

---

## MongoDB vs PostgreSQL — reflexão

A pergunta certa não é "qual banco é melhor". É "qual encaixa neste problema".

### Por que Mongo encaixou aqui

- **Atributos disjuntos.** Os campos específicos das categorias quase não se sobrepõem. Em SQL viraria coluna nullable em massa, herança de tabela, ou EAV — todos desconfortáveis.
- **Crescimento de categorias.** Adicionar bicicleta, instrumento musical, animal — em SQL é migration. Em Mongo é só novo shape de documento.
- **Renderização genérica.** Como cada documento traz seu próprio shape, o front itera. Sem `switch` por tipo.

### Quando Postgres ganharia

- **Integridade transacional forte** (qualquer coisa financeira, transferências, estoque)
- **Muito relacionamento** com joins complexos (usuário ↔ anúncio ↔ mensagem ↔ histórico de preço)
- **Schema estável** com queries analíticas pesadas (relatórios, BI, agregações multi-tabela)
- **Constraints garantidas pelo banco** (FK, CHECK, UNIQUE compostos) em vez de delegadas à aplicação

### O custo do schema flexível

A responsabilidade de validar dados sai do banco e cai sobre o backend. Se o validator falhar ou for esquecido, dados inconsistentes entram. É um trade-off real — **ganha-se flexibilidade de evolução, paga-se com mais cuidado na entrada**.

---

## Adicionando uma nova categoria

Suponha que se queira adicionar **bicicleta** com atributos `marca`, `aro` (number) e `marchas` (number). Os pontos a tocar:

1. [`backend/src/models/Anuncio.js`](backend/src/models/Anuncio.js) — adicionar `"bicicleta"` no enum de `categoria`
2. [`backend/src/validators/anuncio.js`](backend/src/validators/anuncio.js) — adicionar entrada `bicicleta` em `REGRAS`
3. [`frontend/js/api.js`](frontend/js/api.js) — adicionar entradas em `LABELS` e `CATEGORIAS`
4. [`frontend/js/novo.js`](frontend/js/novo.js) — adicionar entrada em `CAMPOS`
5. [`frontend/novo.html`](frontend/novo.html) — adicionar `<option>` no select

> Os 5 lugares revelam uma duplicação de schema entre back e front. Em uma evolução natural do projeto, o backend exporia uma rota `GET /api/categorias` com a metadata, e o front consumiria — eliminando 3 dos 5 pontos.

---

## Estrutura do projeto

```
vitrine/
├── backend/
│   ├── src/
│   │   ├── server.js              # bootstrap Express + serve frontend estático
│   │   ├── db.js                  # conexão Mongoose
│   │   ├── routes/anuncios.js     # rotas REST
│   │   ├── controllers/anuncios.js
│   │   ├── models/Anuncio.js      # schema Mongoose (atributos: Mixed)
│   │   └── validators/anuncio.js  # validação por categoria
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html                 # feed
│   ├── detalhe.html               # detalhe dinâmico
│   ├── novo.html                  # form com campos por categoria
│   ├── css/styles.css
│   └── js/{api,feed,detalhe,novo}.js
└── docs/
    └── exemplos.json              # 1 documento de cada categoria
```

A separação de responsabilidades segue o padrão clássico:

- **Rotas** só roteiam — recebem o request e chamam o controller
- **Controllers** aplicam regras de negócio (incluindo a chamada ao validator)
- **Models** conhecem o banco
- **Validators** ficam isolados — fáceis de testar, fáceis de evoluir

Trocar Express por outro framework, ou Mongoose por driver nativo, afetaria poucos arquivos.

---

## Limitações e fora-de-escopo

Decisões conscientes de **não fazer**, alinhadas com o enunciado:

- **Sem autenticação ou perfil de usuário** — qualquer um anuncia, qualquer um exclui
- **Sem upload real de imagem** — apenas URL (com fallback pro `picsum`)
- **Sem mensagens entre comprador e vendedor**
- **Sem paginação** no feed — todos os anúncios voltam numa request
- **Sem testes automatizados**
- **Duplicação de schema entre back e front** — descrita acima, com plano claro de mitigação

São fronteiras escolhidas pra manter o projeto focado no que ele se propõe a explorar: **schema flexível em MongoDB**.
