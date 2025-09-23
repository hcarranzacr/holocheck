import React from 'react';
import StatsCard from './StatsCard';
import EmployeeHealthCheck from './EmployeeHealthCheck';
import PillarTwo from './PillarTwo';
import DetailedBiomarkers from './DetailedBiomarkers';
import EvaluationHistory from './EvaluationHistory';
import MedicalDocumentation from './MedicalDocumentation';
import Settings from './Settings';
import LoginPortal from './LoginPortal';
import ConsentManager from './ConsentManager';
import CompanyDashboard from './CompanyDashboard';
import InsurerDashboard from './InsurerDashboard';
import InsuranceAnalytics from './InsuranceAnalytics';
import OrganizationalHealth from './OrganizationalHealth';
import DeviceIntegrations from './DeviceIntegrations';
import AIResponse from './AIResponse';
import VoiceCapture from './VoiceCapture';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Heart,
  Brain,
  Eye,
  FileText,
  Settings as SettingsIcon,
  BarChart3
} from 'lucide-react';

const Dashboard = ({ activeSection, setActiveSection }) => {
  // Main dashboard content
  const renderDashboardHome = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control HoloCheck</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitoreo integral de salud preventiva empresarial - Sistema de tres pilares
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setActiveSection('health-check')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Nuevo Análisis
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Empleados Activos"
          value="1,247"
          change="+12%"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Análisis Completados"
          value="856"
          change="+8%"
          changeType="positive"
          icon={Activity}
        />
        <StatsCard
          title="Riesgo Promedio"
          value="Bajo"
          change="-5%"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="Alertas Activas"
          value="23"
          change="+3"
          changeType="negative"
          icon={AlertTriangle}
        />
      </div>

      {/* Three Pillars Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 text-blue-600 mr-2" />
            👤 Pilar Uno - Individual
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveSection('health-check')}
              className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Análisis Biométrico</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('voice-capture')}
              className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Heart className="w-4 h-4 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Captura de Voz</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
            🏢 Pilar Dos - Empresarial
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveSection('company-dashboard')}
              className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Dashboard Empresarial</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('organizational-health')}
              className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Salud Organizacional</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-purple-600 mr-2" />
            🛡️ Pilar Tres - Seguros
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveSection('insurer-dashboard')}
              className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Dashboard Aseguradoras</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('insurance-analytics')}
              className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Heart className="w-4 h-4 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Análisis de Seguros</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Cámara</span>
            <span className="text-sm font-medium text-green-600">Operativa</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Micrófono</span>
            <span className="text-sm font-medium text-green-600">Operativo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">IA Análisis</span>
            <span className="text-sm font-medium text-green-600">Disponible</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Base de Datos</span>
            <span className="text-sm font-medium text-green-600">Conectada</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render different sections based on activeSection
  const renderContent = () => {
    try {
      switch (activeSection) {
        case 'dashboard':
          return renderDashboardHome();
        case 'health-check':
          return <EmployeeHealthCheck />;
        case 'evaluation-history':
          return <EvaluationHistory />;
        case 'medical-documentation':
          return <MedicalDocumentation />;
        case 'pillar-two':
          return <PillarTwo />;
        case 'biomarkers':
          return <DetailedBiomarkers />;
        
        // Dashboard Components
        case 'company-dashboard':
          return <CompanyDashboard />;
        case 'insurer-dashboard':
          return <InsurerDashboard />;
        case 'organizational-health':
          return <OrganizationalHealth />;
        
        // Analytics Components
        case 'insurance-analytics':
          return <InsuranceAnalytics />;
        
        // Access & Configuration
        case 'login-portal':
          return <LoginPortal />;
        case 'consent-manager':
          return <ConsentManager />;
        case 'device-integrations':
          return <DeviceIntegrations />;
        
        // AI & Voice Components
        case 'ai-response':
          return <AIResponse />;
        case 'voice-capture':
          return <VoiceCapture />;
        
        // Analysis Modules
        case 'cognitive':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Brain className="w-6 h-6 text-blue-600 mr-3" />
                Análisis Cognitivo
              </h2>
              <p className="text-gray-600">Módulo de análisis cognitivo en desarrollo. Evaluación de funciones cognitivas y detección temprana de deterioro.</p>
            </div>
          );
        case 'vision':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 text-green-600 mr-3" />
                Análisis Visual
              </h2>
              <p className="text-gray-600">Módulo de análisis visual en desarrollo. Detección de patrones y anomalías visuales.</p>
            </div>
          );
        case 'reports':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 text-purple-600 mr-3" />
                Reportes Generales
              </h2>
              <p className="text-gray-600">Módulo de reportes generales en desarrollo.</p>
            </div>
          );
        case 'users':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                Gestión de Usuarios
              </h2>
              <p className="text-gray-600">Módulo de gestión de usuarios en desarrollo.</p>
            </div>
          );
        case 'prompt-editor':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Editor de Prompts</h2>
              <p className="text-gray-600">Editor de prompts para IA en desarrollo.</p>
            </div>
          );
        case 'analysis-logger':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Logger de Análisis</h2>
              <p className="text-gray-600">Sistema de logging de análisis en desarrollo.</p>
            </div>
          );
        case 'log-display':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Visualización de Logs</h2>
              <p className="text-gray-600">Visualizador de logs del sistema en desarrollo.</p>
            </div>
          );
        case 'pillar-three':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reportes de Riesgo</h2>
              <p className="text-gray-600">Módulo de reportes de riesgo en desarrollo.</p>
            </div>
          );
        case 'settings':
          return <Settings />;
        default:
          return renderDashboardHome();
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error de Renderizado</h2>
          <p className="text-red-600">Ha ocurrido un error al cargar el contenido. Por favor, recarga la página.</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-full">
      {renderContent()}
    </div>
  );
};

export default Dashboard;