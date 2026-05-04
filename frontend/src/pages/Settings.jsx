import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useStore } from '../store';

export function Settings() {
  const { isDarkMode } = useStore();

  const [storeData, setStoreData] = useState({
    nome: 'Belle Cosméticos',
    cnpj: '',
    telefone: '',
    endereco: '',
    email: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('storeData');

    if (saved) {
      setStoreData(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem('storeData', JSON.stringify(storeData));
    notify.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Configurações
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Dados da loja
        </p>
      </div>

      <div className={`${isDarkMode ? 'bg-slate-800 border-pink-900/40' : 'bg-white border-pink-100'} border rounded-xl overflow-hidden max-w-3xl`}>
        <div className="px-6 py-4 border-b border-pink-100">
          <h2 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <SettingsIcon className="w-5 h-5 text-pink-600" />
            Dados da Loja
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nome da Loja"
            value={storeData.nome}
            onChange={(value) => setStoreData({ ...storeData, nome: value })}
            isDarkMode={isDarkMode}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CNPJ"
              value={storeData.cnpj}
              onChange={(value) => setStoreData({ ...storeData, cnpj: value })}
              isDarkMode={isDarkMode}
            />

            <Input
              label="Telefone"
              value={storeData.telefone}
              onChange={(value) => setStoreData({ ...storeData, telefone: value })}
              isDarkMode={isDarkMode}
            />
          </div>

          <Input
            label="Endereço"
            value={storeData.endereco}
            onChange={(value) => setStoreData({ ...storeData, endereco: value })}
            isDarkMode={isDarkMode}
          />

          <Input
            label="E-mail"
            value={storeData.email}
            onChange={(value) => setStoreData({ ...storeData, email: value })}
            isDarkMode={isDarkMode}
          />

          <button
            type="submit"
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-lg font-bold"
          >
            <Save className="w-5 h-5" />
            Salvar Configurações
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, isDarkMode }) {
  return (
    <div>
      <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg ${
          isDarkMode
            ? 'bg-slate-700 border-slate-600 text-white'
            : 'bg-white border-pink-200 text-gray-900'
        }`}
      />
    </div>
  );
}