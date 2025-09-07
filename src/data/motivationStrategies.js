// Estrategias de motivación y gamificación para empleados

export const motivationStrategies = {
  individual: {
    pointsSystem: {
      healthCheck: 100,
      exerciseSession: 50,
      nutritionLog: 25,
      sleepGoal: 30,
      stressReduction: 40,
      preventiveCare: 75
    },
    
    badges: [
      {
        id: 'early_bird',
        name: 'Madrugador',
        description: 'Completa chequeos antes de las 9 AM por 7 días consecutivos',
        icon: '🌅',
        rarity: 'common',
        points: 200
      },
      {
        id: 'consistency_king',
        name: 'Rey de la Consistencia',
        description: 'Realiza chequeos diarios por 30 días consecutivos',
        icon: '👑',
        rarity: 'rare',
        points: 500
      },
      {
        id: 'health_guru',
        name: 'Gurú de la Salud',
        description: 'Mantén puntaje de salud >90% por 3 meses',
        icon: '🧘‍♂️',
        rarity: 'legendary',
        points: 1000
      }
    ],
    
    challenges: [
      {
        id: 'weekly_warrior',
        name: 'Guerrero Semanal',
        description: 'Completa 5 chequeos en una semana',
        duration: 7,
        reward: 250,
        type: 'frequency'
      },
      {
        id: 'improvement_champion',
        name: 'Campeón del Mejoramiento',
        description: 'Mejora tu puntaje de salud en 10 puntos',
        duration: 30,
        reward: 400,
        type: 'improvement'
      }
    ]
  },
  
  team: {
    competitions: [
      {
        id: 'department_challenge',
        name: 'Desafío Departamental',
        description: 'Competencia entre departamentos por mayor participación',
        duration: 30,
        rewards: {
          first: 1000,
          second: 750,
          third: 500
        }
      }
    ],
    
    collaborativeGoals: [
      {
        id: 'company_wellness',
        name: 'Bienestar Empresarial',
        description: 'Alcanzar 80% de participación en toda la empresa',
        target: 0.8,
        reward: 2000,
        collective: true
      }
    ]
  },
  
  rewards: {
    categories: {
      health: {
        name: 'Salud y Bienestar',
        items: [
          { name: 'Consulta nutricional', points: 500 },
          { name: 'Masaje terapéutico', points: 750 },
          { name: 'Membresía gimnasio (1 mes)', points: 1000 }
        ]
      },
      
      lifestyle: {
        name: 'Estilo de Vida',
        items: [
          { name: 'Día libre adicional', points: 2000 },
          { name: 'Almuerzo saludable gratis', points: 300 },
          { name: 'Kit de productos saludables', points: 600 }
        ]
      },
      
      technology: {
        name: 'Tecnología',
        items: [
          { name: 'Smartwatch básico', points: 3000 },
          { name: 'Auriculares deportivos', points: 1500 },
          { name: 'Báscula inteligente', points: 2000 }
        ]
      }
    }
  }
};

export const deviceIntegrations = {
  wearables: [
    {
      name: 'Apple Watch',
      compatibility: 'high',
      metrics: ['heart_rate', 'steps', 'sleep', 'workout'],
      syncFrequency: 'real-time'
    },
    {
      name: 'Fitbit',
      compatibility: 'high',
      metrics: ['heart_rate', 'steps', 'sleep', 'stress'],
      syncFrequency: 'hourly'
    },
    {
      name: 'Samsung Galaxy Watch',
      compatibility: 'medium',
      metrics: ['heart_rate', 'steps', 'sleep'],
      syncFrequency: 'hourly'
    }
  ],
  
  smartphones: [
    {
      platform: 'iOS',
      healthApp: 'Apple Health',
      metrics: ['steps', 'heart_rate', 'sleep', 'nutrition'],
      permissions: ['health_read', 'motion_activity']
    },
    {
      platform: 'Android',
      healthApp: 'Google Fit',
      metrics: ['steps', 'heart_rate', 'weight', 'activity'],
      permissions: ['body_sensors', 'activity_recognition']
    }
  ],
  
  audioDevices: [
    {
      name: 'AirPods Pro',
      type: 'Auriculares Inteligentes',
      healthFeatures: [
        'Análisis de voz para detección de estrés',
        'Monitoreo de ruido ambiental',
        'Detección de patrones respiratorios'
      ],
      connectivity: 'Bluetooth 5.0',
      batteryLife: '6 horas'
    },
    {
      name: 'Sony WH-1000XM4',
      type: 'Auriculares con Cancelación de Ruido',
      healthFeatures: [
        'Reducción de estrés por ruido',
        'Análisis de calidad de audio',
        'Monitoreo de tiempo de uso'
      ],
      connectivity: 'Bluetooth 5.0',
      batteryLife: '30 horas'
    }
  ]
};

export const wearableDevices = [
  {
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    compatibility: 'high',
    metrics: [
      'Frecuencia cardíaca',
      'ECG',
      'Oxígeno en sangre',
      'Pasos',
      'Calorías',
      'Sueño',
      'Estrés',
      'Actividad física'
    ],
    batteryLife: '18 horas',
    waterResistance: '50m',
    specialFeatures: [
      'Detección de caídas',
      'SOS de emergencia',
      'Análisis de ciclo menstrual'
    ]
  },
  {
    name: 'Fitbit Sense 2',
    brand: 'Fitbit',
    compatibility: 'high',
    metrics: [
      'Frecuencia cardíaca',
      'Variabilidad cardíaca',
      'Temperatura corporal',
      'Pasos',
      'Sueño',
      'Estrés',
      'Actividad física'
    ],
    batteryLife: '6+ días',
    waterResistance: '50m',
    specialFeatures: [
      'Manejo de estrés',
      'GPS integrado',
      'Notificaciones inteligentes'
    ]
  },
  {
    name: 'Samsung Galaxy Watch6',
    brand: 'Samsung',
    compatibility: 'medium',
    metrics: [
      'Frecuencia cardíaca',
      'Presión arterial',
      'Composición corporal',
      'Pasos',
      'Sueño',
      'Actividad física'
    ],
    batteryLife: '40 horas',
    waterResistance: '50m',
    specialFeatures: [
      'Análisis de composición corporal',
      'Monitoreo de presión arterial',
      'Integración con Samsung Health'
    ]
  },
  {
    name: 'Garmin Venu 3',
    brand: 'Garmin',
    compatibility: 'medium',
    metrics: [
      'Frecuencia cardíaca',
      'Oxígeno en sangre',
      'Pasos',
      'Sueño',
      'Estrés',
      'Actividad física',
      'GPS'
    ],
    batteryLife: '14 días',
    waterResistance: '50m',
    specialFeatures: [
      'GPS de precisión',
      'Análisis avanzado de sueño',
      'Entrenamientos animados'
    ]
  }
];

export const smartphoneCapabilities = {
  sensors: [
    {
      name: 'Sensor de Frecuencia Cardíaca',
      description: 'Medición óptica mediante cámara y flash',
      accuracy: '±5 bpm',
      availability: 'Mayoría de smartphones modernos'
    },
    {
      name: 'Acelerómetro',
      description: 'Detección de movimiento y actividad física',
      accuracy: '±2% pasos',
      availability: 'Todos los smartphones'
    },
    {
      name: 'Giroscopio',
      description: 'Análisis de postura y equilibrio',
      accuracy: '±1° orientación',
      availability: 'Smartphones modernos'
    },
    {
      name: 'Micrófono',
      description: 'Análisis de voz y patrones respiratorios',
      accuracy: '±3% frecuencia',
      availability: 'Todos los smartphones'
    },
    {
      name: 'Cámara Frontal',
      description: 'Fotopletismografía remota (rPPG)',
      accuracy: '±8% FC, ±5% SpO2',
      availability: 'Smartphones con cámara frontal'
    },
    {
      name: 'Sensor de Proximidad',
      description: 'Detección de presencia y patrones de uso',
      accuracy: '±1cm',
      availability: 'Mayoría de smartphones'
    }
  ],
  
  healthApps: [
    {
      name: 'Apple Health',
      platform: 'iOS',
      metrics: [
        'Pasos y distancia',
        'Frecuencia cardíaca',
        'Sueño',
        'Nutrición',
        'Peso corporal',
        'Presión arterial'
      ],
      integration: 'Nativa iOS',
      dataSharing: 'HealthKit API'
    },
    {
      name: 'Google Fit',
      platform: 'Android',
      metrics: [
        'Actividad física',
        'Frecuencia cardíaca',
        'Peso',
        'Nutrición',
        'Sueño básico'
      ],
      integration: 'Google Services',
      dataSharing: 'Google Fit API'
    },
    {
      name: 'Samsung Health',
      platform: 'Android (Samsung)',
      metrics: [
        'Actividad completa',
        'Frecuencia cardíaca',
        'Estrés',
        'Sueño avanzado',
        'Nutrición',
        'Agua'
      ],
      integration: 'Samsung Ecosystem',
      dataSharing: 'Samsung Health SDK'
    }
  ],
  
  permissions: {
    required: [
      'CAMERA - Para análisis facial rPPG',
      'RECORD_AUDIO - Para análisis de voz',
      'BODY_SENSORS - Para sensores de salud',
      'ACTIVITY_RECOGNITION - Para detección de actividad'
    ],
    optional: [
      'LOCATION - Para contexto ambiental',
      'READ_PHONE_STATE - Para análisis de patrones de uso'
    ],
    privacy: {
      dataRetention: 'Máximo 30 días en dispositivo',
      encryption: 'AES-256 local',
      transmission: 'TLS 1.3 cifrado',
      sharing: 'Nunca sin consentimiento explícito'
    }
  }
};

// Estrategias específicas por tipo de empleado
export const employeeTypeStrategies = {
  sedentary: {
    name: 'Trabajadores Sedentarios',
    challenges: [
      'Recordatorios de movimiento cada hora',
      'Desafíos de pasos diarios',
      'Ejercicios de escritorio'
    ],
    rewards: [
      'Escritorio de pie ajustable',
      'Pelota de ejercicio',
      'Clases de yoga en línea'
    ]
  },
  
  active: {
    name: 'Trabajadores Activos',
    challenges: [
      'Competencias de resistencia',
      'Desafíos de fuerza',
      'Actividades en equipo'
    ],
    rewards: [
      'Equipo deportivo premium',
      'Membresía gimnasio especializado',
      'Suplementos nutricionales'
    ]
  },
  
  stressed: {
    name: 'Alto Estrés',
    challenges: [
      'Sesiones de meditación',
      'Técnicas de respiración',
      'Descansos programados'
    ],
    rewards: [
      'Sesiones de terapia',
      'Retiros de bienestar',
      'Aplicaciones de mindfulness premium'
    ]
  }
};