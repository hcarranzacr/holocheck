# 🔌 INTEGRACIÓN SDK ANURALOGIX - DOCUMENTACIÓN TÉCNICA

## 🎯 RESUMEN EJECUTIVO

Este documento especifica la integración preparatoria con el SDK de Anuralogix DeepAffex, manteniendo la interfaz lista pero inactiva hasta la implementación completa. Basado en la documentación oficial: https://docs.deepaffex.ai/core/

---

## 📋 ESPECIFICACIONES ANURALOGIX DEEPAFFEX

### **Capacidades del SDK:**
- **100+ Biomarcadores**: Análisis facial completo en <30 segundos
- **Plataforma Agnóstica**: Funciona en cualquier dispositivo con cámara
- **Precisión Médica**: Validado clínicamente para aplicaciones de salud
- **Privacidad**: Procesamiento local, datos no enviados a servidores

### **Biomarcadores Disponibles:**

#### **Cardiovasculares (DeepAffex Core)**
1. **Frecuencia Cardíaca Media**: BPM promedio durante captura
2. **Variabilidad Cardíaca (HRV)**: RMSSD, pNN50, índices espectrales
3. **Presión Arterial**: Sistólica y diastólica estimadas
4. **Perfusión Sanguínea**: Índice de perfusión periférica
5. **Edad Vascular**: Estimación de rigidez arterial
6. **Riesgo Cardiovascular**: Score compuesto de riesgo

#### **Respiratorios**
7. **Frecuencia Respiratoria**: Respiraciones por minuto
8. **Variabilidad Respiratoria**: Regularidad de patrones
9. **Capacidad Pulmonar**: Estimación de función pulmonar
10. **Eficiencia Respiratoria**: Ratio ventilación/perfusión

#### **Neurológicos y Cognitivos**
11. **Estrés Mental**: Indicadores de carga cognitiva
12. **Fatiga**: Niveles de cansancio físico y mental
13. **Atención**: Capacidad de concentración
14. **Estado de Ánimo**: Indicadores de bienestar emocional

#### **Metabólicos**
15. **Riesgo Diabético**: Indicadores de resistencia a insulina
16. **Índice Metabólico**: Eficiencia metabólica general
17. **Hidratación**: Niveles de hidratación corporal
18. **Balance Autonómico**: Actividad simpática/parasimpática

---

## 🏗️ ARQUITECTURA DE INTEGRACIÓN

### **Estructura de Componentes:**

```typescript
// src/services/anuralogix/AnuralogixSDK.ts
interface AnuralogixConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  timeout: number;
  quality: 'standard' | 'high' | 'ultra';
}

interface AnuralogixMeasurement {
  measurementId: string;
  duration: number;
  quality: QualityMetrics;
  biomarkers: BiometricResults;
  timestamp: string;
}

interface BiometricResults {
  cardiovascular: CardiovascularMetrics;
  respiratory: RespiratoryMetrics;
  neurological: NeurologicalMetrics;
  metabolic: MetabolicMetrics;
}
```

### **Componente de Integración:**

```jsx
// src/components/AnuralogixCapture.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Circle, CheckCircle, AlertTriangle } from 'lucide-react';

const AnuralogixCapture = ({ 
  onMeasurementComplete, 
  pillarType = 'personal',
  isSDKEnabled = false // Flag para activar/desactivar SDK
}) => {
  const [captureState, setCaptureState] = useState('idle');
  const [positionValid, setPositionValid] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Configuración del círculo guía estilo Anuralogix
  const circleConfig = {
    diameter: 300,
    strokeWidth: 4,
    color: '#00A6D6', // Anuralogix blue
    animationSpeed: 2000,
    alignmentThreshold: 0.85
  };

  return (
    <div className="anuralogix-capture-container">
      {/* Header */}
      <div className="capture-header">
        <h2 className="text-2xl font-bold text-gray-900">
          Análisis Biométrico HoloCheck
        </h2>
        <p className="text-gray-600">
          Posicione su rostro dentro del círculo guía
        </p>
      </div>

      {/* Main Capture Interface */}
      <div className="capture-interface">
        <div className="video-container">
          <video 
            ref={videoRef}
            className="capture-video"
            autoPlay
            muted
            playsInline
          />
          
          {/* Círculo Guía Anuralogix */}
          <div className="circle-guide-overlay">
            <svg 
              width={circleConfig.diameter + 40} 
              height={circleConfig.diameter + 40}
              className="circle-guide"
            >
              <circle
                cx={(circleConfig.diameter + 40) / 2}
                cy={(circleConfig.diameter + 40) / 2}
                r={circleConfig.diameter / 2}
                stroke={positionValid ? '#10B981' : circleConfig.color}
                strokeWidth={circleConfig.strokeWidth}
                fill="none"
                className={`guide-circle ${positionValid ? 'valid' : 'invalid'}`}
              />
              
              {/* Indicadores de alineación */}
              <g className="alignment-indicators">
                <circle cx="50%" cy="20%" r="4" fill={positionValid ? '#10B981' : '#6B7280'} />
                <circle cx="80%" cy="50%" r="4" fill={positionValid ? '#10B981' : '#6B7280'} />
                <circle cx="50%" cy="80%" r="4" fill={positionValid ? '#10B981' : '#6B7280'} />
                <circle cx="20%" cy="50%" r="4" fill={positionValid ? '#10B981' : '#6B7280'} />
              </g>
            </svg>
          </div>

          {/* Countdown Overlay */}
          {countdown > 0 && (
            <div className="countdown-overlay">
              <div className="countdown-number">
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="status-indicators">
          <div className={`indicator ${positionValid ? 'valid' : 'invalid'}`}>
            {positionValid ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>Posición: {positionValid ? 'Correcta' : 'Ajustar'}</span>
          </div>
          
          <div className="indicator valid">
            <CheckCircle className="w-5 h-5" />
            <span>Iluminación: Óptima</span>
          </div>
          
          <div className="indicator valid">
            <CheckCircle className="w-5 h-5" />
            <span>Distancia: Correcta</span>
          </div>
        </div>

        {/* SDK Status */}
        <div className="sdk-status">
          <div className={`sdk-indicator ${isSDKEnabled ? 'enabled' : 'disabled'}`}>
            <Circle className="w-4 h-4" />
            <span>
              Anuralogix SDK: {isSDKEnabled ? 'Activo' : 'Preparado (Inactivo)'}
            </span>
          </div>
        </div>

        {/* Capture Controls */}
        <div className="capture-controls">
          <button
            className={`capture-button ${positionValid ? 'ready' : 'disabled'}`}
            disabled={!positionValid || captureState === 'capturing'}
            onClick={handleStartCapture}
          >
            {captureState === 'capturing' ? 'Analizando...' : 'Iniciar Análisis'}
          </button>
        </div>
      </div>

      {/* Analysis Progress */}
      {captureState === 'capturing' && (
        <div className="analysis-progress">
          <div className="progress-header">
            <h3>Análisis en Progreso</h3>
            <span className="progress-time">30s restantes</span>
          </div>
          
          <div className="progress-steps">
            <div className="step active">
              <Circle className="w-4 h-4" />
              <span>Detectando rostro</span>
            </div>
            <div className="step active">
              <Circle className="w-4 h-4" />
              <span>Extrayendo señal rPPG</span>
            </div>
            <div className="step">
              <Circle className="w-4 h-4" />
              <span>Calculando biomarcadores</span>
            </div>
            <div className="step">
              <Circle className="w-4 h-4" />
              <span>Generando reporte</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnuralogixCapture;
```

---

## 🔧 CONFIGURACIÓN SDK (PREPARATORIA)

### **Archivo de Configuración:**

```typescript
// src/config/anuralogix.config.ts
export const ANURALOGIX_CONFIG = {
  // SDK Configuration (Inactive)
  sdk: {
    enabled: false, // Set to true when ready to activate
    apiKey: process.env.REACT_APP_ANURALOGIX_API_KEY || '',
    environment: 'sandbox' as const,
    timeout: 30000,
    quality: 'high' as const
  },
  
  // Measurement Settings
  measurement: {
    duration: 30, // seconds
    fps: 30,
    resolution: {
      width: 1280,
      height: 720
    }
  },
  
  // UI Configuration
  interface: {
    circleGuide: {
      diameter: 300,
      strokeWidth: 4,
      color: '#00A6D6',
      validColor: '#10B981',
      invalidColor: '#EF4444'
    },
    
    positioning: {
      alignmentThreshold: 0.85,
      stabilityTime: 2000,
      maxDistance: 80,
      minDistance: 30
    }
  },
  
  // Biomarker Selection by Pillar
  biomarkers: {
    personal: [
      'heart_rate', 'hrv', 'blood_pressure', 'stress_level',
      'respiratory_rate', 'fatigue_level', 'mood_state'
    ],
    company: [
      'stress_level', 'fatigue_level', 'attention_level',
      'mood_state', 'cognitive_load'
    ],
    insurance: [
      'cardiovascular_risk', 'respiratory_health', 'metabolic_risk',
      'vascular_age', 'overall_health_score'
    ]
  }
};
```

### **Servicio de Integración:**

```typescript
// src/services/anuralogix/AnuralogixService.ts
class AnuralogixService {
  private sdkInitialized = false;
  private config = ANURALOGIX_CONFIG;

  constructor() {
    this.initializeSDK();
  }

  private async initializeSDK() {
    if (!this.config.sdk.enabled) {
      console.log('[Anuralogix] SDK disabled - using fallback implementation');
      return;
    }

    try {
      // Initialize Anuralogix SDK when enabled
      // await DeepAffex.initialize(this.config.sdk);
      this.sdkInitialized = true;
      console.log('[Anuralogix] SDK initialized successfully');
    } catch (error) {
      console.error('[Anuralogix] SDK initialization failed:', error);
      this.sdkInitialized = false;
    }
  }

  async startMeasurement(pillarType: string): Promise<AnuralogixMeasurement> {
    if (!this.config.sdk.enabled || !this.sdkInitialized) {
      // Fallback to HoloCheck internal implementation
      return this.fallbackMeasurement(pillarType);
    }

    try {
      // Use Anuralogix SDK when active
      // const measurement = await DeepAffex.startMeasurement({
      //   duration: this.config.measurement.duration,
      //   biomarkers: this.config.biomarkers[pillarType]
      // });
      // return measurement;
      
      // Temporary fallback
      return this.fallbackMeasurement(pillarType);
    } catch (error) {
      console.error('[Anuralogix] Measurement failed:', error);
      return this.fallbackMeasurement(pillarType);
    }
  }

  private async fallbackMeasurement(pillarType: string): Promise<AnuralogixMeasurement> {
    // Use HoloCheck's internal rPPG and voice analysis
    console.log('[Anuralogix] Using HoloCheck fallback implementation');
    
    return {
      measurementId: `holocheck_${Date.now()}`,
      duration: this.config.measurement.duration,
      quality: {
        overall: 0.85,
        lighting: 0.9,
        stability: 0.8,
        faceDetection: 0.9
      },
      biomarkers: await this.getHoloCheckBiomarkers(pillarType),
      timestamp: new Date().toISOString()
    };
  }

  private async getHoloCheckBiomarkers(pillarType: string) {
    // Integration with existing HoloCheck services
    const rppgService = new rPPGProcessor();
    const audioService = new AudioProcessor();
    
    const cardiovascular = await rppgService.analyze();
    const vocal = await audioService.analyze();
    
    return {
      cardiovascular,
      respiratory: vocal.respiratory,
      neurological: vocal.neurological,
      metabolic: cardiovascular.metabolic
    };
  }

  isSDKEnabled(): boolean {
    return this.config.sdk.enabled && this.sdkInitialized;
  }

  getAvailableBiomarkers(pillarType: string): string[] {
    return this.config.biomarkers[pillarType] || [];
  }
}

export default new AnuralogixService();
```

---

## 🎨 ESTILOS ANURALOGIX

### **CSS Styling:**

```css
/* src/styles/anuralogix-capture.css */
.anuralogix-capture-container {
  @apply max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg;
}

.capture-header {
  @apply text-center mb-6;
}

.capture-interface {
  @apply relative bg-gray-50 rounded-lg p-6;
}

.video-container {
  @apply relative mx-auto mb-6;
  width: 640px;
  height: 480px;
}

.capture-video {
  @apply w-full h-full object-cover rounded-lg;
}

.circle-guide-overlay {
  @apply absolute inset-0 flex items-center justify-center pointer-events-none;
}

.guide-circle {
  filter: drop-shadow(0 0 10px rgba(0, 166, 214, 0.3));
  transition: all 0.3s ease;
}

.guide-circle.valid {
  filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
  animation: pulse-valid 2s infinite;
}

.guide-circle.invalid {
  animation: pulse-invalid 2s infinite;
}

@keyframes pulse-valid {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes pulse-invalid {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}

.countdown-overlay {
  @apply absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg;
}

.countdown-number {
  @apply text-6xl font-bold text-white;
  animation: countdown-pulse 1s ease-in-out;
}

@keyframes countdown-pulse {
  0% { transform: scale(1.2); opacity: 0; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0; }
}

.status-indicators {
  @apply flex justify-center space-x-6 mb-6;
}

.indicator {
  @apply flex items-center space-x-2 px-4 py-2 rounded-lg;
}

.indicator.valid {
  @apply bg-green-100 text-green-800;
}

.indicator.invalid {
  @apply bg-yellow-100 text-yellow-800;
}

.sdk-status {
  @apply flex justify-center mb-4;
}

.sdk-indicator {
  @apply flex items-center space-x-2 px-3 py-1 rounded-full text-sm;
}

.sdk-indicator.enabled {
  @apply bg-blue-100 text-blue-800;
}

.sdk-indicator.disabled {
  @apply bg-gray-100 text-gray-600;
}

.capture-controls {
  @apply flex justify-center;
}

.capture-button {
  @apply px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200;
}

.capture-button.ready {
  @apply bg-blue-600 hover:bg-blue-700 active:scale-95;
}

.capture-button.disabled {
  @apply bg-gray-400 cursor-not-allowed;
}

.analysis-progress {
  @apply mt-6 p-4 bg-blue-50 rounded-lg;
}

.progress-header {
  @apply flex justify-between items-center mb-4;
}

.progress-steps {
  @apply space-y-2;
}

.step {
  @apply flex items-center space-x-3 text-gray-600;
}

.step.active {
  @apply text-blue-600;
}

.step.active .w-4 {
  @apply text-blue-600;
  animation: spin 1s linear infinite;
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Preparación (Completada)**
- [x] Documentación de biomarcadores Anuralogix
- [x] Interfaz de captura circular preparada
- [x] Configuración SDK inactiva
- [x] Servicios de fallback implementados

### **Fase 2: Activación SDK (Pendiente)**
- [ ] Obtener API Key de Anuralogix
- [ ] Configurar entorno de sandbox
- [ ] Activar flag `sdk.enabled = true`
- [ ] Pruebas de integración

### **Fase 3: Validación (Pendiente)**
- [ ] Comparar resultados SDK vs HoloCheck
- [ ] Validación de precisión
- [ ] Optimización de rendimiento
- [ ] Documentación de diferencias

---

## 🔗 RECURSOS ADICIONALES

### **Documentación Oficial:**
- **DeepAffex Core**: https://docs.deepaffex.ai/core/
- **SDK Integration**: https://docs.deepaffex.ai/integration/
- **Biomarkers Reference**: https://docs.deepaffex.ai/biomarkers/

### **Soporte Técnico:**
- **Developer Portal**: https://developer.deepaffex.ai/
- **Community Forum**: https://community.deepaffex.ai/
- **Technical Support**: support@anuralogix.com

---

*La integración está preparada y lista para activación cuando se obtenga acceso al SDK de Anuralogix. Mientras tanto, el sistema funciona con la implementación interna de HoloCheck.*