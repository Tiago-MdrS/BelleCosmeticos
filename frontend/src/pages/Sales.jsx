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
  const dropdownRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [salesToday, setSalesToday] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
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

  function focusBarcode() {
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 100);
  }

  useEffect(() => {
    loadData();
    focusBarcode();

    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
      focusBarcode();
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
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

  function beepSuccess() {
    new Audio('/beep.mp3').play().catch(() => {});
  }

  function beepError() {
    new Audio('/error.mp3').play().catch(() => {});
  }

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discountValue = subtotal * (Number(discount || 0) / 100);
  const total = Math.max(subtotal - discountValue, 0);

  function addToCart(product) {
    const stock = getStock(product);
    if (stock <= 0) return notify.error('Sem estoque');

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

  function handleInputChange(value) {
    setBarcodeInput(value);
    setSelectedSuggestionIndex(-1);

    const v = value.toLowerCase().trim();

    if (!v) {
      setSuggestions([]);
      return;
    }

    // Se parecer código de barras (só números com 4+ dígitos), não mostra dropdown
    const isBarcode = /^\d{4,}$/.test(v);
    if (isBarcode) {
      setSuggestions([]);
      return;
    }

    const matched = products.filter((p) =>
      getName(p).toLowerCase().includes(v)
    );

    setSuggestions(matched.slice(0, 10));
  }

  function handleSearch(value) {
    const v = value.toLowerCase().trim();
    if (!v) return;

    setSuggestions([]);
    setSelectedSuggestionIndex(-1);

    // Busca exata por código de barras
    const byBarcode = products.find((p) => getBarcode(p) === v);
    if (byBarcode) {
      addToCart(byBarcode);
      beepSuccess();
      setBarcodeInput('');
      focusBarcode();
      return;
    }

    const matched = products.filter((p) =>
      getName(p).toLowerCase().includes(v)
    );

    if (matched.length === 1) {
      addToCart(matched[0]);
      beepSuccess();
      setBarcodeInput('');
      focusBarcode();
      return;
    }

    if (matched.length > 1) {
      setSuggestions(matched.slice(0, 10));
      return;
    }

    beepError();
  }

  function selectSuggestion(product) {
    addToCart(product);
    beepSuccess();
    setBarcodeInput('');
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    focusBarcode();
  }

  function handleKeyDown(e) {
    if (!suggestions.length) {
      if (e.key === 'Enter') handleSearch(barcodeInput);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        selectSuggestion(suggestions[selectedSuggestionIndex]);
      } else {
        handleSearch(barcodeInput);
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  }

  function updateQuantity(id, q) {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, Number(q)) } : i
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
    setSuggestions([]);
    focusBarcode();
  }

  async function finalizeSale() {
    if (!cart.length) return notify.error('Carrinho vazio');

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
    notify.success('Venda finalizada');
    focusBarcode();
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
        <h1
          className={`text-3xl font-display font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Caixa
        </h1>
      </div>

      {/* Barra de busca com autocomplete */}
      <div className={`${panel} border rounded-xl p-5`}>
        <div className="flex gap-3 items-center" ref={dropdownRef}>
          <ScanBarcode className="text-pink-600 shrink-0" />

          <div className="relative w-full">
            <input
              ref={barcodeRef}
              value={barcodeInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bipe o código de barras ou digite o nome do produto"
              className={`w-full px-4 py-3 rounded-xl border ${input}`}
              autoComplete="off"
            />

            {/* Dropdown de sugestões */}
            {suggestions.length > 0 && (
              <div
                className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-2xl z-50 overflow-hidden ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-600'
                    : 'bg-white border-pink-100'
                }`}
              >
                {/* Cabeçalho do dropdown */}
                <div
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${
                    isDarkMode
                      ? 'text-slate-400 border-slate-700 bg-slate-900/60'
                      : 'text-slate-500 border-pink-50 bg-pink-50'
                  }`}
                >
                  {suggestions.length} produto(s) — ↑↓ navegar · Enter selecionar · Esc fechar
                </div>

                {suggestions.map((product, index) => {
                  const stock = getStock(product);
                  const isSelected = index === selectedSuggestionIndex;
                  const outOfStock = stock <= 0;
                  const lowStock = !outOfStock && stock <= 5;

                  return (
                    <button
                      key={product.id}
                      onClick={() => !outOfStock && selectSuggestion(product)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b last:border-0 ${
                        isDarkMode ? 'border-slate-700' : 'border-pink-50'
                      } ${
                        outOfStock
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-pink-600 text-white'
                          : isDarkMode
                          ? 'hover:bg-slate-700 text-white'
                          : 'hover:bg-pink-50 text-gray-900'
                      }`}
                    >
                      {/* Nome e detalhes */}
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate">
                          {getName(product)}
                        </span>
                        <span
                          className={`text-xs mt-0.5 truncate ${
                            isSelected
                              ? 'text-pink-100'
                              : isDarkMode
                              ? 'text-slate-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {[
                            product.category || product.categoria,
                            product.color || product.cor,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </div>

                      {/* Preço e estoque */}
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span
                          className={`font-bold text-sm ${
                            isSelected ? 'text-white' : 'text-pink-600'
                          }`}
                        >
                          {formatMoney(getPrice(product))}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${
                            outOfStock
                              ? 'bg-red-100 text-red-600'
                              : lowStock
                              ? 'bg-yellow-100 text-yellow-700'
                              : isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {outOfStock ? 'Sem estoque' : `${stock} un.`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
            <div className="p-10 text-center text-gray-400">Carrinho vazio</div>
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
                        onChange={(e) => updateQuantity(i.id, e.target.value)}
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
            <h2 className="text-3xl font-bold">{formatMoney(total)}</h2>
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
            onClick={() => {
              if (!cart.length) return;
              if (confirm('Cancelar a compra atual?')) clearSale();
            }}
            className={`w-full py-3 rounded-xl font-bold border transition ${
              isDarkMode
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cancelar Compra
          </button>

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