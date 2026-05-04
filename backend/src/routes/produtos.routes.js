import express from "express";
import db from "../database.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const produtos = db.prepare(`
      SELECT * FROM produtos 
      WHERE ativo = 1 
      ORDER BY nome
    `).all();

    res.json(produtos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get("/buscar", (req, res) => {
  try {
    const { q = "" } = req.query;

    const produtos = db.prepare(`
      SELECT * FROM produtos
      WHERE ativo = 1
      AND (nome LIKE ? OR codigo_barras LIKE ? OR categoria LIKE ?)
      ORDER BY nome
    `).all(`%${q}%`, `%${q}%`, `%${q}%`);

    res.json(produtos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.post("/", (req, res) => {
  try {
    const {
      nome,
      name,
      codigo_barras,
      barcode,
      categoria,
      category,
      preco_compra,
      cost,
      preco_venda,
      price,
      quantidade,
      quantity,
      estoque_minimo,
      minStock,
      fornecedor,
      supplier
    } = req.body;

    const produto = {
      nome: nome || name,
      codigo_barras: String(codigo_barras || barcode || "").trim() || null,
      categoria: categoria || category || "outros",
      preco_compra: Number(preco_compra ?? cost ?? 0),
      preco_venda: Number(preco_venda ?? price ?? 0),
      quantidade: Number(quantidade ?? quantity ?? 0),
      estoque_minimo: Number(estoque_minimo ?? minStock ?? 5),
      fornecedor: fornecedor || supplier || ""
    };

    if (!produto.nome) {
      return res.status(400).json({ erro: "Nome do produto é obrigatório." });
    }

    const result = db.prepare(`
      INSERT INTO produtos 
      (nome, codigo_barras, categoria, preco_compra, preco_venda, quantidade, estoque_minimo, fornecedor, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      produto.nome,
      produto.codigo_barras,
      produto.categoria,
      produto.preco_compra,
      produto.preco_venda,
      produto.quantidade,
      produto.estoque_minimo,
      produto.fornecedor
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      mensagem: "Produto cadastrado com sucesso!"
    });

  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res.status(400).json({ erro: "Código de barras já cadastrado." });
    }

    res.status(500).json({ erro: error.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      name,
      codigo_barras,
      barcode,
      categoria,
      category,
      preco_compra,
      cost,
      preco_venda,
      price,
      quantidade,
      quantity,
      estoque_minimo,
      minStock,
      fornecedor,
      supplier
    } = req.body;

    const produto = {
      nome: nome || name,
      codigo_barras: String(codigo_barras || barcode || "").trim() || null,
      categoria: categoria || category || "outros",
      preco_compra: Number(preco_compra ?? cost ?? 0),
      preco_venda: Number(preco_venda ?? price ?? 0),
      quantidade: Number(quantidade ?? quantity ?? 0),
      estoque_minimo: Number(estoque_minimo ?? minStock ?? 5),
      fornecedor: fornecedor || supplier || ""
    };

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
      produto.nome,
      produto.codigo_barras,
      produto.categoria,
      produto.preco_compra,
      produto.preco_venda,
      produto.quantidade,
      produto.estoque_minimo,
      produto.fornecedor,
      id
    );

    res.json({ mensagem: "Produto atualizado com sucesso!" });

  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res.status(400).json({ erro: "Código de barras já cadastrado." });
    }

    res.status(500).json({ erro: error.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    db.prepare(`
      UPDATE produtos SET ativo = 0 WHERE id = ?
    `).run(id);

    res.json({ mensagem: "Produto removido com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

export default router;