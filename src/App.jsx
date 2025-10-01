import React, { useState } from 'react';
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
import SupabaseSetupGuide from './components/SupabaseSetupGuide';
import { isSupabaseConfigured } from './services/supabase/supabaseClient';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Show setup guide if Supabase is not properly configured
  const needsSetup = !isSupabaseConfigured();

  const renderMainContent = () => {
    // Show setup guide first if Supabase needs configuration
    if (needsSetup && activeSection === 'dashboard') {
      return <SupabaseSetupGuide />;
    }

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
      case 'supabase-setup':
        return <SupabaseSetupGuide />;
      default:
        return (
          <Dashboard 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Supabase Setup Banner */}
      {needsSetup && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-800">⚠️ Configuración de Supabase requerida</span>
            </div>
            <button
              onClick={() => setActiveSection('supabase-setup')}
              className="text-yellow-800 hover:text-yellow-900 underline text-sm"
            >
              Configurar ahora
            </button>
          </div>
        </div>
      )}

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
           activeSection === 'pillar-three' ||
           activeSection === 'supabase-setup' ? (
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
}

export default App;