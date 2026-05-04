import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Filter, ScanBarcode } from 'lucide-react';
import { useStore } from '../store';
import {
  getProducts,
  createProduct,
  editProduct,
  removeProduct,
} from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'maquiagem', label: 'Maquiagem' },
  { id: 'skincare', label: 'Skincare' },
  { id: 'perfumes', label: 'Perfumes' },
  { id: 'cabelos', label: 'Cabelos' },
  { id: 'corpo_banho', label: 'Corpo e Banho' },
  { id: 'unhas', label: 'Unhas' },
  { id: 'sobrancelhas', label: 'Sobrancelhas' },
  { id: 'cilios', label: 'Cílios' },
  { id: 'acessorios', label: 'Acessórios' },
  { id: 'higiene_pessoal', label: 'Higiene Pessoal' },
  { id: 'kits_presentes', label: 'Kits e Presentes' },
  { id: 'outros', label: 'Outros' },
];

function getCategoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id) || { label: id };
}

export function Inventory() {
  const { isDarkMode } = useStore();

  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'maquiagem',
    color: '',
    price: 0,
    quantity: 0,
    minQuantity: 5,
  });

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || product.nome || '',
        barcode: product.barcode || product.codigo_barras || '',
        category: product.category || product.categoria || 'outros',
        color: product.color || product.cor || '',
        price: product.price || product.preco_venda || 0,
        quantity: product.quantity || product.quantidade || 0,
        minQuantity: product.minQuantity || product.estoque_minimo || 5,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        barcode: '',
        category: 'maquiagem',
        color: '',
        price: 0,
        quantity: 0,
        minQuantity: 5,
      });
    }

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      nome: formData.name,
      codigo_barras: String(formData.barcode || '').trim(),
      categoria: formData.category,
      preco_compra: 0,
      preco_venda: Number(formData.price || 0),
      quantidade: Number(formData.quantity || 0),
      estoque_minimo: Number(formData.minQuantity || 0),
      fornecedor: '',
    };

    if (editingId) {
      await editProduct(editingId, data);
    } else {
      await createProduct(data);
    }

    await loadProducts();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await removeProduct(id);
    await loadProducts();
  };

  const lowStockProducts = products.filter(
    (p) =>
      Number(p.quantity || p.quantidade || 0) <=
      Number(p.minQuantity || p.estoque_minimo || 0)
  );

  const totalStock = products.reduce(
    (acc, p) => acc + Number(p.quantity || p.quantidade || 0),
    0
  );

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => (p.category || p.categoria) === selectedCategory);

  const countByCategory = (catId) =>
    catId === 'all'
      ? products.length
      : products.filter((p) => (p.category || p.categoria) === catId).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Estoque
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Gerencie seus produtos
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-pink-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          {products.length === 0 ? 'Novo Produto' : 'Cadastrar Produto'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'} border rounded-xl p-6`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
            Total de Produtos
          </p>
          <h3 className={`text-2xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {products.length}
          </h3>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'} border rounded-xl p-6`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
            Estoque Total
          </p>
          <h3 className={`text-2xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalStock} unidades
          </h3>
        </div>

        <div
          className={`${
            lowStockProducts.length > 0
              ? isDarkMode
                ? 'bg-slate-800 border-yellow-500'
                : 'bg-yellow-50 border-yellow-500'
              : isDarkMode
              ? 'bg-slate-800 border-pink-900/40'
              : 'bg-white border-pink-100'
          } border rounded-xl p-6`}
        >
          <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-2 flex items-center gap-2`}>
            {lowStockProducts.length > 0 && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
            Estoque Baixo
          </p>
          <h3 className={`text-2xl font-display font-bold ${lowStockProducts.length > 0 ? 'text-yellow-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {lowStockProducts.length}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'} border rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <Filter className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Filtrar por Categoria
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const count = countByCategory(cat.id);
            if (cat.id !== 'all' && count === 0) return null;

            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  isActive
                    ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-500/20'
                    : isDarkMode
                    ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-pink-500/10 hover:text-pink-100 hover:border-pink-500/30'
                    : 'bg-pink-50 text-slate-700 border-pink-100 hover:bg-pink-100 hover:text-pink-600'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-pink-700 text-white'
                      : isDarkMode
                      ? 'bg-slate-600 text-slate-400'
                      : 'bg-white text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className={`${isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'} border rounded-xl p-12 flex flex-col items-center justify-center text-center`}>
          <div className="w-16 h-16 rounded-full bg-pink-600/10 flex items-center justify-center mb-4">
            <ScanBarcode className="w-8 h-8 text-pink-600" />
          </div>

          <h2 className={`text-xl font-display font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Nenhum produto cadastrado ainda
          </h2>

          <p className={`text-sm max-w-md mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Comece adicionando seu primeiro produto para controlar categorias, códigos de barras, preços e estoque.
          </p>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-lg font-medium shadow-lg shadow-pink-500/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Cadastrar primeiro produto
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={`${isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'} border rounded-xl p-10 flex flex-col items-center justify-center text-center`}>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Nenhum produto na categoria <strong>{getCategoryLabel(selectedCategory).label}</strong>.
          </p>
        </div>
      ) : (
        <div className={`${isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'} border rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-pink-900/40 bg-slate-700' : 'border-pink-100 bg-pink-50'}`}>
                  {['Produto', 'Código Barras', 'Categoria', 'Cor', 'Preço', 'Qtd.', 'Mínimo', 'Status', 'Ações'].map((h) => (
                    <th key={h} className={`px-4 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const cat = getCategoryLabel(product.category || product.categoria || 'outros');
                  const productName = product.name || product.nome || '';
                  const productBarcode = product.barcode || product.codigo_barras || '';
                  const productColor = product.color || product.cor || '';
                  const productPrice = product.price || product.preco_venda || 0;
                  const productQuantity = product.quantity || product.quantidade || 0;
                  const productMinQuantity = product.minQuantity || product.estoque_minimo || 0;

                  return (
                    <tr
                      key={product.id}
                      className={`border-b ${
                        isDarkMode
                          ? 'border-slate-700 hover:bg-pink-500/10'
                          : 'border-pink-100 hover:bg-pink-50'
                      } transition-colors`}
                    >
                      <td className={`px-4 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {productName}
                      </td>

                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {productBarcode ? (
                          <span className="flex items-center gap-2">
                            <ScanBarcode className="w-4 h-4 text-pink-600" />
                            {productBarcode}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {cat.label}
                      </td>

                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {productColor || '—'}
                      </td>

                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        R$ {Number(productPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className={`px-4 py-4 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {productQuantity}
                      </td>

                      <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {productMinQuantity}
                      </td>

                      <td className="px-4 py-4">
                        {Number(productQuantity) === 0 ? (
                          <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Sem Estoque
                          </span>
                        ) : Number(productQuantity) <= Number(productMinQuantity) ? (
                          <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Baixo
                          </span>
                        ) : (
                          <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            OK
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 flex gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className={`p-2 rounded-lg transition-all ${
                            isDarkMode
                              ? 'hover:bg-pink-600 text-slate-300 hover:text-white'
                              : 'hover:bg-pink-600 text-pink-600 hover:text-white'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg hover:bg-red-500 hover:text-white text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'} border rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-pink-500/10 text-slate-400 hover:text-pink-100' : 'hover:bg-pink-50 text-slate-500 hover:text-pink-600'}`}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Nome do Produto"
                placeholder="Ex: Gloss Labial"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                isDarkMode={isDarkMode}
                required
              />

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Código de Barras
                </label>

                <div className="relative">
                  <ScanBarcode className={`absolute left-3 top-2.5 w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />

                  <input
                    type="text"
                    placeholder="Bipe ou digite o código"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                        : 'bg-white border-pink-200 text-gray-900 placeholder:text-slate-500'
                    }`}
                  />
                </div>

                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Use um leitor USB/Bluetooth ou digite manualmente.
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Categoria
                </label>

                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`}
                  required
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                label="Cor"
                placeholder="Ex: Rosa brilhante"
                value={formData.color}
                onChange={(value) => setFormData({ ...formData, color: value })}
                isDarkMode={isDarkMode}
              />

              <InputField
                label="Preço (R$)"
                type="number"
                value={formData.price}
                onChange={(value) => setFormData({ ...formData, price: value })}
                isDarkMode={isDarkMode}
                required
                step="0.01"
                min="0"
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Quantidade"
                  type="number"
                  value={formData.quantity}
                  onChange={(value) => setFormData({ ...formData, quantity: value })}
                  isDarkMode={isDarkMode}
                  required
                  min="0"
                />

                <InputField
                  label="Qtd. Mínima"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(value) => setFormData({ ...formData, minQuantity: value })}
                  isDarkMode={isDarkMode}
                  required
                  min="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-gray-900'}`}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  isDarkMode,
  required = false,
  step,
  min,
}) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg ${
          isDarkMode
            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
            : 'bg-white border-pink-200 text-gray-900'
        }`}
        required={required}
      />
    </div>
  );
}