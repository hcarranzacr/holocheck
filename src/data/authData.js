// Authentication data structure for different access types and roles
export const authData = {
  accessTypes: {
    patient: {
      name: 'Paciente/Asegurado',
      roles: [
        {
          id: 'individual_patient',
          name: 'Paciente Individual',
          description: 'Acceso personal para chequeos médicos individuales',
          permissions: [
            'Realizar chequeo médico personal',
            'Ver historial médico propio',
            'Acceder a recomendaciones personalizadas',
            'Descargar reportes médicos'
          ]
        },
        {
          id: 'family_member',
          name: 'Miembro Familiar',
          description: 'Acceso para gestionar salud familiar',
          permissions: [
            'Gestionar perfiles familiares',
            'Ver reportes de dependientes',
            'Programar citas familiares',
            'Acceder a planes familiares'
          ]
        }
      ]
    },
    company: {
      name: 'Empresa/Capital Humano',
      roles: [
        {
          id: 'hr_manager',
          name: 'Gerente de Recursos Humanos',
          description: 'Gestión completa de salud organizacional',
          permissions: [
            'Ver métricas de salud organizacional',
            'Generar reportes por departamento',
            'Configurar programas de bienestar',
            'Acceder a análisis predictivos',
            'Gestionar políticas de salud'
          ]
        },
        {
          id: 'wellness_coordinator',
          name: 'Coordinador de Bienestar',
          description: 'Coordinación de programas de bienestar empresarial',
          permissions: [
            'Diseñar programas de bienestar',
            'Monitorear participación empleados',
            'Generar reportes de bienestar',
            'Coordinar actividades de salud'
          ]
        },
        {
          id: 'department_supervisor',
          name: 'Supervisor de Departamento',
          description: 'Supervisión de salud departamental',
          permissions: [
            'Ver métricas departamentales',
            'Identificar riesgos de salud',
            'Generar reportes de equipo',
            'Acceder a recomendaciones grupales'
          ]
        }
      ]
    },
    insurance: {
      name: 'Aseguradora',
      roles: [
        {
          id: 'actuarial_analyst',
          name: 'Analista Actuarial',
          description: 'Análisis de riesgos y modelado actuarial',
          permissions: [
            'Acceder a datos agregados de salud',
            'Generar modelos predictivos',
            'Analizar tendencias de siniestralidad',
            'Crear reportes actuariales',
            'Evaluar riesgos de cartera'
          ]
        },
        {
          id: 'underwriter',
          name: 'Suscriptor de Seguros',
          description: 'Evaluación y suscripción de pólizas',
          permissions: [
            'Evaluar perfiles de riesgo',
            'Determinar primas de seguros',
            'Revisar aplicaciones de pólizas',
            'Acceder a indicadores macro'
          ]
        },
        {
          id: 'claims_manager',
          name: 'Gerente de Siniestros',
          description: 'Gestión y análisis de reclamaciones',
          permissions: [
            'Gestionar reclamaciones médicas',
            'Analizar patrones de siniestros',
            'Generar reportes de costos',
            'Identificar fraudes potenciales'
          ]
        },
        {
          id: 'portfolio_manager',
          name: 'Gerente de Cartera',
          description: 'Gestión multi-empresa y carteras de clientes',
          permissions: [
            'Gestionar múltiples empresas',
            'Analizar rentabilidad de carteras',
            'Generar reportes consolidados',
            'Optimizar estrategias de cartera'
          ]
        }
      ]
    }
  },
  
  // Organizational levels for company access
  organizationalLevels: [
    {
      id: 'executive',
      name: 'Nivel Ejecutivo',
      description: 'CEO, CFO, CHRO - Vista estratégica completa',
      accessLevel: 'full'
    },
    {
      id: 'management',
      name: 'Nivel Gerencial',
      description: 'Gerentes de área - Vista departamental',
      accessLevel: 'departmental'
    },
    {
      id: 'supervision',
      name: 'Nivel Supervisión',
      description: 'Supervisores de equipo - Vista de equipo',
      accessLevel: 'team'
    },
    {
      id: 'operational',
      name: 'Nivel Operativo',
      description: 'Coordinadores - Vista operativa limitada',
      accessLevel: 'limited'
    }
  ],

  // Access forms for different user types
  accessForms: [
    {
      id: 'web_portal',
      name: 'Portal Web',
      description: 'Acceso completo vía navegador web',
      features: ['Dashboard completo', 'Reportes avanzados', 'Configuraciones']
    },
    {
      id: 'mobile_app',
      name: 'Aplicación Móvil',
      description: 'Acceso móvil optimizado',
      features: ['Chequeos rápidos', 'Notificaciones', 'Vista simplificada']
    },
    {
      id: 'api_access',
      name: 'Acceso API',
      description: 'Integración programática',
      features: ['Datos en tiempo real', 'Integración sistemas', 'Automatización']
    },
    {
      id: 'reports_only',
      name: 'Solo Reportes',
      description: 'Acceso limitado a reportes',
      features: ['Reportes predefinidos', 'Exportación datos', 'Vista solo lectura']
    }
  ]
};

// Companies data for organizational health
export const companies = [
  {
    id: 'tech_corp',
    name: 'TechCorp Solutions',
    industry: 'Tecnología',
    employees: 1250,
    healthScore: 8.4,
    riskLevel: 'Bajo',
    departments: ['Desarrollo', 'QA', 'DevOps', 'Producto'],
    location: 'Ciudad de México'
  },
  {
    id: 'manufacturing_inc',
    name: 'Manufacturing Inc.',
    industry: 'Manufactura',
    employees: 850,
    healthScore: 7.2,
    riskLevel: 'Medio',
    departments: ['Producción', 'Calidad', 'Logística', 'Mantenimiento'],
    location: 'Guadalajara'
  },
  {
    id: 'finance_group',
    name: 'Finance Group',
    industry: 'Servicios Financieros',
    employees: 650,
    healthScore: 8.8,
    riskLevel: 'Bajo',
    departments: ['Banca', 'Inversiones', 'Seguros', 'Crédito'],
    location: 'Monterrey'
  },
  {
    id: 'retail_chain',
    name: 'Retail Chain SA',
    industry: 'Retail',
    employees: 2100,
    healthScore: 6.9,
    riskLevel: 'Alto',
    departments: ['Ventas', 'Almacén', 'Atención al Cliente', 'Marketing'],
    location: 'Nacional'
  }
];

// Insurance groups data
export const insuranceGroups = [
  {
    id: 'grupo_nacional',
    name: 'Grupo Nacional de Seguros',
    companies: ['tech_corp', 'finance_group'],
    totalEmployees: 1900,
    avgHealthScore: 8.6,
    premiumLevel: 'Premium'
  },
  {
    id: 'seguros_industriales',
    name: 'Seguros Industriales SA',
    companies: ['manufacturing_inc'],
    totalEmployees: 850,
    avgHealthScore: 7.2,
    premiumLevel: 'Standard'
  },
  {
    id: 'aseguradora_popular',
    name: 'Aseguradora Popular',
    companies: ['retail_chain'],
    totalEmployees: 2100,
    avgHealthScore: 6.9,
    premiumLevel: 'Basic'
  }
];

// Export individual items that are imported by other components
export const organizationalLevels = authData.organizationalLevels;
export const accessForms = authData.accessForms;

// Default export
export default authData;