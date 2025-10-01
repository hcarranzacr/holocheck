import React, { useState, useEffect } from 'react';
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
import SupabaseStatus from './components/SupabaseStatus';
import { isSupabaseConfigured, checkConnection } from './services/supabase/supabaseClient';
import { initializeHoloCheckDatabase } from './services/supabase/databaseInitializer';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState('checking');
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  // Auto-initialize database on app load
  useEffect(() => {
    const initializeDatabase = async () => {
      if (initializationAttempted) return;
      
      try {
        console.log('🚀 HoloCheck: Starting automatic database initialization...');
        setInitializationAttempted(true);
        
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          setDatabaseStatus('not-configured');
          return;
        }

        // Check current connection status
        const status = await checkConnection();
        
        if (status.connected && !status.needsSchema) {
          setDatabaseStatus('ready');
          console.log('✅ Database already ready');
          return;
        }

        if (status.needsSchema) {
          console.log('🔧 Database needs initialization, starting automatic setup...');
          setDatabaseStatus('initializing');
          
          // Attempt automatic initialization
          const initResult = await initializeHoloCheckDatabase();
          
          if (initResult.success) {
            setDatabaseStatus('ready');
            console.log('✅ Database initialized successfully');
          } else {
            setDatabaseStatus('needs-manual-setup');
            console.log('⚠️ Automatic initialization failed, manual setup required');
          }
        }
        
      } catch (error) {
        console.error('❌ Database initialization error:', error);
        setDatabaseStatus('error');
      }
    };

    initializeDatabase();
  }, [initializationAttempted]);

  // Check if Supabase needs configuration
  const needsSetup = !isSupabaseConfigured() || databaseStatus === 'needs-manual-setup';
  const isInitializing = databaseStatus === 'initializing' || databaseStatus === 'checking';

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
      {/* Database Initialization Status Banner */}
      {isInitializing && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">🔧 Inicializando base de datos HoloCheck automáticamente...</span>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Setup Banner */}
      {needsSetup && !isInitializing && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-800">
                {databaseStatus === 'not-configured' 
                  ? '⚠️ Configuración de Supabase requerida para funcionalidad completa'
                  : '⚠️ Configuración manual de base de datos requerida'
                }
              </span>
            </div>
            <div className="text-yellow-700 text-sm">
              Ver panel de configuración en el dashboard →
            </div>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {databaseStatus === 'ready' && (
        <div className="bg-green-50 border-b border-green-200 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-800">✅ HoloCheck base de datos configurada y lista - Sistema HIPAA activo</span>
            </div>
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
           activeSection === 'pillar-three' ? (
            renderMainContent()
          ) : (
            <div className="p-4 lg:p-6">
              {/* Show Supabase Status at top of dashboard */}
              <div className="mb-6">
                <SupabaseStatus databaseStatus={databaseStatus} />
              </div>
              {renderMainContent()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;