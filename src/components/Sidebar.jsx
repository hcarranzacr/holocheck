import React from 'react';
import { 
  Home,
  Activity, 
  Mic, 
  Brain, 
  Eye, 
  Clock,
  Building, 
  Users, 
  Stethoscope, 
  BarChart3, 
  UserCheck,
  Shield, 
  PieChart, 
  Heart, 
  Layers,
  Bot, 
  Edit, 
  FileText,
  LogIn, 
  CheckSquare, 
  Smartphone, 
  Settings,
  BookOpen, 
  Monitor, 
  Globe,
  X 
} from 'lucide-react';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, activeSection, setActiveSection }) => {
  // Emma's reorganized menu structure based on 3-pillar model
  const menuSections = [
    {
      title: "Dashboard Principal",
      items: [
        { id: 'dashboard', label: 'Vista General', icon: Home }
      ]
    },
    {
      title: "👤 Análisis Individual (Pilar Uno)",
      items: [
        { id: 'health-check', label: 'Análisis Biométrico', icon: Activity },
        { id: 'voice-capture', label: 'Captura de Voz', icon: Mic },
        { id: 'cognitive', label: 'Análisis Cognitivo', icon: Brain },
        { id: 'vision', label: 'Análisis Visual', icon: Eye },
        { id: 'evaluation-history', label: 'Historial Personal', icon: Clock }
      ]
    },
    {
      title: "🏢 Gestión Empresarial (Pilar Dos)",
      items: [
        { id: 'company-dashboard', label: 'Dashboard Empresarial', icon: Building },
        { id: 'organizational-health', label: 'Salud Organizacional', icon: Users },
        { id: 'medical-care-tracking', label: 'Seguimiento Médico', icon: Stethoscope },
        { id: 'pillar-two', label: 'Analytics Empresarial', icon: BarChart3 },
        { id: 'users', label: 'Gestión de Usuarios', icon: UserCheck }
      ]
    },
    {
      title: "🛡️ Seguros y Riesgos (Pilar Tres)",
      items: [
        { id: 'insurer-dashboard', label: 'Dashboard Aseguradoras', icon: Shield },
        { id: 'insurance-analytics', label: 'Análisis de Seguros', icon: PieChart },
        { id: 'biomarkers', label: 'Biomarcadores', icon: Heart },
        { id: 'pillar-three', label: 'Gestión de Riesgos', icon: Layers }
      ]
    },
    {
      title: "🤖 Inteligencia Artificial",
      items: [
        { id: 'ai-response', label: 'Respuesta IA', icon: Bot },
        { id: 'prompt-editor', label: 'Editor de Prompts', icon: Edit },
        { id: 'analysis-logger', label: 'Logger de Análisis', icon: FileText }
      ]
    },
    {
      title: "🔧 Configuración y Sistema",
      items: [
        { id: 'login-portal', label: 'Portal de Acceso', icon: LogIn },
        { id: 'consent-manager', label: 'Consentimientos', icon: CheckSquare },
        { id: 'device-integrations', label: 'Integraciones', icon: Smartphone },
        { id: 'settings', label: 'Configuración', icon: Settings }
      ]
    },
    {
      title: "📊 Reportes y Documentación",
      items: [
        { id: 'medical-documentation', label: 'Documentación Médica', icon: BookOpen },
        { id: 'log-display', label: 'Visualización de Logs', icon: Monitor },
        { id: 'reports', label: 'Reportes Generales', icon: FileText },
        { id: 'unified-portal', label: 'Portal Unificado', icon: Globe }
      ]
    }
  ];

  const handleMenuClick = (itemId) => {
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

        {/* Navigation - Emma's hierarchical structure */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {/* Section Header */}
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                {section.title}
              </h3>
              
              {/* Section Items */}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleMenuClick(item.id)}
                        className={`
                          w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200
                          ${isActive 
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className={`
                          w-5 h-5 mr-3 flex-shrink-0
                          ${isActive ? 'text-blue-700' : 'text-gray-400'}
                        `} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Sistema 3 Pilares</p>
              <p className="text-xs text-gray-500">v1.4.1 - Emma's Structure</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;