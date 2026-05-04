# Vitrine

Plataforma de classificados (estilo OLX simplificado) construída sobre **MongoDB** para explorar o conceito de **schema flexível**: anúncios de categorias completamente diferentes (carros, imóveis, serviços freelance) coexistem na mesma coleção, cada um com seus próprios atributos.

> Trabalho da disciplina de Banco de Dados — Projeto 3.

---

## O que o sistema faz

- Lista um feed de anúncios de várias categorias na mesma tela
- Filtra por categoria
- Mostra a página de detalhe de cada anúncio com **apenas os atributos daquela categoria**
- Permite cadastrar novos anúncios escolhendo a categoria (o formulário muda os campos automaticamente)
- Trata com segurança a ausência de atributos — se um campo não existe no documento, o sistema mostra `—` em vez de quebrar

## Stack

- **Backend:** Node.js + Express + Mongoose
- **Frontend:** HTML, CSS e JS puros (sem framework)
- **Banco:** MongoDB Atlas (cluster gratuito M0)

---

## Como rodar localmente

### 1. Pré-requisitos
- Node.js 18+
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas) com um cluster M0 (grátis)

### 2. Configurar variáveis de ambiente
```bash
cd backend
cp .env.example .env
# edite .env e cole sua connection string do Atlas em MONGODB_URI
```

### 3. Instalar e subir
```bash
npm install
npm start
```

Acesse `http://localhost:3000`. O Express serve a API em `/api/anuncios` e o frontend estático na raiz.

### 4. (Opcional) Popular o banco com os exemplos
Importe `docs/exemplos.json` na coleção `anuncios` via MongoDB Compass, ou cadastre pelos formulários.

---

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| GET  | `/api/anuncios`            | Lista todos. Aceita `?categoria=carro\|imovel\|freelance` |
| GET  | `/api/anuncios/:id`        | Detalhe de um anúncio |
| POST | `/api/anuncios`            | Cria. Valida `categoria` e os atributos obrigatórios daquela categoria |

---

## Decisões de modelagem

### 1. Coleção única `anuncios`
Os três tipos (carro, imóvel, freelance) ficam na mesma coleção. O Mongo permite sem dor o que no Postgres exigiria EAV ou herança de tabela.

### 2. Discriminator: campo `categoria`
Cada documento tem um campo `categoria` que é um enum (`carro` | `imovel` | `freelance`). É por ele que back e front sabem qual shape esperar.

### 3. Atributos específicos aninhados em `atributos`
Em vez de espalhar os campos no nível raiz do documento, os atributos específicos da categoria ficam dentro de um sub-objeto `atributos`. Vantagens:

- O front itera `Object.entries(atributos)` e renderiza dinamicamente — sem `if (categoria === 'carro') ...` na renderização
- Adicionar uma nova categoria (bicicleta, instrumento musical) é só novo case no validator + entrada nas labels do front. Nenhuma migração.
- Fica óbvio o que é "comum a todos" vs "específico da categoria" só lendo o documento

### 4. Schema flexível com validação manual
O `Schema` do Mongoose define `atributos` como `Mixed` — ou seja, o Mongoose não impõe nada. **A disciplina vem do `validators/anuncio.js`**, que checa, por categoria, quais atributos são obrigatórios e seus tipos. É lá que mora a resposta para "como vocês garantem dados válidos com schema flexível?".

### Tratamento de campos ausentes (camadas)

1. **Entrada (back):** o validator rejeita com 400 se faltar atributo obrigatório (ver [`backend/src/validators/anuncio.js`](backend/src/validators/anuncio.js))
2. **Exibição (front):** a renderização nunca acessa `anuncio.atributos.metragem` direto — itera `Object.entries(anuncio.atributos || {})` e usa optional chaining + fallback `?? "—"` em qualquer leitura defensiva (ver [`frontend/js/detalhe.js`](frontend/js/detalhe.js))

---

## MongoDB vs PostgreSQL — reflexão

A pergunta certa não é "qual banco é melhor", e sim "qual encaixa neste problema".

**Aqui o Mongo encaixou bem porque:**
- Os atributos específicos das categorias são **completamente disjuntos**. Em SQL viraria coluna nullable em massa, herança de tabela, ou um padrão EAV (Entity-Attribute-Value) que é desconfortável de consultar.
- O conjunto de categorias **vai crescer** com o tempo. Em SQL, cada categoria nova tende a virar migration. Em Mongo, é só novo shape de documento.
- A renderização do front fica genérica: itera o objeto e mostra. Sem `switch` por tipo.

**Postgres ganharia se:**
- Houvesse muito relacionamento com integridade forte (usuários, mensagens, histórico de preço) e fosse importante garantir foreign keys e transações ACID multi-tabela.
- Os campos fossem estáveis e queries analíticas com joins/agregações fossem o caso de uso central.
- A validação rigorosa de schema fosse uma prioridade não-negociável (em vez de delegada à aplicação).

**Custo do schema flexível:** a responsabilidade de validar dados sai do banco e cai sobre o backend. Se o validator falhar ou for esquecido, dados inconsistentes entram. É um trade-off real — ganha-se flexibilidade de evolução, paga-se com mais cuidado na entrada.

---

## Estrutura

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

A separação de responsabilidades segue o padrão usado no Projeto 2: rotas só roteiam, controllers aplicam regras de negócio (incluindo validação), models conhecem o banco. Trocar Express por Fastify ou Mongo por outro driver afetaria poucos arquivos.
