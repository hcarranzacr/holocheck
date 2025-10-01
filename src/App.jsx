import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BiometricCapture from './components/BiometricCapture';
import LoginPortal from './components/LoginPortal';
import ConsentManager from './components/ConsentManager';
import CompanyDashboard from './components/CompanyDashboard';
import InsurerDashboard from './components/InsurerDashboard';
import InsuranceAnalytics from './components/InsuranceAnalytics';
import OrganizationalHealth from './components/OrganizationalHealth';
import DeviceIntegrations from './components/DeviceIntegrations';
import VoiceCapture from './components/VoiceCapture';
import AIResponse from './components/AIResponse';
import PillarOne from './components/PillarOne';
import PillarThree from './components/PillarThree';
import AdminPanel from './components/AdminPanel';
import TenantManagement from './components/TenantManagement';
import DatabaseMigration from './components/DatabaseMigration';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderMainContent = () => {
    switch (activeSection) {
      case 'health-check':
        return <BiometricCapture />;
      case 'login-portal':
        return <LoginPortal />;
      case 'consent-manager':
        return <ConsentManager />;
      case 'company-dashboard':
        return <CompanyDashboard />;
      case 'insurer-dashboard':
        return <InsurerDashboard />;
      case 'insurance-analytics':
        return <InsuranceAnalytics />;
      case 'organizational-health':
        return <OrganizationalHealth />;
      case 'device-integrations':
        return <DeviceIntegrations />;
      case 'voice-capture':
        return <VoiceCapture />;
      case 'ai-response':
        return <AIResponse />;
      case 'pillar-one':
        return <PillarOne />;
      case 'pillar-three':
        return <PillarThree />;
      case 'tenant-management':
        return <TenantManagement />;
      case 'database-migration':
        return <DatabaseMigration />;
      case 'system-settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración del Sistema</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">
                Panel de configuración del sistema en desarrollo...
              </p>
            </div>
          </div>
        );
      default:
        return (
          <Dashboard 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
        );
    }
  };

  const MainApp = () => (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      {/* Main content area */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        
        {/* Main content */}
        <main className="flex-1 lg:ml-0 overflow-auto">
          {activeSection === 'health-check' || 
           activeSection === 'login-portal' ||
           activeSection === 'consent-manager' ||
           activeSection === 'company-dashboard' ||
           activeSection === 'insurer-dashboard' ||
           activeSection === 'insurance-analytics' ||
           activeSection === 'organizational-health' ||
           activeSection === 'device-integrations' ||
           activeSection === 'voice-capture' ||
           activeSection === 'ai-response' ||
           activeSection === 'pillar-one' ||
           activeSection === 'pillar-three' ? (
            renderMainContent()
          ) : (
            <div className="p-4 lg:p-6">
              {renderMainContent()}
            </div>
          )}
        </main>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;