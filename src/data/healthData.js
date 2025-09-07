// Mock health data for the Digital Health Check Platform

export const personalHealthData = {
  userId: "user_001",
  lastCheckup: "2025-01-15",
  riskLevel: "medium",
  
  // Selfie-based markers (30-100 potential markers)
  selfieMarkers: {
    cardiovascular: {
      heartRate: 72,
      hrv: 45,
      respiratoryRate: 16,
      bloodPressureEstimate: "125/80",
      perfusionIndex: 2.1,
      riskScore: 0.3
    },
    metabolic: {
      diabetesRisk10Year: 0.15,
      metabolicRiskScore: 0.4,
      bmiEstimate: 24.5,
      riskLevel: "moderate"
    },
    stressFatigue: {
      stressIndex: 0.6,
      fatigueLevel: 0.4,
      resilienceScore: 0.7,
      burnoutRisk: "low"
    },
    skinSignals: {
      colorimetricChanges: "normal",
      superficialSigns: "none",
      skinHealth: "good"
    }
  },
  
  // Voice-based markers (20-30 indicators)
  voiceMarkers: {
    mentalHealth: {
      stressLevel: 0.4,
      anxietyIndicators: 0.2,
      depressionRisk: 0.1,
      prosodyScore: 0.8,
      energyLevel: 0.7
    },
    respiratory: {
      vocalEffort: 0.3,
      breathingPattern: "normal",
      respiratoryRisk: 0.1,
      voiceStrain: "minimal"
    },
    neurological: {
      speechRhythm: "normal",
      microPauses: 2,
      intonationVariability: 0.8,
      cognitiveLoad: 0.3
    }
  },
  
  // Preventive actions and recommendations
  recommendations: [
    {
      category: "cardiovascular",
      action: "Realizar chequeo cardiológico de rutina",
      priority: "medium",
      description: "HRV ligeramente bajo, considerar actividad física gradual"
    },
    {
      category: "stress",
      action: "Implementar pausas activas",
      priority: "high", 
      description: "Índice de estrés elevado, recomendamos mindfulness y técnicas de relajación"
    },
    {
      category: "metabolic",
      action: "Programa nutricional personalizado",
      priority: "medium",
      description: "Riesgo metabólico moderado, seguimiento trimestral recomendado"
    }
  ]
};

export const companyHealthData = {
  companyId: "company_001",
  employeeCount: 450,
  participationRate: 0.68,
  
  // Anonymous aggregated occupational health markers
  occupationalMarkers: {
    collectiveStress: {
      percentage: 0.35,
      trend: "increasing",
      highRiskDepartments: ["IT", "Customer Service"],
      recommendation: "Programas anti-burnout y pausas activas"
    },
    metabolicRisk: {
      percentage: 0.28,
      atRiskEmployees: 126,
      trend: "stable",
      recommendation: "Campañas de nutrición y retos de actividad física"
    },
    sleepPatterns: {
      poorSleepPercentage: 0.42,
      fatigueReports: 0.38,
      shiftWorkImpact: "high",
      recommendation: "Charlas de higiene del sueño y ajustes de turnos"
    }
  },
  
  // Wellness program metrics
  wellnessPrograms: {
    nutrition: {
      participation: 0.45,
      effectiveness: 0.72,
      costSavings: 15000
    },
    activePauses: {
      participation: 0.58,
      stressReduction: 0.23,
      productivityIncrease: 0.12
    },
    ergonomics: {
      participation: 0.34,
      injuryReduction: 0.18,
      satisfactionScore: 0.81
    }
  },
  
  // Expected impact metrics
  expectedImpact: {
    absenteeismReduction: "10-20%",
    productivityIncrease: "8-15%",
    healthcareCostSavings: "$200-400 per employee/year",
    employeeSatisfaction: "+15%"
  }
};

export const insuranceData = {
  portfolioId: "portfolio_001",
  totalLives: 25000,
  region: "Costa Rica",
  
  // Open data integration (epidemiological, traffic, demographic)
  openDataSources: {
    epidemiological: {
      dengueIncidence: 0.08,
      iragCases: 0.12,
      chronicDiseases: 0.24,
      epiScore: 0.6,
      seasonalAlerts: ["dengue", "respiratory"]
    },
    traffic: {
      accidentRate: 0.05,
      roadRiskScore: 0.4,
      highRiskCantons: ["San José Centro", "Cartago"],
      trafficCampaignNeeded: true
    },
    demographic: {
      averageAge: 38.5,
      povertyIndex: 0.18,
      educationLevel: 0.72,
      socioRisk: 0.3
    }
  },
  
  // Aggregated biosignals from insured population
  biosignalsAggregated: {
    averageRiskScore: 0.35,
    cardiovascularRisk: 0.28,
    metabolicRisk: 0.31,
    mentalHealthRisk: 0.22,
    bioScore: 0.65,
    trendDirection: "improving"
  },
  
  // Actuarial model adjustments
  actuarialAdjustments: {
    frequencySeverityReduction: "6-12%",
    expectedTimeframe: "12-24 months",
    premiumAdjustment: "-3% to -5%",
    retentionImprovement: "+2-4 percentage points",
    newProductOpportunities: [
      "Microseguros preventivos",
      "Vida interactiva con descuentos",
      "Wellness corporativo"
    ]
  },
  
  // Risk stratification cohorts
  riskCohorts: [
    {
      name: "Bajo Riesgo",
      percentage: 0.45,
      characteristics: "Jóvenes, activos, bajo estrés",
      premiumDiscount: "5-8%"
    },
    {
      name: "Riesgo Moderado", 
      percentage: 0.38,
      characteristics: "Edad media, factores controlables",
      premiumDiscount: "2-4%"
    },
    {
      name: "Alto Riesgo",
      percentage: 0.17,
      characteristics: "Múltiples factores, seguimiento intensivo",
      premiumSurcharge: "10-15%"
    }
  ]
};

export const kpiData = {
  pilotPhase: {
    participation: 0.68,
    npsScore: 65,
    earlyDetections: 0.10,
    consultationReduction: 0.08,
    validCaptures: 0.87,
    avgCheckupTime: 4.2
  },
  
  expectedOutcomes: {
    claimsReduction: "6-12%",
    absenteeismReduction: "10-20%",
    customerRetention: "+2-4pp",
    operationalSavings: "$156,000/year",
    roiTimeframe: "12-18 months"
  }
};