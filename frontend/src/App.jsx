import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { Inventory } from './pages/Inventory';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { History } from './pages/History';
import './index.css';

function App() {
  const [activePage, setActivePage] = useState('sales');

  const renderPage = () => {
    switch (activePage) {
      case 'sales':
        return <Sales setActivePage={setActivePage} />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <Reports />;
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      case 'history':
        return <History />;
      default:
        return <Sales setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="bg-pink-50 text-gray-900 h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 overflow-auto bg-pink-50">
        <div className="p-8 max-w-7xl">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;