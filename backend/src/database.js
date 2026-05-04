import Database from "better-sqlite3";

const db = new Database("belle.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo_barras TEXT UNIQUE,
    categoria TEXT,
    preco_compra REAL DEFAULT 0,
    preco_venda REAL NOT NULL,
    quantidade INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 5,
    fornecedor TEXT,
    data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP,
    ativo INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT,
    subtotal REAL NOT NULL,
    desconto REAL DEFAULT 0,
    total REAL NOT NULL,
    forma_pagamento TEXT NOT NULL,
    data_venda TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS itens_venda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venda_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    nome_produto TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES vendas(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  );

  CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    descricao TEXT,
    data_movimentacao TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  );
`);

export default db;