import React, { useEffect, useRef, useState } from 'react';
import {
  ScanBarcode,
  ShoppingCart,
  Trash2,
  Check,
  Plus,
  Minus,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
} from 'lucide-react';
import { useStore } from '../store';
import { getProducts, getSales, createSale } from '../services/api';

export function Sales({ setActivePage }) {
  const { isDarkMode, addSaleFromBackend } = useStore();
  const barcodeRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [salesToday, setSalesToday] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [clientName, setClientName] = useState('');

  async function loadData() {
    const productsData = await getProducts();
    const salesData = await getSales();

    setProducts(Array.isArray(productsData) ? productsData : []);
    setSalesToday(Array.isArray(salesData) ? salesData : []);
  }

  useEffect(() => {
    loadData();
    setTimeout(() => barcodeRef.current?.focus(), 300);
  }, []);

  function getName(p) {
    return p.name || p.nome || 'Produto';
  }

  function getPrice(p) {
    return Number(p.price || p.preco_venda || 0);
  }

  function getStock(p) {
    return Number(p.quantity || p.quantidade || 0);
  }

  function getBarcode(p) {
    return p.barcode || p.codigo_barras || '';
  }

  function formatMoney(v) {
    return Number(v || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  const subtotal = cart.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0
  );

const discountValue = subtotal * (Number(discount || 0) / 100);
const total = Math.max(subtotal - discountValue, 0);

  function addToCart(product) {
    const stock = getStock(product);

    if (stock <= 0) return alert('Sem estoque');

    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);

      if (exists) {
        if (exists.quantity + 1 > stock) return prev;
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [
        {
          id: product.id,
          name: getName(product),
          price: getPrice(product),
          quantity: 1,
          stock,
          barcode: getBarcode(product),
        },
        ...prev,
      ];
    });
  }

  function handleSearch(value) {
    const v = value.toLowerCase().trim();

    const product =
      products.find((p) => getBarcode(p) === v) ||
      products.find((p) => getName(p).toLowerCase().includes(v));

    if (!product) return alert('Produto não encontrado');

    addToCart(product);
    setBarcodeInput('');
    barcodeRef.current?.focus();
  }

  function updateQuantity(id, q) {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.max(1, Number(q)) }
          : i
      )
    );
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function clearSale() {
    setCart([]);
    setDiscount(0);
    setClientName('');
    setBarcodeInput('');
    barcodeRef.current?.focus();
  }

  async function finalizeSale() {
    if (!cart.length) return alert('Carrinho vazio');

    const result = await createSale({
      cliente: clientName || 'Cliente não informado',
      desconto: discountValue,
      forma_pagamento: paymentMethod,
      itens: cart.map((item) => ({
        produto_id: Number(item.id),
        quantidade: Number(item.quantity),
      })),
    });

    const vendaId = result?.venda?.id || Date.now();

    cart.forEach((item) => {
      addSaleFromBackend({
        id: `${vendaId}-${item.id}`,
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        value: item.price * item.quantity,
        date: new Date().toISOString(),
      });
    });

  await loadData();
  clearSale();

  if (setActivePage) {
    setActivePage('reports');
  }

  alert('Venda finalizada');
}

  const panel = isDarkMode
    ? 'bg-slate-800 border-pink-900/40'
    : 'bg-white border-pink-100';

  const input = isDarkMode
    ? 'bg-slate-700 text-white border-slate-600'
    : 'bg-white border-pink-200';

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Caixa</h1>
      </div>

      {/* BUSCA */}
      <div className={`${panel} border rounded-xl p-5`}>
        <div className="flex gap-3 items-center">
          <ScanBarcode className="text-pink-600" />

          <input
            ref={barcodeRef}
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(barcodeInput)}
            placeholder="Bipe ou digite produto"
            className={`w-full px-4 py-3 rounded-xl border ${input}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        {/* CARRINHO */}
        <div className={`${panel} border rounded-xl`}>
          <div className="bg-pink-600 text-white px-5 py-3 font-bold flex justify-between">
            <span>Itens</span>
            <span>{cart.length}</span>
          </div>

          {!cart.length ? (
            <div className="p-10 text-center text-gray-400">
              Carrinho vazio
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="p-3 text-left">Produto</th>
                  <th>Qtd</th>
                  <th>Preço</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {cart.map((i) => (
                  <tr key={i.id} className="border-b">
                    <td className="p-3">{i.name}</td>

                    <td>
                      <input
                        type="number"
                        value={i.quantity}
                        onChange={(e) =>
                          updateQuantity(i.id, e.target.value)
                        }
                        className="w-16 text-center border rounded"
                      />
                    </td>

                    <td>{formatMoney(i.price)}</td>
                    <td>{formatMoney(i.price * i.quantity)}</td>

                    <td>
                      <button onClick={() => removeItem(i.id)}>
                        <Trash2 className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* RESUMO */}
        <div className={`${panel} border rounded-xl p-5 space-y-4`}>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Desconto (%)"
              value={discount}
              min={0}
              max={100}
              onChange={(e) => setDiscount(e.target.value)}
              className={`w-full px-3 py-2 border rounded ${input}`}
            />
            <span className="text-lg font-bold">%</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Desconto ({discount}%)</span>
              <span>- {formatMoney(subtotal * (discount / 100))}</span>
            </div>
          )}

          <div className="bg-pink-600 text-white p-5 rounded-xl text-center">
            <h2 className="text-3xl font-bold">
              {formatMoney(total)}
            </h2>
          </div>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={`w-full px-3 py-2 border rounded ${input}`}
          >
            <option>Dinheiro</option>
            <option>Pix</option>
            <option>Cartão</option>
          </select>

          <button
            onClick={finalizeSale}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
}