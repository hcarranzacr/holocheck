import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SupabaseStatus from './components/SupabaseStatus';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <SupabaseStatus />
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;