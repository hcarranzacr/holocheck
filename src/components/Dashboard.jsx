import React from 'react';
import StatsCard from './StatsCard';
import EmployeeHealthCheck from './EmployeeHealthCheck';
import PillarTwo from './PillarTwo';
import DetailedBiomarkers from './DetailedBiomarkers';
import EvaluationHistory from './EvaluationHistory';
import MedicalDocumentation from './MedicalDocumentation';
import Settings from './Settings';
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
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitoreo integral de salud preventiva empresarial
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveSection('health-check')}
              className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Análisis Biométrico</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('evaluation-history')}
              className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Historial de Evaluaciones</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('medical-documentation')}
              className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Documentación Médica</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
          <div className="space-y-3">
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

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Análisis</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Usuario Demo</p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Completado
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Análisis Previo</p>
                <p className="text-xs text-gray-500">Hace 1 día</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Procesando
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render different sections based on activeSection
  const renderContent = () => {
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
      case 'cognitive':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis Cognitivo</h2>
            <p className="text-gray-600">Módulo de análisis cognitivo en desarrollo.</p>
          </div>
        );
      case 'vision':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis Visual</h2>
            <p className="text-gray-600">Módulo de análisis visual en desarrollo.</p>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reportes</h2>
            <p className="text-gray-600">Módulo de reportes en desarrollo.</p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Usuarios</h2>
            <p className="text-gray-600">Módulo de usuarios en desarrollo.</p>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return renderDashboardHome();
    }
  };

  return (
    <div className="min-h-full">
      {renderContent()}
    </div>
  );
};

export default Dashboard;