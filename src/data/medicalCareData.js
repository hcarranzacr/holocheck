// Medical Care Tracking and Insurance Resource Management Data

export const medicalCareData = {
  appointments: [
    {
      id: 'apt_001',
      userId: 'user_001',
      date: '2025-01-15',
      time: '10:30',
      type: 'Consulta General',
      doctor: 'Dr. María González',
      clinic: 'Clínica San José',
      specialty: 'Medicina General',
      cost: 45000,
      insuranceCoverage: 80,
      status: 'Completada',
      diagnosis: 'Chequeo preventivo',
      treatments: ['Análisis de sangre', 'Recomendaciones nutricionales'],
      followUp: '2025-04-15',
      satisfaction: 4.5,
      anonymous_id: 'anon_001'
    },
    {
      id: 'apt_002',
      userId: 'user_002',
      date: '2025-01-10',
      time: '14:00',
      type: 'Especialista',
      doctor: 'Dr. Carlos Rodríguez',
      clinic: 'Hospital Metropolitano',
      specialty: 'Cardiología',
      cost: 85000,
      insuranceCoverage: 90,
      status: 'Completada',
      diagnosis: 'Hipertensión leve',
      treatments: ['Medicamento antihipertensivo', 'Dieta baja en sodio'],
      followUp: '2025-02-10',
      satisfaction: 5.0,
      anonymous_id: 'anon_002'
    }
  ],

  doctors: [
    {
      id: 'doc_001',
      name: 'Dr. María González',
      specialty: 'Medicina General',
      license: 'MED-12345',
      clinics: ['Clínica San José', 'Centro Médico Central'],
      experience: 15,
      rating: 4.7,
      totalPatients: 1250,
      averageCost: 45000,
      insuranceAccepted: ['INS', 'CCSS', 'Seguros del Magisterio'],
      languages: ['Español', 'Inglés'],
      anonymous_id: 'doc_anon_001'
    },
    {
      id: 'doc_002',
      name: 'Dr. Carlos Rodríguez',
      specialty: 'Cardiología',
      license: 'CAR-67890',
      clinics: ['Hospital Metropolitano', 'Clínica Cardiovascular'],
      experience: 20,
      rating: 4.9,
      totalPatients: 850,
      averageCost: 85000,
      insuranceAccepted: ['INS', 'CCSS'],
      languages: ['Español'],
      anonymous_id: 'doc_anon_002'
    }
  ],

  clinics: [
    {
      id: 'clinic_001',
      name: 'Clínica San José',
      type: 'Clínica Privada',
      location: 'San José, Centro',
      specialties: ['Medicina General', 'Pediatría', 'Ginecología'],
      doctors: ['Dr. María González', 'Dra. Ana Pérez'],
      rating: 4.5,
      averageWaitTime: 25,
      facilities: ['Laboratorio', 'Rayos X', 'Farmacia'],
      insuranceAccepted: ['INS', 'CCSS', 'Seguros del Magisterio'],
      anonymous_id: 'clinic_anon_001'
    },
    {
      id: 'clinic_002',
      name: 'Hospital Metropolitano',
      type: 'Hospital Privado',
      location: 'San José, Escazú',
      specialties: ['Cardiología', 'Neurología', 'Oncología', 'Cirugía'],
      doctors: ['Dr. Carlos Rodríguez', 'Dr. Luis Herrera'],
      rating: 4.8,
      averageWaitTime: 35,
      facilities: ['UCI', 'Quirófanos', 'Laboratorio', 'Rayos X', 'Resonancia'],
      insuranceAccepted: ['INS', 'CCSS'],
      anonymous_id: 'clinic_anon_002'
    }
  ],

  treatments: [
    {
      id: 'treat_001',
      name: 'Análisis de sangre completo',
      category: 'Diagnóstico',
      averageCost: 25000,
      duration: '1 día',
      effectiveness: 0.95,
      commonFor: ['Chequeo preventivo', 'Diabetes', 'Anemia'],
      insuranceCoverage: 85,
      anonymous_id: 'treat_anon_001'
    },
    {
      id: 'treat_002',
      name: 'Medicamento antihipertensivo',
      category: 'Farmacológico',
      averageCost: 15000,
      duration: '30 días',
      effectiveness: 0.88,
      commonFor: ['Hipertensión', 'Prevención cardiovascular'],
      insuranceCoverage: 70,
      sideEffects: ['Mareos leves', 'Fatiga'],
      anonymous_id: 'treat_anon_002'
    }
  ]
};

export const insuranceAnalytics = {
  resourceUtilization: {
    monthly: {
      totalClaims: 2450,
      totalCost: 125000000,
      averageClaimCost: 51020,
      topSpecialties: [
        { name: 'Medicina General', percentage: 35, cost: 43750000 },
        { name: 'Cardiología', percentage: 18, cost: 22500000 },
        { name: 'Pediatría', percentage: 15, cost: 18750000 },
        { name: 'Ginecología', percentage: 12, cost: 15000000 },
        { name: 'Dermatología', percentage: 10, cost: 12500000 },
        { name: 'Otros', percentage: 10, cost: 12500000 }
      ],
      fraudRisk: 0.03,
      preventiveCare: 0.28
    },
    
    patterns: {
      seasonality: {
        'Enero': { claims: 220, avgCost: 48000, trend: 'Alto' },
        'Febrero': { claims: 195, avgCost: 52000, trend: 'Medio' },
        'Marzo': { claims: 210, avgCost: 49000, trend: 'Medio' },
        'Abril': { claims: 185, avgCost: 51000, trend: 'Bajo' }
      },
      
      ageGroups: {
        '18-30': { utilization: 0.15, avgCost: 35000, commonIssues: ['Chequeos', 'Accidentes'] },
        '31-45': { utilization: 0.25, avgCost: 45000, commonIssues: ['Estrés', 'Preventivo'] },
        '46-60': { utilization: 0.35, avgCost: 65000, commonIssues: ['Cardiovascular', 'Diabetes'] },
        '60+': { utilization: 0.45, avgCost: 85000, commonIssues: ['Crónicas', 'Múltiples'] }
      }
    }
  },

  doctorClinicRelationships: {
    networks: [
      {
        doctorId: 'doc_anon_001',
        clinicIds: ['clinic_anon_001', 'clinic_anon_003'],
        exclusivity: 0.7,
        referralRate: 0.15,
        patientSatisfaction: 4.7,
        costEfficiency: 0.85
      },
      {
        doctorId: 'doc_anon_002',
        clinicIds: ['clinic_anon_002'],
        exclusivity: 0.95,
        referralRate: 0.25,
        patientSatisfaction: 4.9,
        costEfficiency: 0.78
      }
    ],
    
    referralPatterns: {
      'Medicina General → Cardiología': { frequency: 0.12, appropriateness: 0.89 },
      'Medicina General → Endocrinología': { frequency: 0.08, appropriateness: 0.92 },
      'Cardiología → Medicina General': { frequency: 0.05, appropriateness: 0.95 }
    }
  },

  treatmentEffectiveness: {
    outcomes: [
      {
        treatmentId: 'treat_anon_001',
        successRate: 0.95,
        averageRecoveryTime: 7,
        costPerSuccess: 26315,
        patientSatisfaction: 4.2,
        relapseRate: 0.02
      },
      {
        treatmentId: 'treat_anon_002',
        successRate: 0.88,
        averageRecoveryTime: 30,
        costPerSuccess: 17045,
        patientSatisfaction: 4.0,
        relapseRate: 0.08
      }
    ],
    
    comparativeAnalysis: {
      'Hipertensión': {
        treatments: [
          { name: 'Medicamento A', effectiveness: 0.88, cost: 15000 },
          { name: 'Medicamento B', effectiveness: 0.82, cost: 12000 },
          { name: 'Cambios de estilo', effectiveness: 0.65, cost: 5000 }
        ],
        recommendedApproach: 'Combinado'
      }
    }
  },

  riskAssessment: {
    fraudIndicators: [
      {
        type: 'Frecuencia excesiva',
        description: 'Más de 10 consultas por mes',
        riskLevel: 'Alto',
        detectedCases: 12,
        falsePositives: 0.05
      },
      {
        type: 'Costos atípicos',
        description: 'Costos 3x superiores al promedio',
        riskLevel: 'Medio',
        detectedCases: 8,
        falsePositives: 0.15
      }
    ],
    
    preventiveOpportunities: [
      {
        condition: 'Diabetes Tipo 2',
        targetPopulation: 'Hombres 45-65 con sobrepeso',
        interventionCost: 25000,
        potentialSavings: 150000,
        roi: 6.0
      }
    ]
  }
};

export const medicalSpecialties = [
  'Medicina General',
  'Cardiología',
  'Endocrinología',
  'Neurología',
  'Pediatría',
  'Ginecología',
  'Dermatología',
  'Psiquiatría',
  'Oftalmología',
  'Otorrinolaringología',
  'Traumatología',
  'Urología',
  'Oncología',
  'Gastroenterología',
  'Neumología',
  'Reumatología'
];

export const appointmentTypes = [
  'Consulta General',
  'Especialista',
  'Chequeo Preventivo',
  'Seguimiento',
  'Emergencia',
  'Procedimiento',
  'Examen Diagnóstico',
  'Terapia',
  'Cirugía Menor',
  'Consulta Virtual'
];

export const treatmentCategories = [
  'Farmacológico',
  'Diagnóstico',
  'Terapéutico',
  'Preventivo',
  'Quirúrgico',
  'Rehabilitación',
  'Psicológico',
  'Nutricional',
  'Educativo',
  'Monitoreo'
];