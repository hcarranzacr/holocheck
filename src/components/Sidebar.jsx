import React, { useState } from 'react';
import { 
  Home, 
  Activity, 
  Users, 
  BarChart3, 
  Settings, 
  FileText,
  Heart,
  Brain,
  Eye,
  Stethoscope,
  Clock,
  BookOpen,
  TrendingUp,
  Shield,
  Building,
  Building2,
  LogIn,
  CheckSquare,
  Smartphone,
  PieChart,
  UserCheck,
  Mic,
  Bot,
  Layers,
  User,
  ChevronDown,
  ChevronRight,
  Database,
  Monitor,
  Edit,
  Globe,
  AlertTriangle
} from 'lucide-react';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, activeSection, setActiveSection }) => {
  const [collapsedSections, setCollapsedSections] = useState({});

  const menuSections = [
    {
      id: 'main',
      title: "📊 Dashboard Principal",
      icon: Home,
      items: [
        { id: 'dashboard', label: 'Vista General', icon: BarChart3 }
      ]
    },
    {
      id: 'individual',
      title: "👤 Análisis Individual (Pilar Uno)",
      icon: User,
      items: [
        { id: 'health-check', label: 'Análisis Biométrico', icon: Activity },
        { id: 'voice-capture', label: 'Captura de Voz', icon: Mic },
        { id: 'cognitive', label: 'Análisis Cognitivo', icon: Brain },
        { id: 'vision', label: 'Análisis Visual', icon: Eye },
        { id: 'evaluation-history', label: 'Historial Personal', icon: Clock }
      ]
    },
    {
      id: 'business',
      title: "🏢 Análisis Empresarial (Pilar Dos)",
      icon: Building,
      items: [
        { id: 'company-dashboard', label: 'Dashboard Empresarial', icon: Building },
        { id: 'organizational-health', label: 'Salud Organizacional', icon: Users },
        { id: 'pillar-two', label: 'Analytics Empresarial', icon: BarChart3 },
        { id: 'users', label: 'Gestión de Usuarios', icon: UserCheck }
      ]
    },
    {
      id: 'insurance',
      title: "🛡️ Seguros y Riesgos (Pilar Tres)",
      icon: Shield,
      items: [
        { id: 'insurer-dashboard', label: 'Dashboard Aseguradoras', icon: Shield },
        { id: 'insurance-analytics', label: 'Análisis de Seguros', icon: PieChart },
        { id: 'biomarkers', label: 'Biomarcadores', icon: Heart },
        { id: 'pillar-three', label: 'Reportes de Riesgo', icon: AlertTriangle }
      ]
    },
    {
      id: 'ai',
      title: "🤖 Inteligencia Artificial",
      icon: Bot,
      items: [
        { id: 'ai-response', label: 'Respuesta IA', icon: Bot },
        { id: 'prompt-editor', label: 'Editor de Prompts', icon: Edit },
        { id: 'analysis-logger', label: 'Logger de Análisis', icon: FileText }
      ]
    },
    {
      id: 'system',
      title: "🔧 Configuración y Sistema",
      icon: Settings,
      items: [
        { id: 'login-portal', label: 'Portal de Acceso', icon: LogIn },
        { id: 'consent-manager', label: 'Consentimientos', icon: CheckSquare },
        { id: 'device-integrations', label: 'Integraciones', icon: Smartphone },
        { id: 'settings', label: 'Configuración', icon: Settings }
      ]
    },
    {
      id: 'reports',
      title: "📊 Reportes y Documentación",
      icon: FileText,
      items: [
        { id: 'medical-documentation', label: 'Documentación Médica', icon: BookOpen },
        { id: 'log-display', label: 'Visualización de Logs', icon: Monitor },
        { id: 'reports', label: 'Reportes Generales', icon: FileText }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:w-64 lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:justify-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">HoloCheck</h2>
          </div>
          
          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-4">
            {menuSections.map((section) => {
              const isCollapsed = collapsedSections[section.id];
              const SectionIcon = section.icon;
              
              return (
                <div key={section.id} className="space-y-2">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <SectionIcon className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-xs uppercase tracking-wide">{section.title}</span>
                    </div>
                    {section.items.length > 1 && (
                      isCollapsed ? 
                        <ChevronRight className="w-4 h-4 text-gray-400" /> : 
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Section Items */}
                  {!isCollapsed && (
                    <ul className="space-y-1 ml-6">
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
                                w-4 h-4 mr-3 flex-shrink-0
                                ${isActive ? 'text-blue-700' : 'text-gray-400'}
                              `} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Stats Section */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Estado del Sistema
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Evaluaciones Hoy</span>
                <span className="text-xs font-semibold text-blue-600">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Usuarios Activos</span>
                <span className="text-xs font-semibold text-green-600">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Precisión IA</span>
                <span className="text-xs font-semibold text-purple-600">94.2%</span>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-xs font-medium text-green-800">Sistema Seguro</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Datos protegidos con cifrado AES-256</p>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">U</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Usuario</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;