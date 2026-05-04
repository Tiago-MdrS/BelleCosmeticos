import React from 'react';
import logo from '../../assets/belle.jpg'; 

import {
  DollarSign,
  Package,
  BarChart3,
  FileText,
  Settings,
  History
} from "lucide-react";

export function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'sales', label: 'Vendas', icon: DollarSign },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'history', label: 'Histórico', icon: History },
  ];
  return (
    <div className="w-64 h-screen flex flex-col border-r border-pink-100 bg-white/80 backdrop-blur-xl shadow-lg">

      {/* Logo */}
      <div className="p-6 border-b border-pink-100">
        <div className="flex items-center gap-3">
          
          {/* LOGO */}
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-pink-500/30">
            <img
              src={logo}
              alt="Belle Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="font-display font-bold text-lg text-gray-900">
              Belle
            </h1>
            <p className="text-xs text-primary font-medium">
              Cosméticos
            </p>
          </div>

        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-pink-500/30 scale-[1.02]'
                  : 'text-slate-600 hover:bg-pink-50 hover:text-primary'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary shadow-lg shadow-pink-500/60" />
              )}

              <Icon
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-primary group-hover:scale-110'
                }`}
              />

              <span className="font-medium text-sm">
                {item.label}
              </span>

              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
              )}

              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none shadow-[0_0_20px_rgba(236,72,153,0.25)]" />
            </button>
          );
        })}
      </nav>

    </div>
  );
}