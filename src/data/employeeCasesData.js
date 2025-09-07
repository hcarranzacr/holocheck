// Casos reales de empleados con datos de selfie y voz simulados

export const employeeCases = [
  {
    id: 'emp_001',
    name: 'María González',
    age: 32,
    department: 'Recursos Humanos',
    position: 'Coordinadora',
    avatar: '👩‍💼',
    lastCheckup: '2025-01-15',
    
    // Datos del selfie simulado
    selfieData: {
      timestamp: '2025-01-15T10:30:00Z',
      duration: 45, // segundos
      quality: 'excellent',
      lighting: 'good',
      stability: 'stable',
      
      // Métricas cardiovasculares extraídas
      cardiovascular: {
        heartRate: 68,
        hrv: 42,
        bloodPressure: { systolic: 118, diastolic: 76 },
        oxygenSaturation: 98,
        respiratoryRate: 16,
        stressLevel: 0.3,
        fatigueLevel: 0.2
      },
      
      // Métricas faciales
      facial: {
        skinTone: 'healthy',
        eyeMovement: 'normal',
        blinkRate: 18,
        facialSymmetry: 0.95,
        jawTension: 0.1,
        foreheadTension: 0.2,
        eyeBagSeverity: 0.1,
        skinHydration: 0.8
      },
      
      // Indicadores de salud detectados
      healthIndicators: {
        overallHealth: 0.85,
        energyLevel: 0.8,
        sleepQuality: 0.75,
        nutritionalStatus: 0.8,
        hydrationLevel: 0.85,
        immuneSystem: 0.9,
        hormonalBalance: 0.8
      }
    },
    
    // Datos de voz simulados
    voiceData: {
      timestamp: '2025-01-15T10:32:00Z',
      duration: 32, // segundos
      textRead: "Mi nombre es María González y trabajo en el departamento de Recursos Humanos. Me siento bien hoy y estoy participando en el programa de salud preventiva de mi empresa. Creo que es importante cuidar nuestra salud y bienestar para tener una mejor calidad de vida.",
      
      // Métricas de voz
      acoustic: {
        fundamentalFrequency: 210, // Hz
        jitter: 0.008,
        shimmer: 0.045,
        harmonicToNoiseRatio: 18.5,
        voiceBreaks: 0,
        speakingRate: 165, // palabras por minuto
        pauseDuration: 0.8,
        volumeVariation: 0.15
      },
      
      // Indicadores de salud vocal
      healthIndicators: {
        respiratoryHealth: 0.9,
        neurologicalHealth: 0.85,
        psychologicalState: 0.8,
        cardiovascularHealth: 0.82,
        hormonalStatus: 0.78,
        energyLevel: 0.8,
        stressLevel: 0.25,
        cognitiveFunction: 0.9
      }
    },
    
    // Resultados combinados
    combinedResults: {
      overallScore: 0.83,
      riskLevel: 'low',
      recommendations: [
        'Mantener rutina de ejercicio actual',
        'Mejorar calidad del sueño (7-8 horas)',
        'Considerar técnicas de relajación para reducir estrés'
      ],
      nextCheckup: '2025-02-15'
    }
  },
  
  {
    id: 'emp_002',
    name: 'Carlos Rodríguez',
    age: 45,
    department: 'Finanzas',
    position: 'Gerente',
    avatar: '👨‍💼',
    lastCheckup: '2025-01-14',
    
    selfieData: {
      timestamp: '2025-01-14T14:15:00Z',
      duration: 48,
      quality: 'good',
      lighting: 'moderate',
      stability: 'stable',
      
      cardiovascular: {
        heartRate: 78,
        hrv: 35,
        bloodPressure: { systolic: 135, diastolic: 85 },
        oxygenSaturation: 96,
        respiratoryRate: 18,
        stressLevel: 0.6,
        fatigueLevel: 0.5
      },
      
      facial: {
        skinTone: 'pale',
        eyeMovement: 'slightly_rapid',
        blinkRate: 22,
        facialSymmetry: 0.92,
        jawTension: 0.4,
        foreheadTension: 0.6,
        eyeBagSeverity: 0.4,
        skinHydration: 0.6
      },
      
      healthIndicators: {
        overallHealth: 0.68,
        energyLevel: 0.6,
        sleepQuality: 0.5,
        nutritionalStatus: 0.65,
        hydrationLevel: 0.6,
        immuneSystem: 0.7,
        hormonalBalance: 0.65
      }
    },
    
    voiceData: {
      timestamp: '2025-01-14T14:17:00Z',
      duration: 35,
      textRead: "Soy Carlos Rodríguez, gerente del área de finanzas. Últimamente he tenido mucho trabajo y me siento un poco cansado, pero trato de mantenerme activo. Espero que este chequeo me ayude a entender mejor mi estado de salud.",
      
      acoustic: {
        fundamentalFrequency: 125,
        jitter: 0.015,
        shimmer: 0.08,
        harmonicToNoiseRatio: 15.2,
        voiceBreaks: 2,
        speakingRate: 145,
        pauseDuration: 1.2,
        volumeVariation: 0.25
      },
      
      healthIndicators: {
        respiratoryHealth: 0.75,
        neurologicalHealth: 0.8,
        psychologicalState: 0.6,
        cardiovascularHealth: 0.65,
        hormonalStatus: 0.6,
        energyLevel: 0.55,
        stressLevel: 0.65,
        cognitiveFunction: 0.8
      }
    },
    
    combinedResults: {
      overallScore: 0.65,
      riskLevel: 'moderate',
      recommendations: [
        'Implementar técnicas de manejo de estrés',
        'Mejorar hábitos de sueño (objetivo: 7-8 horas)',
        'Aumentar actividad física regular',
        'Considerar consulta con nutricionista',
        'Monitoreo de presión arterial'
      ],
      nextCheckup: '2025-02-14'
    }
  },
  
  {
    id: 'emp_003',
    name: 'Ana Pérez',
    age: 28,
    department: 'Tecnología',
    position: 'Desarrolladora',
    avatar: '👩‍💻',
    lastCheckup: '2025-01-13',
    
    selfieData: {
      timestamp: '2025-01-13T09:45:00Z',
      duration: 42,
      quality: 'excellent',
      lighting: 'excellent',
      stability: 'very_stable',
      
      cardiovascular: {
        heartRate: 65,
        hrv: 48,
        bloodPressure: { systolic: 110, diastolic: 70 },
        oxygenSaturation: 99,
        respiratoryRate: 14,
        stressLevel: 0.2,
        fatigueLevel: 0.15
      },
      
      facial: {
        skinTone: 'healthy',
        eyeMovement: 'normal',
        blinkRate: 16,
        facialSymmetry: 0.97,
        jawTension: 0.05,
        foreheadTension: 0.1,
        eyeBagSeverity: 0.05,
        skinHydration: 0.9
      },
      
      healthIndicators: {
        overallHealth: 0.92,
        energyLevel: 0.9,
        sleepQuality: 0.85,
        nutritionalStatus: 0.9,
        hydrationLevel: 0.95,
        immuneSystem: 0.95,
        hormonalBalance: 0.9
      }
    },
    
    voiceData: {
      timestamp: '2025-01-13T09:47:00Z',
      duration: 28,
      textRead: "Hola, soy Ana Pérez del equipo de desarrollo. Me cuido mucho con ejercicio regular y buena alimentación. Me siento con mucha energía y motivada en mi trabajo. Creo que mantener un equilibrio es clave para el bienestar.",
      
      acoustic: {
        fundamentalFrequency: 220,
        jitter: 0.005,
        shimmer: 0.025,
        harmonicToNoiseRatio: 22.1,
        voiceBreaks: 0,
        speakingRate: 175,
        pauseDuration: 0.6,
        volumeVariation: 0.1
      },
      
      healthIndicators: {
        respiratoryHealth: 0.95,
        neurologicalHealth: 0.9,
        psychologicalState: 0.9,
        cardiovascularHealth: 0.9,
        hormonalStatus: 0.85,
        energyLevel: 0.95,
        stressLevel: 0.15,
        cognitiveFunction: 0.95
      }
    },
    
    combinedResults: {
      overallScore: 0.91,
      riskLevel: 'very_low',
      recommendations: [
        'Continuar con rutina actual de ejercicio',
        'Mantener hábitos alimenticios saludables',
        'Considerar pausas regulares durante trabajo en computadora',
        'Excelente estado general, mantener estilo de vida'
      ],
      nextCheckup: '2025-04-13'
    }
  },
  
  {
    id: 'emp_004',
    name: 'Roberto Silva',
    age: 52,
    department: 'Operaciones',
    position: 'Supervisor',
    avatar: '👨‍🔧',
    lastCheckup: '2025-01-12',
    
    selfieData: {
      timestamp: '2025-01-12T11:20:00Z',
      duration: 50,
      quality: 'moderate',
      lighting: 'dim',
      stability: 'slightly_shaky',
      
      cardiovascular: {
        heartRate: 82,
        hrv: 28,
        bloodPressure: { systolic: 145, diastolic: 92 },
        oxygenSaturation: 94,
        respiratoryRate: 20,
        stressLevel: 0.7,
        fatigueLevel: 0.6
      },
      
      facial: {
        skinTone: 'reddish',
        eyeMovement: 'tired',
        blinkRate: 25,
        facialSymmetry: 0.88,
        jawTension: 0.5,
        foreheadTension: 0.7,
        eyeBagSeverity: 0.6,
        skinHydration: 0.5
      },
      
      healthIndicators: {
        overallHealth: 0.55,
        energyLevel: 0.5,
        sleepQuality: 0.4,
        nutritionalStatus: 0.5,
        hydrationLevel: 0.5,
        immuneSystem: 0.6,
        hormonalBalance: 0.55
      }
    },
    
    voiceData: {
      timestamp: '2025-01-12T11:22:00Z',
      duration: 38,
      textRead: "Roberto Silva, supervisor de operaciones. He estado trabajando turnos largos últimamente y me siento bastante cansado. Sé que necesito cuidarme más, especialmente con mi edad. Espero que este programa me ayude a mejorar mi salud.",
      
      acoustic: {
        fundamentalFrequency: 110,
        jitter: 0.025,
        shimmer: 0.12,
        harmonicToNoiseRatio: 12.8,
        voiceBreaks: 4,
        speakingRate: 130,
        pauseDuration: 1.5,
        volumeVariation: 0.35
      },
      
      healthIndicators: {
        respiratoryHealth: 0.6,
        neurologicalHealth: 0.7,
        psychologicalState: 0.5,
        cardiovascularHealth: 0.5,
        hormonalStatus: 0.55,
        energyLevel: 0.45,
        stressLevel: 0.75,
        cognitiveFunction: 0.7
      }
    },
    
    combinedResults: {
      overallScore: 0.53,
      riskLevel: 'high',
      recommendations: [
        'URGENTE: Consulta médica para evaluación cardiovascular',
        'Implementar plan de reducción de estrés inmediato',
        'Modificar horarios de trabajo si es posible',
        'Iniciar programa de ejercicio supervisado',
        'Evaluación nutricional completa',
        'Monitoreo semanal de presión arterial'
      ],
      nextCheckup: '2025-01-26'
    }
  },
  
  {
    id: 'emp_005',
    name: 'Laura Jiménez',
    age: 35,
    department: 'Marketing',
    position: 'Coordinadora',
    avatar: '👩‍🎨',
    lastCheckup: '2025-01-11',
    
    selfieData: {
      timestamp: '2025-01-11T16:30:00Z',
      duration: 44,
      quality: 'good',
      lighting: 'good',
      stability: 'stable',
      
      cardiovascular: {
        heartRate: 72,
        hrv: 38,
        bloodPressure: { systolic: 125, diastolic: 80 },
        oxygenSaturation: 97,
        respiratoryRate: 17,
        stressLevel: 0.45,
        fatigueLevel: 0.35
      },
      
      facial: {
        skinTone: 'slightly_pale',
        eyeMovement: 'normal',
        blinkRate: 20,
        facialSymmetry: 0.93,
        jawTension: 0.25,
        foreheadTension: 0.35,
        eyeBagSeverity: 0.25,
        skinHydration: 0.7
      },
      
      healthIndicators: {
        overallHealth: 0.72,
        energyLevel: 0.7,
        sleepQuality: 0.65,
        nutritionalStatus: 0.75,
        hydrationLevel: 0.7,
        immuneSystem: 0.75,
        hormonalBalance: 0.7
      }
    },
    
    voiceData: {
      timestamp: '2025-01-11T16:32:00Z',
      duration: 30,
      textRead: "Soy Laura Jiménez del equipo de marketing. Últimamente he tenido algunos proyectos demandantes, pero trato de mantener un equilibrio. Me gusta hacer yoga y caminar. Espero que este chequeo me dé ideas para mejorar mi bienestar.",
      
      acoustic: {
        fundamentalFrequency: 205,
        jitter: 0.012,
        shimmer: 0.055,
        harmonicToNoiseRatio: 16.8,
        voiceBreaks: 1,
        speakingRate: 160,
        pauseDuration: 0.9,
        volumeVariation: 0.18
      },
      
      healthIndicators: {
        respiratoryHealth: 0.8,
        neurologicalHealth: 0.82,
        psychologicalState: 0.7,
        cardiovascularHealth: 0.75,
        hormonalStatus: 0.68,
        energyLevel: 0.72,
        stressLevel: 0.4,
        cognitiveFunction: 0.85
      }
    },
    
    combinedResults: {
      overallScore: 0.73,
      riskLevel: 'low_moderate',
      recommendations: [
        'Continuar con actividades de yoga y caminata',
        'Implementar técnicas de respiración para estrés',
        'Optimizar horarios de sueño (acostarse más temprano)',
        'Considerar suplementos para mejorar energía',
        'Mantener hidratación adecuada'
      ],
      nextCheckup: '2025-03-11'
    }
  }
];

// Datos agregados para análisis
export const aggregatedCaseData = {
  totalEmployees: employeeCases.length,
  averageAge: 38.4,
  departmentDistribution: {
    'Recursos Humanos': 1,
    'Finanzas': 1,
    'Tecnología': 1,
    'Operaciones': 1,
    'Marketing': 1
  },
  riskLevelDistribution: {
    'very_low': 1,
    'low': 1,
    'low_moderate': 1,
    'moderate': 1,
    'high': 1
  },
  averageScores: {
    overall: 0.728,
    cardiovascular: 0.75,
    respiratory: 0.78,
    psychological: 0.72,
    neurological: 0.814
  },
  commonRecommendations: [
    'Técnicas de manejo de estrés',
    'Mejora en calidad del sueño',
    'Actividad física regular',
    'Hidratación adecuada',
    'Evaluación médica preventiva'
  ]
};

// Configuración de permisos para cámara y micrófono
export const permissionsConfig = {
  camera: {
    required: true,
    constraints: {
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { min: 15, ideal: 30, max: 60 },
        facingMode: 'user'
      }
    },
    fallbackMessage: 'La cámara es necesaria para realizar el análisis facial (rPPG). Por favor, permite el acceso a la cámara.',
    troubleshooting: [
      'Verifica que tu navegador tenga permisos para acceder a la cámara',
      'Asegúrate de que ninguna otra aplicación esté usando la cámara',
      'Intenta refrescar la página y volver a dar permisos',
      'Si usas Chrome, verifica la configuración de privacidad'
    ]
  },
  
  microphone: {
    required: true,
    constraints: {
      audio: {
        sampleRate: { min: 16000, ideal: 44100, max: 48000 },
        channelCount: { min: 1, ideal: 1, max: 2 },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    },
    fallbackMessage: 'El micrófono es necesario para el análisis de voz. Por favor, permite el acceso al micrófono.',
    troubleshooting: [
      'Verifica que tu navegador tenga permisos para acceder al micrófono',
      'Asegúrate de que el micrófono esté conectado y funcionando',
      'Revisa el volumen del micrófono en la configuración del sistema',
      'Intenta usar auriculares con micrófono si tienes problemas'
    ]
  },
  
  privacy: {
    dataRetention: '7 días para datos sin procesar, permanente para métricas anonimizadas',
    encryption: 'AES-256 para datos en reposo, TLS 1.3 para transmisión',
    sharing: 'Los datos nunca se comparten con terceros sin consentimiento explícito',
    deletion: 'Puedes solicitar la eliminación de tus datos en cualquier momento',
    anonymization: 'Los datos se anonimizan antes de ser incluidos en análisis agregados'
  }
};

// Simulación de análisis en tiempo real
export const simulateRealTimeAnalysis = (duration = 30) => {
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i <= duration; i++) {
    results.push({
      timestamp: startTime + (i * 1000),
      heartRate: 65 + Math.sin(i * 0.1) * 8 + Math.random() * 4,
      stressLevel: 0.3 + Math.sin(i * 0.05) * 0.2 + Math.random() * 0.1,
      oxygenSaturation: 97 + Math.random() * 2,
      respiratoryRate: 16 + Math.sin(i * 0.08) * 2 + Math.random() * 1,
      facialTension: 0.2 + Math.sin(i * 0.12) * 0.15 + Math.random() * 0.05,
      blinkRate: 18 + Math.random() * 4,
      signalQuality: 0.8 + Math.random() * 0.2
    });
  }
  
  return results;
};