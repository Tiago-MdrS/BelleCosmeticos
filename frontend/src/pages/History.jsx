import React, { useEffect, useState } from "react";
import { getSales, cancelSale } from "../services/api";
import { useStore } from "../store";

export function History() {
  const { isDarkMode } = useStore();
  const [sales, setSales] = useState([]);

  async function loadData() {
    const data = await getSales();
    setSales(data || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCancel(id) {
    const motivo = prompt("Motivo da devolução:");

    if (!motivo) return;

    const confirmar = confirm("Deseja devolver essa venda?");

    if (!confirmar) return;

    const result = await cancelSale(id, motivo);

    notify[result.sucesso ? "success" : "error"](result.mensagem || result.erro);

    loadData();
  }

  const card = isDarkMode
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-gray-200";

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Histórico de Vendas</h1>

      {sales.length === 0 && (
        <div className="text-gray-400 text-center p-10">
          Nenhuma venda encontrada
        </div>
      )}

      <div className="space-y-3">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className={`${card} border p-4 rounded-xl flex justify-between items-center`}
          >
            <div>
              <p className="font-semibold">
                Venda #{sale.id}
              </p>

              <p className="text-sm text-gray-400">
                {new Date(sale.data_venda).toLocaleString()}
              </p>

              <p className="text-sm">
                Total: R$ {Number(sale.total).toFixed(2)}
              </p>

              <p className="text-xs text-gray-400">
                {sale.forma_pagamento}
              </p>

              {sale.status === "devolvida" && (
                <span className="text-red-500 text-xs">
                  Devolvida
                </span>
              )}
            </div>

            {sale.status !== "devolvida" && (
              <button
                onClick={() => handleCancel(sale.id)}
                className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-100"
              >
                Devolver
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}