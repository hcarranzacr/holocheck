// Gamification and rewards system data

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
    },
    activePause: {
      name: 'Pausas Activas',
      points: 25,
      description: 'Participar en pausas activas diarias',
      frequency: 'daily',
      maxPerMonth: 30
    },
    nutritionWorkshop: {
      name: 'Taller de Nutrición',
      points: 60,
      description: 'Asistir a talleres nutricionales',
      frequency: 'weekly',
      maxPerMonth: 4
    },
    stressManagement: {
      name: 'Sesión de Manejo de Estrés',
      points: 80,
      description: 'Mindfulness y técnicas de relajación',
      frequency: 'weekly',
      maxPerMonth: 4
    },
    physicalActivity: {
      name: 'Actividad Física Registrada',
      points: 40,
      description: 'Registrar actividad física (30+ min)',
      frequency: 'daily',
      maxPerMonth: 30
    },
    healthyHabits: {
      name: 'Hábito Saludable Sostenido',
      points: 150,
      description: 'Mantener hábito por 30 días consecutivos',
      frequency: 'monthly',
      maxPerMonth: 3
    },
    teamChallenge: {
      name: 'Reto Grupal Completado',
      points: 120,
      description: 'Participar en retos de equipo/departamento',
      frequency: 'monthly',
      maxPerMonth: 2
    },
    healthImprovement: {
      name: 'Mejora en Indicadores de Salud',
      points: 200,
      description: 'Mejora demostrable en marcadores de salud',
      frequency: 'quarterly',
      maxPerQuarter: 1
    }
  },
  
  bonusMultipliers: {
    consistency: {
      name: 'Racha de Consistencia',
      description: 'Multiplicador por días consecutivos de actividad',
      multipliers: {
        7: 1.1,   // 7 días: +10%
        14: 1.2,  // 14 días: +20%
        30: 1.5,  // 30 días: +50%
        60: 2.0,  // 60 días: +100%
        90: 2.5   // 90 días: +150%
      }
    },
    teamParticipation: {
      name: 'Participación Grupal',
      description: 'Bonus por participación del equipo/área',
      multipliers: {
        0.5: 1.0,   // 50% participación: sin bonus
        0.7: 1.1,   // 70% participación: +10%
        0.8: 1.2,   // 80% participación: +20%
        0.9: 1.3,   // 90% participación: +30%
        1.0: 1.5    // 100% participación: +50%
      }
    },
    healthRisk: {
      name: 'Mejora de Riesgo',
      description: 'Bonus por reducir nivel de riesgo de salud',
      multipliers: {
        'high_to_medium': 1.5,
        'high_to_low': 2.0,
        'medium_to_low': 1.3
      }
    }
  }
};

export const rewardsStore = {
  categories: {
    fitness: {
      name: 'Equipos de Fitness',
      icon: '🏃‍♂️',
      items: [
        {
          id: 'garmin_vivoactive',
          name: 'Garmin Vívoactive 5',
          description: 'Smartwatch con GPS y monitoreo de salud 24/7',
          points: 15000,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'fitness',
          features: ['GPS', 'Monitor cardíaco', 'Seguimiento sueño', 'Resistente al agua']
        },
        {
          id: 'garmin_forerunner',
          name: 'Garmin Forerunner 255',
          description: 'Reloj GPS para running con métricas avanzadas',
          points: 18000,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'fitness',
          features: ['GPS multibanda', 'Métricas running', 'Batería 14 días', 'Planes entrenamiento']
        },
        {
          id: 'fitbit_charge',
          name: 'Fitbit Charge 6',
          description: 'Pulsera fitness con GPS integrado',
          points: 8000,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'fitness',
          features: ['GPS integrado', 'Monitor estrés', 'Spotify', 'Google Pay']
        },
        {
          id: 'apple_watch',
          name: 'Apple Watch SE',
          description: 'Smartwatch con funciones avanzadas de salud',
          points: 12000,
          image: '/api/placeholder/300/200',
          inStock: false,
          category: 'fitness',
          features: ['ECG', 'Detección caídas', 'Siri', 'Resistente al agua']
        }
      ]
    },
    
    accessories: {
      name: 'Accesorios Deportivos',
      icon: '🎒',
      items: [
        {
          id: 'gym_backpack',
          name: 'Mochila Deportiva Premium',
          description: 'Mochila resistente con compartimentos especializados',
          points: 3500,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'accessories',
          features: ['Compartimento zapatos', 'Resistente al agua', 'Puerto USB', 'Garantía 2 años']
        },
        {
          id: 'water_bottle',
          name: 'Botella de Agua Inteligente',
          description: 'Botella con recordatorios de hidratación',
          points: 1500,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'accessories',
          features: ['Recordatorios LED', 'Acero inoxidable', '750ml', 'App móvil']
        },
        {
          id: 'yoga_mat',
          name: 'Mat de Yoga Profesional',
          description: 'Mat antideslizante con guías de alineación',
          points: 2000,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'accessories',
          features: ['Antideslizante', 'Guías alineación', 'Eco-friendly', 'Grosor 6mm']
        },
        {
          id: 'resistance_bands',
          name: 'Set Bandas de Resistencia',
          description: 'Kit completo para ejercicios de resistencia',
          points: 1200,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'accessories',
          features: ['5 niveles resistencia', 'Anclaje puerta', 'Manijas ergonómicas', 'Guía ejercicios']
        }
      ]
    },
    
    wellness: {
      name: 'Bienestar y Salud',
      icon: '🧘‍♀️',
      items: [
        {
          id: 'massage_gun',
          name: 'Pistola de Masaje Terapéutica',
          description: 'Dispositivo de recuperación muscular',
          points: 6000,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'wellness',
          features: ['6 velocidades', '4 cabezales', 'Batería 6h', 'Silencioso']
        },
        {
          id: 'meditation_cushion',
          name: 'Cojín de Meditación',
          description: 'Cojín ergonómico para práctica de mindfulness',
          points: 800,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'wellness',
          features: ['Relleno orgánico', 'Funda lavable', 'Altura ajustable', 'Diseño ergonómico']
        },
        {
          id: 'essential_oils',
          name: 'Set Aceites Esenciales',
          description: 'Colección de aceites para aromaterapia',
          points: 2500,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'wellness',
          features: ['10 aceites diferentes', '100% naturales', 'Difusor incluido', 'Guía de uso']
        },
        {
          id: 'sleep_tracker',
          name: 'Monitor de Sueño Avanzado',
          description: 'Dispositivo no invasivo para análisis del sueño',
          points: 4500,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'wellness',
          features: ['Sin contacto', 'Análisis completo', 'App detallada', 'Mejora automática']
        }
      ]
    },
    
    experiences: {
      name: 'Experiencias',
      icon: '🎯',
      items: [
        {
          id: 'spa_day',
          name: 'Día de Spa Completo',
          description: 'Experiencia de relajación y bienestar',
          points: 10000,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'experiences',
          features: ['Masaje terapéutico', 'Facial hidratante', 'Acceso sauna', 'Almuerzo saludable']
        },
        {
          id: 'nutrition_consultation',
          name: 'Consulta Nutricional Personalizada',
          description: 'Sesión con nutricionista certificado',
          points: 3000,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'experiences',
          features: ['Evaluación completa', 'Plan personalizado', '3 seguimientos', 'Recetas incluidas']
        },
        {
          id: 'fitness_training',
          name: 'Entrenamiento Personal (5 sesiones)',
          description: 'Sesiones con entrenador personal certificado',
          points: 7500,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'experiences',
          features: ['Evaluación inicial', 'Plan personalizado', 'Seguimiento progreso', 'Flexibilidad horarios']
        },
        {
          id: 'mindfulness_course',
          name: 'Curso de Mindfulness (8 semanas)',
          description: 'Programa completo de meditación y mindfulness',
          points: 5000,
          image: '/api/placeholder/300/200',
          inStock: true,
          category: 'experiences',
          features: ['8 sesiones grupales', 'Material digital', 'Práctica guiada', 'Certificado']
        }
      ]
    }
  }
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

export const leaderboards = {
  individual: {
    monthly: [
      { rank: 1, name: 'Ana M.', department: 'IT', points: 2450, avatar: '👩‍💻' },
      { rank: 2, name: 'Carlos R.', department: 'Ventas', points: 2380, avatar: '👨‍💼' },
      { rank: 3, name: 'María G.', department: 'RRHH', points: 2150, avatar: '👩‍💼' },
      { rank: 4, name: 'Luis P.', department: 'IT', points: 2050, avatar: '👨‍💻' },
      { rank: 5, name: 'Sofia L.', department: 'Marketing', points: 1980, avatar: '👩‍🎨' }
    ],
    allTime: [
      { rank: 1, name: 'Carlos R.', department: 'Ventas', points: 15750, avatar: '👨‍💼' },
      { rank: 2, name: 'Ana M.', department: 'IT', points: 14200, avatar: '👩‍💻' },
      { rank: 3, name: 'María G.', department: 'RRHH', points: 13850, avatar: '👩‍💼' },
      { rank: 4, name: 'Luis P.', department: 'IT', points: 12900, avatar: '👨‍💻' },
      { rank: 5, name: 'Sofia L.', department: 'Marketing', points: 11750, avatar: '👩‍🎨' }
    ]
  },
  departmental: {
    monthly: [
      { rank: 1, department: 'IT', avgPoints: 1850, participants: 45, totalPoints: 83250 },
      { rank: 2, department: 'Ventas', avgPoints: 1720, participants: 32, totalPoints: 55040 },
      { rank: 3, department: 'RRHH', avgPoints: 1680, participants: 18, totalPoints: 30240 },
      { rank: 4, department: 'Marketing', avgPoints: 1590, participants: 25, totalPoints: 39750 },
      { rank: 5, department: 'Administración', avgPoints: 1420, participants: 28, totalPoints: 39760 }
    ]
  }
};