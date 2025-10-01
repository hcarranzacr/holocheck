import React from 'react';
import { 
  LayoutDashboard, 
  Heart, 
  Users, 
  Building2, 
  Shield, 
  BarChart3, 
  Stethoscope, 
  Smartphone, 
  Mic, 
  Brain, 
  Target, 
  Activity,
  Settings,
  Database,
  GitBranch,
  X 
} from 'lucide-react';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Principal', icon: LayoutDashboard },
    { id: 'health-check', label: 'Análisis Biométrico', icon: Heart },
    { id: 'login-portal', label: 'Portal de Acceso', icon: Users },
    { id: 'consent-manager', label: 'Gestión de Consentimientos', icon: Shield },
    { id: 'company-dashboard', label: 'Dashboard Empresarial', icon: Building2 },
    { id: 'insurer-dashboard', label: 'Dashboard Aseguradora', icon: BarChart3 },
    { id: 'insurance-analytics', label: 'Analíticas de Seguros', icon: Activity },
    { id: 'organizational-health', label: 'Salud Organizacional', icon: Stethoscope },
    { id: 'device-integrations', label: 'Integraciones de Dispositivos', icon: Smartphone },
    { id: 'voice-capture', label: 'Captura de Voz', icon: Mic },
    { id: 'ai-response', label: 'Respuesta IA', icon: Brain },
    { id: 'pillar-one', label: 'Pilar Uno', icon: Target },
    { id: 'pillar-three', label: 'Pilar Tres', icon: Activity },
  ];

  // Admin menu items
  const adminItems = [
    { id: 'tenant-management', label: 'Gestión de Tenants', icon: Building2 },
    { id: 'database-migration', label: 'Control de Cambios BD', icon: GitBranch },
    { id: 'system-settings', label: 'Configuración Sistema', icon: Settings },
  ];

  const handleItemClick = (itemId) => {
    setActiveSection(itemId);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">HoloCheck</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {/* Main Menu */}
          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Menú Principal
            </h3>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Admin Menu */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Administración
            </h3>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                    ${isActive 
                      ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-purple-700' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Database className="w-4 h-4 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Sistema Multi-Tenant</p>
              <p className="text-xs text-gray-500">v1.3.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;