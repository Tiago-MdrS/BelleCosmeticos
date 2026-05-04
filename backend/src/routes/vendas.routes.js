import express from "express";
import db from "../database.js";

const router = express.Router();

router.get("/", (req, res) => {
  const vendas = db.prepare(`
    SELECT * FROM vendas
    ORDER BY data_venda DESC
  `).all();

  res.json(vendas);
});

router.post("/", (req, res) => {
  const { cliente, itens, desconto = 0, forma_pagamento } = req.body;

  if (!itens || itens.length === 0) {
    return res.status(400).json({ erro: "A venda precisa ter itens" });
  }

  const criarVenda = db.transaction(() => {
    let subtotal = 0;

    for (const item of itens) {
      const produto = db.prepare(`
        SELECT * FROM produtos WHERE id = ?
      `).get(item.produto_id);

      if (!produto) {
        throw new Error(`Produto não encontrado: ${item.produto_id}`);
      }

      if (produto.quantidade < item.quantidade) {
        throw new Error(`Estoque insuficiente para: ${produto.nome}`);
      }

      subtotal += produto.preco_venda * item.quantidade;
    }

    const total = subtotal - desconto;

    const vendaResult = db.prepare(`
      INSERT INTO vendas (cliente, subtotal, desconto, total, forma_pagamento)
      VALUES (?, ?, ?, ?, ?)
    `).run(cliente, subtotal, desconto, total, forma_pagamento);

    const vendaId = vendaResult.lastInsertRowid;

    for (const item of itens) {
      const produto = db.prepare(`
        SELECT * FROM produtos WHERE id = ?
      `).get(item.produto_id);

      const itemSubtotal = produto.preco_venda * item.quantidade;

      db.prepare(`
        INSERT INTO itens_venda
        (venda_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        vendaId,
        produto.id,
        produto.nome,
        item.quantidade,
        produto.preco_venda,
        itemSubtotal
      );

      db.prepare(`
        UPDATE produtos
        SET quantidade = quantidade - ?
        WHERE id = ?
      `).run(item.quantidade, produto.id);

      db.prepare(`
        INSERT INTO movimentacoes_estoque
        (produto_id, tipo, quantidade, descricao)
        VALUES (?, 'saida', ?, ?)
      `).run(produto.id, item.quantidade, `Venda #${vendaId}`);
    }

    return {
      id: vendaId,
      subtotal,
      desconto,
      total
    };
  });

  try {
    const venda = criarVenda();
    res.json({ mensagem: "Venda registrada com sucesso!", venda });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

export default router;