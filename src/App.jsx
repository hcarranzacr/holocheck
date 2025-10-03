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
import PillarTwo from './components/PillarTwo';
import PillarThree from './components/PillarThree';
import AdminPanel from './components/AdminPanel';
import TenantManagement from './components/TenantManagement';
import DatabaseMigration from './components/DatabaseMigration';
import AnalysisLogger from './components/AnalysisLogger';
import MedicalCareTracking from './components/MedicalCareTracking';
import LogDisplay from './components/LogDisplay';
import EvaluationHistory from './components/EvaluationHistory';
import MedicalDocumentation from './components/MedicalDocumentation';
import DetailedBiomarkers from './components/DetailedBiomarkers';
import Settings from './components/Settings';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderMainContent = () => {
    switch (activeSection) {
      // Pilar Uno - Análisis Individual
      case 'health-check':
        return <BiometricCapture />;
      case 'voice-capture':
        return <VoiceCapture />;
      case 'cognitive':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis Cognitivo</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">
                Módulo de análisis cognitivo en desarrollo...
              </p>
            </div>
          </div>
        );
      case 'vision':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis Visual</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">
                Módulo de análisis visual en desarrollo...
              </p>
            </div>
          </div>
        );
      case 'evaluation-history':
        return <EvaluationHistory />;

      // Pilar Dos - Gestión Empresarial
      case 'company-dashboard':
        return <CompanyDashboard />;
      case 'organizational-health':
        return <OrganizationalHealth />;
      case 'medical-care-tracking':
        return <MedicalCareTracking />;
      case 'pillar-two':
        return <PillarTwo />;
      case 'users':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Usuarios</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">
                Módulo de gestión de usuarios en desarrollo...
              </p>
            </div>
          </div>
        );

      // Pilar Tres - Seguros y Riesgos
      case 'insurer-dashboard':
        return <InsurerDashboard />;
      case 'insurance-analytics':
        return <InsuranceAnalytics />;
      case 'biomarkers':
        return <DetailedBiomarkers />;
      case 'pillar-three':
        return <PillarThree />;

      // Inteligencia Artificial
      case 'ai-response':
        return <AIResponse />;
      case 'prompt-editor':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Editor de Prompts</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">
                Editor de prompts de IA en desarrollo...
              </p>
            </div>
          </div>
        );
      case 'analysis-logger':
        return <AnalysisLogger />;

      // Configuración y Sistema
      case 'login-portal':
        return <LoginPortal />;
      case 'consent-manager':
        return <ConsentManager />;
      case 'device-integrations':
        return <DeviceIntegrations />;
      case 'settings':
        return <Settings />;

      // Reportes y Documentación
      case 'medical-documentation':
        return <MedicalDocumentation />;
      case 'log-display':
        return <LogDisplay />;
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reportes Generales</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">
                Módulo de reportes generales en desarrollo...
              </p>
            </div>
          </div>
        );
      case 'unified-portal':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Portal Unificado</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">
                Portal unificado en desarrollo...
              </p>
            </div>
          </div>
        );

      // Admin routes
      case 'tenant-management':
        return <TenantManagement />;
      case 'database-migration':
        return <DatabaseMigration />;

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
           activeSection === 'voice-capture' ||
           activeSection === 'login-portal' ||
           activeSection === 'consent-manager' ||
           activeSection === 'company-dashboard' ||
           activeSection === 'insurer-dashboard' ||
           activeSection === 'insurance-analytics' ||
           activeSection === 'organizational-health' ||
           activeSection === 'device-integrations' ||
           activeSection === 'ai-response' ||
           activeSection === 'pillar-two' ||
           activeSection === 'pillar-three' ||
           activeSection === 'analysis-logger' ||
           activeSection === 'medical-care-tracking' ||
           activeSection === 'log-display' ||
           activeSection === 'evaluation-history' ||
           activeSection === 'medical-documentation' ||
           activeSection === 'settings' ? (
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