import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useStore } from '../store';

export function Dashboard() {
  const {
    salesToday,
    salesLast31Days,
    expenses,
    products,
    getTotalRevenue,
    getTotalExpenses,
    getNetProfit,
    getLowStockProducts,
    getMostSoldProducts,
    getTotalStock,
  } = useStore();

  const totalRevenue = getTotalRevenue();
  const totalExpenses = getTotalExpenses();
  const netProfit = getNetProfit();
  const lowStockProducts = getLowStockProducts();
  const mostSoldProducts = getMostSoldProducts();
  const totalStock = getTotalStock();

  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const hasSalesChartData = salesLast31Days.some((day) => Number(day.total || 0) > 0);
  const hasMostSoldProducts = mostSoldProducts.length > 0;

  const money = (value) =>
    `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const card = 'bg-white border border-pink-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200';

  const StatChip = ({ value, positive }) => {
    const isPositive = positive ?? value >= 0;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-pink-50 text-pink-700 border border-pink-200 rounded-xl px-4 py-2 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          Ao vivo
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Receita */}
        <div className={`${card} p-5`}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <StatChip value={salesToday.length > 0 ? 12 : 0} positive />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Receita Hoje</p>
          <p className="text-2xl font-bold text-gray-900">{money(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{salesToday.length} transações</p>
        </div>

        {/* Lucro */}
        <div className={`${card} p-5`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <TrendingUp className={`w-5 h-5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />
            </div>
            <StatChip value={profitMargin} />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Lucro Hoje</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-gray-900' : 'text-red-500'}`}>{money(netProfit)}</p>
          <p className="text-xs text-gray-400 mt-1">Margem de {profitMargin.toFixed(1)}%</p>
        </div>

        {/* Despesas */}
        <div className={`${card} p-5`}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <StatChip value={-5} />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Despesas</p>
          <p className="text-2xl font-bold text-gray-900">{money(totalExpenses)}</p>
          <p className="text-xs text-gray-400 mt-1">{expenses.length} registros</p>
        </div>

        {/* Estoque */}
        <div className={`${card} p-5 ${lowStockProducts.length > 0 ? 'border-yellow-200 bg-yellow-50/30' : ''}`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lowStockProducts.length > 0 ? 'bg-yellow-100' : 'bg-blue-50'}`}>
              <Package className={`w-5 h-5 ${lowStockProducts.length > 0 ? 'text-yellow-600' : 'text-blue-500'}`} />
            </div>
            {lowStockProducts.length > 0 && (
              <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
                {lowStockProducts.length} alerta{lowStockProducts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Estoque Total</p>
          <p className="text-2xl font-bold text-gray-900">{totalStock} un.</p>
          <p className="text-xs text-gray-400 mt-1">{products.length} produtos cadastrados</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Sales Area Chart — 2 cols */}
        <div className={`${card} p-6 xl:col-span-2`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Vendas — Últimos 31 dias</h3>
              <p className="text-xs text-gray-400 mt-0.5">Evolução da receita diária</p>
            </div>
          </div>

          {hasSalesChartData ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={salesLast31Days}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E91E63" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #fce7f3', borderRadius: '10px', fontSize: '13px' }}
                  formatter={(v) => [money(v), 'Vendas']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#E91E63"
                  strokeWidth={2.5}
                  fill="url(#salesGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#C2185B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex flex-col items-center justify-center rounded-xl border border-dashed border-pink-200 text-gray-400">
              <DollarSign className="w-10 h-10 mb-2 text-pink-300" />
              <p className="font-medium text-sm">Sem vendas registradas ainda</p>
              <p className="text-xs mt-1">Os dados aparecerão automaticamente.</p>
            </div>
          )}
        </div>

        {/* Cash Flow — 1 col */}
        <div className={`${card} p-6 flex flex-col`}>
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900">Fluxo de Caixa</h3>
            <p className="text-xs text-gray-400 mt-0.5">Resumo financeiro de hoje</p>
          </div>

          {/* Entradas */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Entradas</p>
                <p className="text-sm font-bold text-gray-900">{money(totalRevenue)}</p>
              </div>
            </div>
            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{
                  width: totalRevenue + totalExpenses > 0
                    ? `${(totalRevenue / (totalRevenue + totalExpenses)) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>

          {/* Saídas */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Saídas</p>
                <p className="text-sm font-bold text-gray-900">{money(totalExpenses)}</p>
              </div>
            </div>
            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full"
                style={{
                  width: totalRevenue + totalExpenses > 0
                    ? `${(totalExpenses / (totalRevenue + totalExpenses)) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>

          {/* Resultado líquido */}
          <div className={`mt-4 rounded-xl p-4 flex items-center justify-between ${netProfit >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Resultado líquido</p>
              <p className={`text-xl font-bold mt-0.5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {money(netProfit)}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {netProfit >= 0
                ? <TrendingUp className="w-5 h-5 text-emerald-600" />
                : <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
          </div>

          {/* Barra proporcional */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Entradas</span>
              <span>Saídas</span>
            </div>
            <div className="w-full h-3 rounded-full bg-red-100 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{
                  width: totalRevenue + totalExpenses > 0
                    ? `${Math.min((totalRevenue / (totalRevenue + totalExpenses)) * 100, 100)}%`
                    : '50%',
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold mt-1">
              <span className="text-emerald-500">
                {totalRevenue + totalExpenses > 0
                  ? `${((totalRevenue / (totalRevenue + totalExpenses)) * 100).toFixed(0)}%`
                  : '—'}
              </span>
              <span className="text-red-400">
                {totalRevenue + totalExpenses > 0
                  ? `${((totalExpenses / (totalRevenue + totalExpenses)) * 100).toFixed(0)}%`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Mais Vendidos */}
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">Produtos Mais Vendidos</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ranking por quantidade</p>
            </div>
          </div>

          {hasMostSoldProducts ? (
            <div className="space-y-4">
              {mostSoldProducts.map((product, index) => {
                const maxSold = Math.max(...mostSoldProducts.map((p) => p.sold));
                const width = maxSold > 0 ? (product.sold / maxSold) * 100 : 0;
                const colors = ['bg-pink-500', 'bg-pink-400', 'bg-pink-300', 'bg-pink-200', 'bg-pink-100'];

                return (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">#{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{product.name}</span>
                        <span className="text-sm font-bold text-gray-900">{product.sold}×</span>
                      </div>
                      <div className="w-full h-2 bg-pink-50 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[index] || 'bg-pink-100'} rounded-full transition-all duration-500`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center rounded-xl border border-dashed border-pink-200 text-gray-400">
              <Package className="w-9 h-9 mb-2 text-pink-300" />
              <p className="font-medium text-sm">Nenhuma venda ainda</p>
              <p className="text-xs mt-1">O ranking aparecerá automaticamente.</p>
            </div>
          )}
        </div>

        {/* Estoque Baixo */}
        <div className={`${card} p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className={`w-5 h-5 ${lowStockProducts.length > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
            <div>
              <h3 className="font-semibold text-gray-900">Estoque Baixo</h3>
              <p className="text-xs text-gray-400 mt-0.5">Produtos abaixo do mínimo</p>
            </div>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.quantity} em estoque · mín. {product.minQuantity}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.quantity === 0 ? 'bg-red-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                    {product.quantity === 0 ? 'Esgotado' : 'Baixo'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center rounded-xl border border-dashed border-green-200 text-gray-400">
              <Package className="w-9 h-9 mb-2 text-green-400" />
              <p className="font-medium text-sm text-green-600">Estoque saudável</p>
              <p className="text-xs mt-1">Nenhum produto abaixo do mínimo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}