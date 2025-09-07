// Longitudinal health tracking and behavioral analysis data

export const pointsSystem = {
  activities: {
    healthCheck: {
      name: 'Chequeo Digital Completo',
      points: 100,
      description: 'Completar evaluación de selfie + voz',
      frequency: 'monthly',
      maxPerMonth: 1
    },
    followUpCheck: {
      name: 'Chequeo de Seguimiento',
      points: 50,
      description: 'Evaluación de progreso',
      frequency: 'weekly',
      maxPerMonth: 4
    },
    wellnessProgram: {
      name: 'Participación en Programa de Bienestar',
      points: 75,
      description: 'Asistir a actividades de wellness',
      frequency: 'weekly',
      maxPerMonth: 8
    }
  }
};

export const selfieIndicators = {
  cardiovascular: {
    heartRate: { value: 72, unit: 'bpm', normal: '60-100', status: 'normal' },
    heartRateVariability: { value: 45, unit: 'ms', normal: '20-50', status: 'good' },
    bloodPressureSystolic: { value: 125, unit: 'mmHg', normal: '90-140', status: 'normal' },
    bloodPressureDiastolic: { value: 80, unit: 'mmHg', normal: '60-90', status: 'normal' },
    pulseWaveVelocity: { value: 7.2, unit: 'm/s', normal: '5-10', status: 'normal' },
    cardiacOutput: { value: 5.2, unit: 'L/min', normal: '4-8', status: 'normal' },
    strokeVolume: { value: 70, unit: 'mL', normal: '60-100', status: 'normal' },
    ejectionFraction: { value: 65, unit: '%', normal: '50-70', status: 'good' },
    arterialStiffness: { value: 6.8, unit: 'index', normal: '5-9', status: 'normal' },
    peripheralResistance: { value: 1200, unit: 'dyn·s/cm⁵', normal: '800-1600', status: 'normal' }
  },
  
  respiratory: {
    respiratoryRate: { value: 16, unit: 'rpm', normal: '12-20', status: 'normal' },
    oxygenSaturation: { value: 98, unit: '%', normal: '95-100', status: 'excellent' },
    tidalVolume: { value: 500, unit: 'mL', normal: '400-600', status: 'normal' },
    respiratoryEfficiency: { value: 85, unit: '%', normal: '80-95', status: 'good' },
    breathingPattern: { value: 'regular', unit: 'pattern', normal: 'regular', status: 'normal' },
    apneaIndex: { value: 2, unit: 'events/hour', normal: '0-5', status: 'normal' }
  },

  neurological: {
    autonomicBalance: { value: 0.75, unit: 'ratio', normal: '0.5-1.5', status: 'good' },
    stressLevel: { value: 0.35, unit: 'index', normal: '0-0.5', status: 'normal' },
    cognitiveLoad: { value: 0.4, unit: 'index', normal: '0-0.7', status: 'normal' },
    alertnessLevel: { value: 0.8, unit: 'index', normal: '0.6-1.0', status: 'good' },
    fatigueIndex: { value: 0.2, unit: 'index', normal: '0-0.4', status: 'low' },
    emotionalState: { value: 'positive', unit: 'state', normal: 'neutral-positive', status: 'good' },
    anxietyLevel: { value: 0.15, unit: 'index', normal: '0-0.3', status: 'low' },
    depressionRisk: { value: 0.1, unit: 'risk', normal: '0-0.2', status: 'low' }
  },

  metabolic: {
    glucoseEstimate: { value: 95, unit: 'mg/dL', normal: '70-100', status: 'normal' },
    insulinSensitivity: { value: 0.8, unit: 'index', normal: '0.6-1.2', status: 'good' },
    metabolicRate: { value: 1650, unit: 'kcal/day', normal: '1400-2000', status: 'normal' },
    hydrationLevel: { value: 0.85, unit: 'index', normal: '0.7-1.0', status: 'good' },
    electrolytBalance: { value: 'balanced', unit: 'state', normal: 'balanced', status: 'normal' },
    lipidProfile: { value: 'normal', unit: 'profile', normal: 'normal', status: 'good' },
    inflammationMarkers: { value: 0.2, unit: 'index', normal: '0-0.4', status: 'low' },
    oxidativeStress: { value: 0.25, unit: 'index', normal: '0-0.5', status: 'low' }
  },

  hormonal: {
    cortisolLevel: { value: 12, unit: 'μg/dL', normal: '6-23', status: 'normal' },
    adrenalineLevel: { value: 0.3, unit: 'index', normal: '0-0.5', status: 'normal' },
    thyroidFunction: { value: 'normal', unit: 'function', normal: 'normal', status: 'good' },
    insulinLevel: { value: 8, unit: 'μIU/mL', normal: '2-25', status: 'normal' },
    growthHormone: { value: 2.5, unit: 'ng/mL', normal: '0-10', status: 'normal' },
    melatoninRhythm: { value: 'regular', unit: 'pattern', normal: 'regular', status: 'good' }
  },

  physical: {
    bodyTemperature: { value: 36.8, unit: '°C', normal: '36.1-37.2', status: 'normal' },
    skinPerfusion: { value: 'good', unit: 'quality', normal: 'good', status: 'normal' },
    microcirculation: { value: 0.85, unit: 'index', normal: '0.7-1.0', status: 'good' },
    muscularTension: { value: 0.3, unit: 'index', normal: '0-0.5', status: 'low' },
    posturalStability: { value: 0.9, unit: 'index', normal: '0.8-1.0', status: 'excellent' },
    balanceIndex: { value: 0.88, unit: 'index', normal: '0.7-1.0', status: 'good' },
    coordinationLevel: { value: 0.92, unit: 'index', normal: '0.8-1.0', status: 'excellent' },
    reactionTime: { value: 250, unit: 'ms', normal: '200-400', status: 'good' }
  },

  immunological: {
    immuneResponse: { value: 'strong', unit: 'response', normal: 'normal-strong', status: 'good' },
    whiteBloodCells: { value: 6500, unit: 'cells/μL', normal: '4000-11000', status: 'normal' },
    lymphocyteActivity: { value: 0.75, unit: 'index', normal: '0.6-0.9', status: 'good' },
    antibodyLevels: { value: 'adequate', unit: 'level', normal: 'adequate', status: 'normal' },
    inflammatoryResponse: { value: 'controlled', unit: 'response', normal: 'controlled', status: 'good' }
  },

  aging: {
    biologicalAge: { value: 32, unit: 'years', normal: '±5 chronological', status: 'good' },
    cellularHealth: { value: 0.82, unit: 'index', normal: '0.7-1.0', status: 'good' },
    telomereLength: { value: 'normal', unit: 'length', normal: 'normal', status: 'good' },
    antioxidantCapacity: { value: 0.78, unit: 'index', normal: '0.6-0.9', status: 'good' },
    dnaRepairEfficiency: { value: 0.85, unit: 'index', normal: '0.7-1.0', status: 'good' }
  },

  lifestyle: {
    sleepQuality: { value: 0.78, unit: 'index', normal: '0.7-1.0', status: 'good' },
    nutritionalStatus: { value: 'adequate', unit: 'status', normal: 'adequate', status: 'good' },
    exerciseCapacity: { value: 0.82, unit: 'index', normal: '0.7-1.0', status: 'good' },
    recoveryRate: { value: 0.85, unit: 'index', normal: '0.7-1.0', status: 'good' },
    stressResilience: { value: 0.75, unit: 'index', normal: '0.6-1.0', status: 'good' }
  },

  environmental: {
    lightExposure: { value: 'adequate', unit: 'exposure', normal: 'adequate', status: 'good' },
    airQualityImpact: { value: 'minimal', unit: 'impact', normal: 'minimal', status: 'good' },
    noiseStressLevel: { value: 0.2, unit: 'index', normal: '0-0.4', status: 'low' },
    ergonomicStress: { value: 0.25, unit: 'index', normal: '0-0.4', status: 'low' }
  }
};

export const voiceIndicators = {
  respiratory: {
    lungCapacity: { value: 4200, unit: 'mL', normal: '3000-5000', status: 'good' },
    breathSupport: { value: 0.85, unit: 'index', normal: '0.7-1.0', status: 'good' },
    respiratoryControl: { value: 0.82, unit: 'index', normal: '0.7-1.0', status: 'good' },
    airflowStability: { value: 0.88, unit: 'index', normal: '0.8-1.0', status: 'excellent' },
    breathingEfficiency: { value: 0.79, unit: 'index', normal: '0.7-0.9', status: 'good' },
    oxygenUtilization: { value: 0.92, unit: 'index', normal: '0.8-1.0', status: 'excellent' }
  },

  neurological: {
    cognitiveProcessing: { value: 0.87, unit: 'index', normal: '0.7-1.0', status: 'good' },
    memoryFunction: { value: 0.83, unit: 'index', normal: '0.7-1.0', status: 'good' },
    attentionSpan: { value: 0.89, unit: 'index', normal: '0.7-1.0', status: 'excellent' },
    executiveFunction: { value: 0.81, unit: 'index', normal: '0.7-1.0', status: 'good' },
    languageProcessing: { value: 0.94, unit: 'index', normal: '0.8-1.0', status: 'excellent' },
    motorControl: { value: 0.86, unit: 'index', normal: '0.7-1.0', status: 'good' },
    coordinationIndex: { value: 0.88, unit: 'index', normal: '0.7-1.0', status: 'good' }
  },

  psychological: {
    stressLevel: { value: 0.28, unit: 'index', normal: '0-0.4', status: 'low' },
    anxietyIndicators: { value: 0.18, unit: 'index', normal: '0-0.3', status: 'low' },
    depressionMarkers: { value: 0.12, unit: 'index', normal: '0-0.2', status: 'low' },
    emotionalStability: { value: 0.85, unit: 'index', normal: '0.7-1.0', status: 'good' },
    moodState: { value: 'positive', unit: 'state', normal: 'neutral-positive', status: 'good' },
    confidenceLevel: { value: 0.78, unit: 'index', normal: '0.6-1.0', status: 'good' },
    socialEngagement: { value: 0.82, unit: 'index', normal: '0.6-1.0', status: 'good' }
  },

  cardiovascular: {
    heartRateVariability: { value: 42, unit: 'ms', normal: '20-50', status: 'good' },
    autonomicBalance: { value: 0.72, unit: 'ratio', normal: '0.5-1.5', status: 'good' },
    vagalTone: { value: 0.68, unit: 'index', normal: '0.5-0.8', status: 'good' },
    sympatheticActivity: { value: 0.45, unit: 'index', normal: '0.3-0.6', status: 'normal' }
  },

  hormonal: {
    cortisolPattern: { value: 'normal', unit: 'pattern', normal: 'normal', status: 'good' },
    adrenalineResponse: { value: 0.25, unit: 'index', normal: '0-0.4', status: 'low' },
    serotoninLevel: { value: 0.75, unit: 'index', normal: '0.6-0.9', status: 'good' },
    dopamineActivity: { value: 0.78, unit: 'index', normal: '0.6-0.9', status: 'good' }
  },

  physical: {
    vocalCordHealth: { value: 'healthy', unit: 'condition', normal: 'healthy', status: 'good' },
    laryngealFunction: { value: 'normal', unit: 'function', normal: 'normal', status: 'good' },
    articulation: { value: 0.92, unit: 'index', normal: '0.8-1.0', status: 'excellent' },
    resonance: { value: 0.87, unit: 'index', normal: '0.7-1.0', status: 'good' },
    voiceStamina: { value: 0.84, unit: 'index', normal: '0.7-1.0', status: 'good' }
  },

  metabolic: {
    energyLevel: { value: 0.81, unit: 'index', normal: '0.7-1.0', status: 'good' },
    fatigueMarkers: { value: 0.22, unit: 'index', normal: '0-0.4', status: 'low' },
    hydrationStatus: { value: 0.88, unit: 'index', normal: '0.7-1.0', status: 'good' },
    nutritionalBalance: { value: 'adequate', unit: 'status', normal: 'adequate', status: 'good' }
  },

  sleep: {
    sleepQuality: { value: 0.79, unit: 'index', normal: '0.7-1.0', status: 'good' },
    sleepDeprivation: { value: 0.15, unit: 'index', normal: '0-0.3', status: 'low' },
    circadianRhythm: { value: 'regular', unit: 'pattern', normal: 'regular', status: 'good' },
    restfulness: { value: 0.83, unit: 'index', normal: '0.7-1.0', status: 'good' }
  },

  lifestyle: {
    smokingImpact: { value: 'none', unit: 'impact', normal: 'none', status: 'excellent' },
    alcoholEffect: { value: 'minimal', unit: 'effect', normal: 'minimal', status: 'good' },
    exerciseImpact: { value: 'positive', unit: 'impact', normal: 'positive', status: 'good' },
    environmentalStress: { value: 0.18, unit: 'index', normal: '0-0.4', status: 'low' }
  }
};

export const healthTimeline = {
  userId: 'user_001',
  assessments: [
    {
      date: '2024-10-15',
      cardiovascular: { hr: 75, hrv: 42, bp: '128/82', riskScore: 0.35 },
      metabolic: { diabetesRisk: 0.18, bmi: 25.1, metabolicScore: 0.42 },
      mental: { stressLevel: 0.65, anxietyScore: 0.3, energyLevel: 0.6 },
      recommendations: ['Actividad física moderada', 'Técnicas de relajación']
    },
    {
      date: '2024-11-15',
      cardiovascular: { hr: 72, hrv: 45, bp: '125/80', riskScore: 0.32 },
      metabolic: { diabetesRisk: 0.16, bmi: 24.8, metabolicScore: 0.38 },
      mental: { stressLevel: 0.55, anxietyScore: 0.25, energyLevel: 0.7 },
      recommendations: ['Continuar ejercicio', 'Mejorar higiene del sueño']
    },
    {
      date: '2024-12-15',
      cardiovascular: { hr: 70, hrv: 48, bp: '122/78', riskScore: 0.28 },
      metabolic: { diabetesRisk: 0.14, bmi: 24.5, metabolicScore: 0.35 },
      mental: { stressLevel: 0.45, anxietyScore: 0.2, energyLevel: 0.75 },
      recommendations: ['Mantener rutina actual', 'Incorporar mindfulness']
    },
    {
      date: '2025-01-15',
      cardiovascular: { hr: 68, hrv: 50, bp: '120/75', riskScore: 0.25 },
      metabolic: { diabetesRisk: 0.12, bmi: 24.2, metabolicScore: 0.32 },
      mental: { stressLevel: 0.4, anxietyScore: 0.18, energyLevel: 0.8 },
      recommendations: ['Excelente progreso', 'Evaluación nutricional avanzada']
    }
  ]
};

export const organizationalHealthData = {
  company_001: {
    byLevel: {
      direccion: {
        totalEmployees: 8,
        participationRate: 0.875,
        anonymizedMetrics: {
          avgStressLevel: 0.72,
          avgMetabolicRisk: 0.38,
          avgCardiovascularRisk: 0.42,
          sleepQuality: 0.65,
          burnoutRisk: 0.68
        },
        trends: {
          stressLevel: { change: -0.08, period: '3m' },
          metabolicRisk: { change: -0.05, period: '3m' },
          participation: { change: +0.125, period: '3m' }
        },
        recommendations: [
          'Programa ejecutivo de manejo de estrés',
          'Evaluaciones cardiológicas preventivas',
          'Coaching en liderazgo saludable'
        ]
      },
      gerencia: {
        totalEmployees: 24,
        participationRate: 0.792,
        anonymizedMetrics: {
          avgStressLevel: 0.58,
          avgMetabolicRisk: 0.35,
          avgCardiovascularRisk: 0.32,
          sleepQuality: 0.72,
          burnoutRisk: 0.45
        },
        trends: {
          stressLevel: { change: -0.12, period: '3m' },
          metabolicRisk: { change: -0.03, period: '3m' },
          participation: { change: +0.092, period: '3m' }
        },
        recommendations: [
          'Pausas activas entre reuniones',
          'Programa de nutrición ejecutiva',
          'Flexibilidad horaria estratégica'
        ]
      },
      jefatura: {
        totalEmployees: 68,
        participationRate: 0.735,
        anonymizedMetrics: {
          avgStressLevel: 0.52,
          avgMetabolicRisk: 0.31,
          avgCardiovascularRisk: 0.29,
          sleepQuality: 0.75,
          burnoutRisk: 0.38
        },
        trends: {
          stressLevel: { change: -0.15, period: '3m' },
          metabolicRisk: { change: -0.07, period: '3m' },
          participation: { change: +0.135, period: '3m' }
        },
        recommendations: [
          'Capacitación en delegación efectiva',
          'Programas de actividad física grupal',
          'Mejora en comunicación organizacional'
        ]
      },
      areas: {
        totalEmployees: 350,
        participationRate: 0.68,
        anonymizedMetrics: {
          avgStressLevel: 0.45,
          avgMetabolicRisk: 0.28,
          avgCardiovascularRisk: 0.26,
          sleepQuality: 0.78,
          burnoutRisk: 0.32
        },
        trends: {
          stressLevel: { change: -0.18, period: '3m' },
          metabolicRisk: { change: -0.09, period: '3m' },
          participation: { change: +0.18, period: '3m' }
        },
        recommendations: [
          'Retos de bienestar por equipos',
          'Mejora en espacios de trabajo',
          'Programas de reconocimiento saludable'
        ]
      }
    },
    overallTrends: {
      participationGrowth: 0.145,
      stressReduction: 0.138,
      metabolicImprovement: 0.068,
      absenteeismReduction: 0.156,
      productivityIncrease: 0.089
    }
  }
};

export const actuarialAnalysis = {
  INS_CR: {
    portfolioMetrics: {
      totalCompanies: 45,
      totalEmployees: 12500,
      averageAge: 38.2,
      genderDistribution: { male: 0.52, female: 0.48 },
      industryDistribution: {
        technology: 0.28,
        finance: 0.22,
        manufacturing: 0.18,
        services: 0.32
      }
    },
    riskIndicators: {
      cardiovascularRisk: {
        current: 0.31,
        trend: -0.08,
        projection12m: 0.26,
        impactOnClaims: -0.12
      },
      metabolicRisk: {
        current: 0.29,
        trend: -0.06,
        projection12m: 0.25,
        impactOnClaims: -0.09
      },
      mentalHealthRisk: {
        current: 0.34,
        trend: -0.11,
        projection12m: 0.27,
        impactOnClaims: -0.15
      }
    },
    actuarialAdjustments: {
      premiumReduction: {
        lowRisk: 0.08,
        mediumRisk: 0.04,
        highRisk: 0.02
      },
      claimsProjection: {
        currentYear: 1.0,
        year1: 0.92,
        year2: 0.85,
        year3: 0.81
      },
      retentionImprovement: {
        currentRate: 0.87,
        projectedRate: 0.92,
        valueImpact: 2400000
      }
    },
    behavioralInsights: {
      engagementPatterns: {
        highEngagement: 0.34,
        mediumEngagement: 0.48,
        lowEngagement: 0.18
      },
      interventionEffectiveness: {
        nutritionPrograms: 0.73,
        exerciseInitiatives: 0.68,
        stressManagement: 0.81,
        sleepHygiene: 0.65
      },
      longitudinalOutcomes: {
        sustainedImprovement: 0.67,
        temporaryImprovement: 0.23,
        noChange: 0.08,
        deterioration: 0.02
      }
    }
  }
};

export const recommendationEngine = {
  individual: {
    cardiovascular: [
      { condition: 'hr > 80', recommendation: 'Evaluación cardiológica', priority: 'high' },
      { condition: 'hrv < 30', recommendation: 'Ejercicio aeróbico moderado', priority: 'medium' },
      { condition: 'bp > 140/90', recommendation: 'Consulta médica urgente', priority: 'critical' }
    ],
    metabolic: [
      { condition: 'diabetesRisk > 0.2', recommendation: 'Programa nutricional intensivo', priority: 'high' },
      { condition: 'bmi > 25', recommendation: 'Plan de actividad física personalizado', priority: 'medium' }
    ],
    mental: [
      { condition: 'stressLevel > 0.7', recommendation: 'Intervención psicológica', priority: 'high' },
      { condition: 'anxietyScore > 0.4', recommendation: 'Técnicas de mindfulness', priority: 'medium' }
    ]
  },
  organizational: {
    direccion: [
      'Programa ejecutivo de wellness',
      'Coaching en liderazgo saludable',
      'Evaluaciones médicas VIP'
    ],
    gerencia: [
      'Gestión del tiempo y estrés',
      'Nutrición ejecutiva',
      'Ejercicio en horario laboral'
    ],
    jefatura: [
      'Capacitación en delegación',
      'Pausas activas supervisadas',
      'Comunicación asertiva'
    ],
    areas: [
      'Retos de bienestar grupal',
      'Mejora ergonómica',
      'Programas de reconocimiento'
    ]
  },
  actuarial: [
    'Ajuste de primas por cohorte de riesgo',
    'Productos preventivos personalizados',
    'Incentivos por participación sostenida',
    'Modelos predictivos de siniestralidad'
  ]
};

export const userGamificationProfile = {
  userId: 'user_001',
  totalPoints: 8750,
  availablePoints: 2150,
  level: 'Gold',
  nextLevel: 'Platinum',
  pointsToNextLevel: 1250,
  
  currentStreak: 23,
  longestStreak: 45,
  
  badges: [
    {
      id: 'first_check',
      name: 'Primer Chequeo',
      description: 'Completaste tu primer chequeo digital',
      earnedDate: '2024-10-15',
      icon: '🏆'
    },
    {
      id: 'consistency_week',
      name: 'Semana Consistente',
      description: '7 días consecutivos de actividad',
      earnedDate: '2024-11-02',
      icon: '🔥'
    },
    {
      id: 'health_improver',
      name: 'Mejorador de Salud',
      description: 'Mejoraste tus indicadores de salud',
      earnedDate: '2024-12-01',
      icon: '📈'
    },
    {
      id: 'team_player',
      name: 'Jugador de Equipo',
      description: 'Participaste en 5 retos grupales',
      earnedDate: '2024-12-15',
      icon: '🤝'
    }
  ],
  
  monthlyActivity: {
    checksCompleted: 4,
    programsAttended: 12,
    activePauses: 18,
    pointsEarned: 1450,
    teamChallenges: 2
  },
  
  recentTransactions: [
    {
      date: '2025-01-10',
      type: 'earned',
      activity: 'Chequeo Digital Completo',
      points: 100,
      description: 'Evaluación mensual completada'
    },
    {
      date: '2025-01-08',
      type: 'redeemed',
      item: 'Botella de Agua Inteligente',
      points: -1500,
      description: 'Canjeado por botella inteligente'
    },
    {
      date: '2025-01-05',
      type: 'earned',
      activity: 'Taller de Nutrición',
      points: 60,
      description: 'Asistencia a taller nutricional'
    },
    {
      date: '2025-01-03',
      type: 'bonus',
      activity: 'Racha de Consistencia',
      points: 50,
      description: 'Bonus por 20 días consecutivos'
    }
  ],
  
  achievements: {
    totalChecksCompleted: 15,
    totalProgramsAttended: 48,
    totalPointsEarned: 12500,
    itemsRedeemed: 3,
    badgesEarned: 4,
    currentRank: 'Gold',
    companyRanking: 23
  }
};