import express from "express";
import db from "../database.js";

const router = express.Router();

router.get("/", (req, res) => {
  const produtos = db.prepare(`
    SELECT * FROM produtos 
    WHERE ativo = 1 
    ORDER BY nome
  `).all();

  res.json(produtos);
});

router.get("/buscar", (req, res) => {
  const { q } = req.query;

  const produtos = db.prepare(`
    SELECT * FROM produtos
    WHERE ativo = 1
    AND (nome LIKE ? OR codigo_barras LIKE ? OR categoria LIKE ?)
    ORDER BY nome
  `).all(`%${q}%`, `%${q}%`, `%${q}%`);

  res.json(produtos);
});

router.post("/", (req, res) => {
  const {
    nome,
    codigo_barras,
    categoria,
    preco_compra,
    preco_venda,
    quantidade,
    estoque_minimo,
    fornecedor
  } = req.body;

  const result = db.prepare(`
    INSERT INTO produtos 
    (nome, codigo_barras, categoria, preco_compra, preco_venda, quantidade, estoque_minimo, fornecedor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    nome,
    codigo_barras,
    categoria,
    preco_compra,
    preco_venda,
    quantidade,
    estoque_minimo,
    fornecedor
  );

  res.json({ id: result.lastInsertRowid, mensagem: "Produto cadastrado com sucesso!" });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    nome,
    codigo_barras,
    categoria,
    preco_compra,
    preco_venda,
    quantidade,
    estoque_minimo,
    fornecedor
  } = req.body;

  db.prepare(`
    UPDATE produtos SET
      nome = ?,
      codigo_barras = ?,
      categoria = ?,
      preco_compra = ?,
      preco_venda = ?,
      quantidade = ?,
      estoque_minimo = ?,
      fornecedor = ?
    WHERE id = ?
  `).run(
    nome,
    codigo_barras,
    categoria,
    preco_compra,
    preco_venda,
    quantidade,
    estoque_minimo,
    fornecedor,
    id
  );

  res.json({ mensagem: "Produto atualizado com sucesso!" });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.prepare(`
    UPDATE produtos SET ativo = 0 WHERE id = ?
  `).run(id);

  res.json({ mensagem: "Produto removido com sucesso!" });
});

export default router;