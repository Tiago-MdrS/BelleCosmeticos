import express from "express";
import db from "../database.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const vendas = db.prepare(`
      SELECT * FROM vendas
      ORDER BY data_venda DESC
    `).all();

    res.json(vendas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.post("/", (req, res) => {
  try {
    const {
      cliente = "",
      itens = [],
      desconto = 0,
      forma_pagamento = "Dinheiro"
    } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: "A venda precisa ter itens." });
    }

    const criarVenda = db.transaction(() => {
      let subtotal = 0;

      for (const item of itens) {
        const produtoId = item.produto_id || item.productId || item.id;
        const quantidade = Number(item.quantidade || item.quantity || 1);

        const produto = db.prepare(`
          SELECT * FROM produtos WHERE id = ? AND ativo = 1
        `).get(produtoId);

        if (!produto) {
          throw new Error(`Produto não encontrado: ${produtoId}`);
        }

        if (Number(produto.quantidade) < quantidade) {
          throw new Error(`Estoque insuficiente para: ${produto.nome}`);
        }

        subtotal += Number(produto.preco_venda) * quantidade;
      }

      const descontoNumber = Number(desconto || 0);
      const total = subtotal - descontoNumber;

      const vendaResult = db.prepare(`
        INSERT INTO vendas (cliente, subtotal, desconto, total, forma_pagamento)
        VALUES (?, ?, ?, ?, ?)
      `).run(cliente, subtotal, descontoNumber, total, forma_pagamento);

      const vendaId = vendaResult.lastInsertRowid;

      for (const item of itens) {
        const produtoId = item.produto_id || item.productId || item.id;
        const quantidade = Number(item.quantidade || item.quantity || 1);

        const produto = db.prepare(`
          SELECT * FROM produtos WHERE id = ?
        `).get(produtoId);

        const itemSubtotal = Number(produto.preco_venda) * quantidade;

        db.prepare(`
          INSERT INTO itens_venda
          (venda_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          vendaId,
          produto.id,
          produto.nome,
          quantidade,
          Number(produto.preco_venda),
          itemSubtotal
        );

        db.prepare(`
          UPDATE produtos
          SET quantidade = quantidade - ?
          WHERE id = ?
        `).run(quantidade, produto.id);

        db.prepare(`
          INSERT INTO movimentacoes_estoque
          (produto_id, tipo, quantidade, descricao)
          VALUES (?, 'saida', ?, ?)
        `).run(produto.id, quantidade, `Venda #${vendaId}`);
      }

      return {
        id: vendaId,
        subtotal,
        desconto: descontoNumber,
        total
      };
    });

    const venda = criarVenda();

    res.status(201).json({
      mensagem: "Venda registrada com sucesso!",
      venda
    });

  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

export default router;