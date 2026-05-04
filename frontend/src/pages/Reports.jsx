import React, { useState } from 'react';
import { FileText, Download, Plus, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  cancelSale,
  createBackup,
  getBackups,
  restoreBackup,
  openBackupFolder
} from "../services/api";
import { notify } from '../utils/notify';

function getImageBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url + '?t=' + Date.now();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => resolve(null);
  });
}

export function Reports() {
  const {
    isDarkMode,
    salesToday,
    salesLast31Days,
    expenses,
    getTotalExpenses,
    getNetProfit,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useStore();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [backups, setBackups] = useState([]);
  const [showBackups, setShowBackups] = useState(false);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ description: '', value: '' });

  const money = (value) =>
    Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const getSaleDate = (sale) => (sale.date ? sale.date.split('T')[0] : '');
  const getSaleValue = (sale) => Number(sale.value ?? sale.total ?? 0);

  const formatDate = (date) => {
    if (!date) return 'Sem data';
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        description: expenseForm.description,
        value: Number(expenseForm.value),
      });
    } else {
      addExpense({
        description: expenseForm.description,
        value: Number(expenseForm.value),
      });
    }

    setExpenseForm({ description: '', value: '' });
    setEditingExpense(null);
    setShowExpenseModal(false);
  };

  const handleEditExpense = (exp) => {
    setEditingExpense(exp);
    setExpenseForm({ description: exp.description, value: exp.value });
    setShowExpenseModal(true);
  };

  async function handleCreateBackup() {
    const result = await createBackup();

    notify[result.sucesso ? "success" : "error"](
      result.mensagem || result.erro || "Backup finalizado."
    );
  }

  async function handleOpenFolder() {
    const result = await openBackupFolder();

    if (result?.erro) {
      notify.error(result.erro);
    } else {
      notify.success(result?.mensagem || "Pasta de backups aberta.");
    }
  }

  async function handleLoadBackups() {
    const data = await getBackups();

    setBackups(Array.isArray(data) ? data : []);
    setShowBackups(true);
  }

  async function handleRestore(name) {
    const ok = await notify.confirm("Restaurar backup? Isso substituirá os dados atuais.");

    if (!ok) return;

    const result = await restoreBackup(name);

    notify[result.sucesso ? "success" : "error"](
      result.mensagem || result.erro || "Backup restaurado."
    );
  }

  async function handleCancelSale(id) {
    const motivo = await notify.prompt("Motivo da devolução/cancelamento:");

    if (motivo === null) return;

    const confirmar = await notify.confirm(
      "Tem certeza que deseja devolver/cancelar esta venda? O estoque será atualizado."
    );

    if (!confirmar) return;

    const result = await cancelSale(id, motivo);

    notify[result.sucesso ? "success" : "error"](
      result.mensagem || result.erro
    );
  }

  const allSales = [...salesToday, ...salesLast31Days];

  const filteredSales = allSales.filter((sale) => {
    const saleDate = getSaleDate(sale);
    return saleDate >= dateRange.startDate && saleDate <= dateRange.endDate;
  });

  const groupedSales = Object.values(
    filteredSales.reduce((acc, sale) => {
      const productName = sale.productName || sale.product || 'Venda';
      const saleDate = getSaleDate(sale);
      const key = `${saleDate}-${productName}`;

      if (!acc[key]) {
        acc[key] = {
          date: saleDate,
          productName,
          quantity: 0,
          total: 0,
        };
      }

      acc[key].quantity += Number(sale.quantity || 1);
      acc[key].total += getSaleValue(sale);

      return acc;
    }, {})
  );

  const filteredExpenses = expenses.filter((exp) => {
    const expDate = exp.date?.split('T')[0] || '';
    return expDate >= dateRange.startDate && expDate <= dateRange.endDate;
  });

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + getSaleValue(sale), 0);
  const totalExpensesAmount = getTotalExpenses();
  const netProfit = getNetProfit();

  const exportToPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const storeData = JSON.parse(localStorage.getItem('storeData')) || {
      nome: 'BelleCosméticos',
      cnpj: '',
      telefone: '',
      endereco: '',
      email: '',
    };

    const logoBase64 = await getImageBase64('/logo.png');

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 12, 8, 26, 26);
    }

    const textX = logoBase64 ? 44 : 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text((storeData.nome || 'BelleCosméticos').toUpperCase(), textX, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    const infoLines = [
      storeData.endereco,
      [
        storeData.cnpj ? `CNPJ: ${storeData.cnpj}` : '',
        storeData.telefone ? `Tel: ${storeData.telefone}` : '',
      ].filter(Boolean).join('   '),
      storeData.email,
    ].filter(Boolean);

    infoLines.forEach((line, i) => {
      doc.text(line, textX, 22 + i * 5);
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text('RELATÓRIO FINANCEIRO', pageWidth - 14, 16, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Período: ${formatDate(dateRange.startDate)} – ${formatDate(dateRange.endDate)}`,
      pageWidth - 14,
      23,
      { align: 'right' }
    );

    doc.text(
      `Emitido em: ${new Date().toLocaleString('pt-BR')}`,
      pageWidth - 14,
      29,
      { align: 'right' }
    );

    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.6);
    doc.line(12, 40, pageWidth - 12, 40);

    let y = 50;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('RESUMO FINANCEIRO', 14, y);

    y += 4;

    autoTable(doc, {
      head: [['Descrição', 'Valor']],
      body: [
        ['Receita Total', `R$ ${money(totalRevenue)}`],
        ['Total de Despesas', `R$ ${money(totalExpensesAmount)}`],
        ['Lucro Líquido', `R$ ${money(netProfit)}`],
      ],
      startY: y,
      margin: { left: 14, right: 14 },
      tableWidth: 90,
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        textColor: [20, 20, 20],
        lineColor: [180, 180, 180],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fillColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'right', cellWidth: 30 },
      },
    });

    y = doc.lastAutoTable?.finalY + 14;

    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('VENDAS DO PERÍODO', 14, y);

    y += 4;

    const salesData = groupedSales.map((sale) => [
      formatDate(sale.date),
      sale.productName,
      String(sale.quantity),
      `R$ ${money(sale.total)}`,
    ]);

    autoTable(doc, {
      head: [['Data', 'Produto', 'Qtd', 'Total']],
      body: salesData.length > 0 ? salesData : [['Nenhuma venda no período', '', '', '']],
      startY: y,
      margin: { left: 14, right: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        textColor: [20, 20, 20],
        lineColor: [180, 180, 180],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fillColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 30 },
        2: { halign: 'center', cellWidth: 18 },
        3: { halign: 'right', cellWidth: 35 },
      },
    });

    y = doc.lastAutoTable?.finalY + 14;

    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('DESPESAS DO PERÍODO', 14, y);

    y += 4;

    const expenseData = filteredExpenses.map((exp) => [
      exp.description,
      formatDate(exp.date?.split('T')[0]),
      `R$ ${money(exp.value)}`,
    ]);

    autoTable(doc, {
      head: [['Descrição', 'Data', 'Valor']],
      body: expenseData.length > 0 ? expenseData : [['Nenhuma despesa no período', '', '']],
      startY: y,
      margin: { left: 14, right: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        textColor: [20, 20, 20],
        lineColor: [180, 180, 180],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fillColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        1: { cellWidth: 35 },
        2: { halign: 'right', cellWidth: 35 },
      },
    });

    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(30, 30, 30);
      doc.setLineWidth(0.4);
      doc.line(12, pageHeight - 14, pageWidth - 12, pageHeight - 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text(
        `${storeData.nome || 'BelleCosméticos'} · Gerado em ${new Date().toLocaleString('pt-BR')} · Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }

    doc.save(`relatorio-belle-${dateRange.startDate}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet([
      {
        Receita: totalRevenue,
        Despesas: totalExpensesAmount,
        Lucro: netProfit,
      },
    ]);

    const salesSheet = XLSX.utils.json_to_sheet(
      groupedSales.map((sale) => ({
        Data: formatDate(sale.date),
        Produto: sale.productName,
        Quantidade: sale.quantity,
        Total: sale.total,
      }))
    );

    const expensesSheet = XLSX.utils.json_to_sheet(
      filteredExpenses.map((exp) => ({
        Descrição: exp.description,
        Data: formatDate(exp.date?.split('T')[0]),
        Valor: exp.value,
      }))
    );

    XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo');
    XLSX.utils.book_append_sheet(wb, salesSheet, 'Vendas');
    XLSX.utils.book_append_sheet(wb, expensesSheet, 'Despesas');
    XLSX.writeFile(wb, `relatorio-belle-${dateRange.startDate}.xlsx`);
  };

  const card = `${
    isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'
  } border rounded-2xl p-6 shadow-sm`;

  const input = `w-full px-4 py-2 border rounded-xl text-sm ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white'
      : 'bg-white border-pink-200 text-gray-900'
  }`;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Relatórios
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Gere e exporte relatórios de vendas, despesas e lucros
        </p>
      </div>

      {/* Filtro de período */}
      <div className={card}>
        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
          Filtrar por Período
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Data inicial
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className={input}
            />
          </div>

          <div>
            <label className={`block text-xs mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Data final
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className={input}
            />
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${card} border-l-4 border-l-emerald-400`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Receita
          </p>
          <p className="text-2xl font-bold text-emerald-500">
            R$ {money(totalRevenue)}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
            {groupedSales.length} vendas no período
          </p>
        </div>

        <div className={`${card} border-l-4 border-l-red-400`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Despesas
          </p>
          <p className="text-2xl font-bold text-red-500">
            R$ {money(totalExpensesAmount)}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
            {filteredExpenses.length} registros no período
          </p>
        </div>

        <div className={`${card} border-l-4 ${netProfit >= 0 ? 'border-l-pink-500' : 'border-l-red-500'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Lucro Líquido
          </p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-pink-600' : 'text-red-500'}`}>
            R$ {money(netProfit)}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
            {totalRevenue > 0
              ? `Margem de ${((netProfit / totalRevenue) * 100).toFixed(1)}%`
              : 'Sem receita no período'}
          </p>
        </div>
      </div>

      {/* Despesas do período */}
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Despesas do Período
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
              {filteredExpenses.length} registros encontrados
            </p>
          </div>

          <button
            onClick={() => {
              setEditingExpense(null);
              setExpenseForm({ description: '', value: '' });
              setShowExpenseModal(true);
            }}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className={`text-center py-10 rounded-xl border border-dashed ${isDarkMode ? 'border-slate-600 text-slate-400' : 'border-pink-200 text-gray-400'}`}>
            <p className="font-medium text-sm">Nenhuma despesa no período</p>
            <p className="text-xs mt-1">Ajuste o período ou adicione uma nova despesa.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className={`flex justify-between items-center p-4 rounded-xl border ${
                  isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-pink-50 border-pink-100'
                }`}
              >
                <div>
                  <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {exp.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(exp.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-red-500 font-bold text-sm">
                    R$ {money(exp.value)}
                  </span>

                  <button
                    onClick={() => handleEditExpense(exp)}
                    className="p-1.5 text-pink-500 hover:bg-pink-100 rounded-lg transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botões de exportação + Backup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={exportToPDF}
          className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
            isDarkMode
              ? 'border-pink-800 bg-pink-900/20 hover:bg-pink-900/30'
              : 'border-pink-200 bg-pink-50 hover:bg-pink-100'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-pink-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>

          <div className="text-left">
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Exportar para PDF
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Relatório formatado com logo e tabelas
            </p>
          </div>

          <Download className="w-5 h-5 text-pink-500 ml-auto" />
        </button>

        <button
          onClick={exportToExcel}
          className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
            isDarkMode
              ? 'border-green-800 bg-green-900/20 hover:bg-green-900/30'
              : 'border-green-200 bg-green-50 hover:bg-green-100'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>

          <div className="text-left">
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Exportar para Excel
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Planilha com vendas, despesas e resumo
            </p>
          </div>

          <Download className="w-5 h-5 text-green-500 ml-auto" />
        </button>

        <button
          onClick={handleCreateBackup}
          className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
            isDarkMode
              ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>

          <div className="text-left">
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Fazer Backup
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Salva uma cópia segura do banco de dados
            </p>
          </div>

          <Download className="w-5 h-5 text-slate-500 ml-auto" />
        </button>
      </div>

      {/* Botões de gerenciamento dos backups */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleLoadBackups}
          className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            isDarkMode
              ? 'border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Ver Backups
        </button>

        <button
          onClick={handleOpenFolder}
          className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            isDarkMode
              ? 'border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Abrir Pasta
        </button>
      </div>

      {/* Lista de backups */}
      {showBackups && (
        <div className={card}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Backups disponíveis
            </h3>

            <button
              onClick={() => setShowBackups(false)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Fechar
            </button>
          </div>

          {backups.length === 0 ? (
            <p className="text-sm text-gray-400">
              Nenhum backup encontrado.
            </p>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div
                  key={backup.name}
                  className={`flex justify-between items-center p-3 rounded-xl border ${
                    isDarkMode
                      ? 'border-slate-700 bg-slate-700'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {backup.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(Number(backup.size || 0) / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <button
                    onClick={() => handleRestore(backup.name)}
                    className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm"
                  >
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de despesa */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`${
              isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'
            } border p-6 rounded-2xl w-full max-w-md shadow-xl`}
          >
            <h2 className={`text-lg font-bold mb-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel, Fornecedor..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className={input}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Valor (R$)
                </label>
                <input
                  type="number"
                  placeholder="0,00"
                  value={expenseForm.value}
                  onChange={(e) => setExpenseForm({ ...expenseForm, value: e.target.value })}
                  className={input}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancelar
                </button>

                <button
                  onClick={handleExpenseSubmit}
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium text-sm transition-all"
                >
                  {editingExpense ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}