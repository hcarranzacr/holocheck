import React, { useState, useEffect } from 'react';
import { User, Building, Shield, LogOut, Home, Settings, Bell } from 'lucide-react';
import EmployeeHealthCheck from './EmployeeHealthCheck';
import OrganizationalHealth from './OrganizationalHealth';
import { insuranceGroups } from '../data/authData';

const UnifiedPortal = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Set default view based on user role
    if (user && user.accessType) {
      console.log('User logged in:', user);
      
      // Automatically set appropriate view based on access type
      if (user.accessType === 'patient') {
        setCurrentView('health-check');
      } else if (user.accessType === 'company') {
        setCurrentView('organizational');
      } else if (user.accessType === 'insurance') {
        setCurrentView('insurance-dashboard');
      } else {
        setCurrentView('dashboard');
      }
    }
  }, [user]);

  const getAccessTypeIcon = () => {
    if (!user || !user.accessType) {
      return User; // Default fallback
    }
    
    switch (user.accessType) {
      case 'patient': return User;
      case 'company': return Building;
      case 'insurance': return Shield;
      default: return User;
    }
  };

  const getAccessTypeName = () => {
    if (!user || !user.accessType) {
      return 'Usuario'; // Default fallback
    }
    
    switch (user.accessType) {
      case 'patient': return 'Paciente/Asegurado';
      case 'company': return 'Empresa/Capital Humano';
      case 'insurance': return 'Aseguradora';
      default: return 'Usuario';
    }
  };

  const getAvailableViews = () => {
    if (!user || !user.accessType) {
      return []; // Return empty array if no user
    }
    
    const views = [];
    
    if (user.accessType === 'patient') {
      views.push(
        { id: 'health-check', name: 'Chequeo de Salud', icon: User },
        { id: 'history', name: 'Historial', icon: Settings }
      );
    } else if (user.accessType === 'company') {
      views.push(
        { id: 'organizational', name: 'Salud Organizacional', icon: Building },
        { id: 'reports', name: 'Reportes', icon: Settings }
      );
    } else if (user.accessType === 'insurance') {
      views.push(
        { id: 'insurance-dashboard', name: 'Dashboard Seguros', icon: Shield },
        { id: 'portfolio', name: 'Gestión de Cartera', icon: Settings }
      );
    }
    
    return views;
  };

  const renderCurrentView = () => {
    console.log('Rendering view:', currentView, 'for user:', user);
    
    switch (currentView) {
      case 'health-check':
        return <EmployeeHealthCheck />;
      
      case 'organizational':
        return <OrganizationalHealth />;
      
      case 'insurance-dashboard':
        return <InsuranceDashboard />;
      
      case 'history':
        return <HealthHistory />;
      
      case 'reports':
        return <CompanyReports />;
      
      case 'portfolio':
        return <PortfolioManagement />;
      
      default:
        return <DefaultDashboard user={user} setCurrentView={setCurrentView} />;
    }
  };

  // Early return if no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  const AccessTypeIcon = getAccessTypeIcon();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <AccessTypeIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  HoloCheck Digital Ensurace & Health Check
                </h1>
                <p className="text-sm text-gray-500">
                  {getAccessTypeName()} - {user.role?.name || 'Usuario'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-700">
                {user.username || 'Usuario'}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4 mr-6">
            <nav className="space-y-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home className="w-4 h-4 mr-3" />
                Dashboard Principal
              </button>
              
              {getAvailableViews().map((view) => {
                const ViewIcon = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => setCurrentView(view.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      currentView === view.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ViewIcon className="w-4 h-4 mr-3" />
                    {view.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Default Dashboard Component
const DefaultDashboard = ({ user, setCurrentView }) => {
  const getQuickActions = () => {
    if (!user || !user.accessType) {
      return [];
    }
    
    if (user.accessType === 'patient') {
      return [
        { 
          title: 'Realizar Chequeo', 
          description: 'Iniciar nuevo análisis de salud',
          action: () => setCurrentView('health-check'),
          color: 'bg-blue-500'
        },
        { 
          title: 'Ver Historial', 
          description: 'Revisar chequeos anteriores',
          action: () => setCurrentView('history'),
          color: 'bg-green-500'
        }
      ];
    } else if (user.accessType === 'company') {
      return [
        { 
          title: 'Salud Organizacional', 
          description: 'Ver métricas de la empresa',
          action: () => setCurrentView('organizational'),
          color: 'bg-purple-500'
        },
        { 
          title: 'Generar Reportes', 
          description: 'Crear reportes personalizados',
          action: () => setCurrentView('reports'),
          color: 'bg-orange-500'
        }
      ];
    } else if (user.accessType === 'insurance') {
      return [
        { 
          title: 'Dashboard Seguros', 
          description: 'Análisis actuarial y riesgos',
          action: () => setCurrentView('insurance-dashboard'),
          color: 'bg-red-500'
        },
        { 
          title: 'Gestión Cartera', 
          description: 'Administrar clientes',
          action: () => setCurrentView('portfolio'),
          color: 'bg-indigo-500'
        }
      ];
    }
    return [];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Bienvenido, {user?.username || 'Usuario'}
        </h2>
        <p className="text-gray-600 mb-6">
          Acceso como: {user?.role?.name || 'Usuario'}
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {getQuickActions().map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-6 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
            >
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {user?.role?.permissions && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Permisos de su Rol
          </h3>
          <div className="grid md:grid-cols-2 gap-2">
            {user.role.permissions.map((permission, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {permission}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder components for different views
const InsuranceDashboard = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard de Seguros</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {insuranceGroups.map((group) => (
        <div key={group.id} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">{group.name}</h3>
          <p className="text-sm text-gray-600">Empleados: {group.totalEmployees}</p>
          <p className="text-sm text-gray-600">Puntuación: {group.avgHealthScore}</p>
          <p className="text-sm text-gray-600">Nivel: {group.premiumLevel}</p>
        </div>
      ))}
    </div>
  </div>
);

const HealthHistory = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Salud</h2>
    <p className="text-gray-600">Aquí se mostrará el historial de chequeos de salud.</p>
  </div>
);

const CompanyReports = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes Empresariales</h2>
    <p className="text-gray-600">Aquí se mostrarán los reportes de la empresa.</p>
  </div>
);

const PortfolioManagement = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Cartera</h2>
    <p className="text-gray-600">Aquí se mostrará la gestión de cartera de seguros.</p>
  </div>
);

export default UnifiedPortal;