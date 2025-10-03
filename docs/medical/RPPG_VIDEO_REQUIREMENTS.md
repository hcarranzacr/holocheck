# 📹 **REQUISITOS DE VIDEO PARA ANÁLISIS rPPG**
## *Especificaciones Técnicas Fundamentales para Procesamiento Biométrico*

---

## 🎯 **RESUMEN EJECUTIVO**

El análisis rPPG (remote PhotoPlethysmoGraphy) requiere **especificaciones técnicas precisas** para detectar cambios mínimos en la coloración de la piel causados por el flujo sanguíneo. Estos requisitos son **fundamentales** para el éxito del producto HoloCheck.

---

## 📊 **REQUISITOS CRÍTICOS DE VIDEO**

### **1. RESOLUCIÓN MÍNIMA**
```javascript
MÍNIMO ABSOLUTO: 640x480 (VGA)
RECOMENDADO: 1280x720 (HD)
ÓPTIMO: 1920x1080 (Full HD)

// Configuración HoloCheck
const videoConstraints = {
  width: { ideal: 1280, min: 640 },
  height: { ideal: 720, min: 480 }
};
```

**📋 Justificación Científica:**
- **Resolución baja** → Menos píxeles faciales → Señal rPPG débil
- **640x480** permite ~50-100 píxeles de piel facial
- **1280x720** permite ~200-400 píxeles de piel facial
- **Más píxeles** = Mejor promediado de señal = Mayor precisión

### **2. FRAME RATE (CRÍTICO)**
```javascript
MÍNIMO ABSOLUTO: 15 FPS
RECOMENDADO: 30 FPS
ÓPTIMO: 60 FPS (para atletas de alto rendimiento)

// Configuración HoloCheck
const frameRateConstraints = {
  frameRate: { ideal: 30, min: 15 }
};
```

**🔬 Base Científica:**
- **Frecuencia cardíaca humana:** 40-200 BPM (0.67-3.33 Hz)
- **Teorema de Nyquist:** Frecuencia de muestreo ≥ 2x señal máxima
- **15 FPS** → Puede detectar hasta 450 BPM (suficiente)
- **30 FPS** → Mejor resolución temporal y precisión
- **60 FPS** → Óptimo para deportistas de élite

### **3. COMPRESIÓN Y FORMATO**
```javascript
// Formatos soportados (en orden de preferencia)
const preferredFormats = [
  'video/webm;codecs=vp9',    // Mejor compresión, menos artefactos
  'video/webm;codecs=vp8',    // Buena compresión
  'video/mp4;codecs=h264',    // Amplia compatibilidad
  'video/webm'                // Fallback
];

// Configuración de calidad
const qualitySettings = {
  videoBitsPerSecond: 2500000, // 2.5 Mbps - Balance calidad/tamaño
  mimeType: 'video/webm;codecs=vp9'
};
```

**⚠️ CRÍTICO:** Compresión excesiva destruye señal rPPG
- **H.264 alta compresión** → Artefactos que enmascaran señal
- **WebM VP9** → Mejor preservación de información cromática
- **Bitrate < 1 Mbps** → Pérdida significativa de señal

### **4. ILUMINACIÓN Y CONDICIONES**
```javascript
// Requisitos de iluminación
const lightingRequirements = {
  minimumLux: 200,           // Oficina bien iluminada
  optimalLux: 500-1000,      // Iluminación médica
  colorTemperature: '5000K-6500K', // Luz día
  uniformity: '>80%',        // Iluminación uniforme facial
  flickerFree: true          // Sin parpadeo 50/60Hz
};
```

**💡 Especificaciones de Iluminación:**
- **< 200 lux** → Señal rPPG muy débil o inexistente
- **Luz fluorescente** → Parpadeo 50/60Hz interfiere con señal
- **Luz LED** → Preferible, sin parpadeo
- **Luz solar directa** → Saturación, pérdida de información
- **Sombras faciales** → Reducen área de análisis útil

### **5. POSICIONAMIENTO FACIAL**
```javascript
// Área facial mínima en frame
const facialRequirements = {
  minFaceSize: '25%',        // 25% del frame mínimo
  optimalFaceSize: '40-60%', // Tamaño óptimo
  facePosition: 'center',    // Centrado en frame
  skinPixels: '>1000',       // Píxeles de piel detectables
  stability: '<2px/frame'    // Movimiento máximo
};
```

**👤 Criterios de Posicionamiento:**
- **Rostro < 25% frame** → Insuficientes píxeles para análisis
- **Rostro > 80% frame** → Pérdida de contexto, recorte
- **Movimiento > 5px/frame** → Artefactos de movimiento
- **Ángulo > 15°** → Pérdida de área facial frontal

---

## 🔬 **PROCESAMIENTO DE FRAMES PARA rPPG**

### **1. EXTRACCIÓN DE REGIONES DE INTERÉS (ROI)**
```javascript
// Regiones faciales para rPPG
const rppgROIs = {
  forehead: {
    area: '15-25% face height',
    position: 'upper_third',
    priority: 'high'         // Mejor señal rPPG
  },
  cheeks: {
    area: '20-30% face width each',
    position: 'middle_third',
    priority: 'medium'       // Buena señal, más movimiento
  },
  chin: {
    area: '10-15% face height',
    position: 'lower_third',
    priority: 'low'          // Señal débil
  }
};
```

### **2. ANÁLISIS CROMÁTICO**
```javascript
// Canales de color para rPPG
const colorChannels = {
  green: {
    wavelength: '495-570nm',
    absorption: 'hemoglobin_high',
    snr: 'highest',          // Mejor relación señal/ruido
    primary: true
  },
  red: {
    wavelength: '620-750nm',
    absorption: 'hemoglobin_medium',
    snr: 'medium',
    secondary: true
  },
  blue: {
    wavelength: '450-495nm',
    absorption: 'hemoglobin_low',
    snr: 'lowest',
    usage: 'motion_detection'  // Principalmente para detectar movimiento
  }
};
```

### **3. FILTRADO DE SEÑAL**
```javascript
// Pipeline de procesamiento rPPG
const rppgPipeline = {
  preprocessing: {
    detrending: 'polynomial_detrend',
    normalization: 'zero_mean_unit_variance',
    windowing: 'hamming_window'
  },
  filtering: {
    bandpass: {
      low: 0.7,    // 42 BPM
      high: 4.0,   // 240 BPM
      order: 4     // Butterworth filter
    },
    notch: [50, 60], // Eliminar interferencia eléctrica
    adaptive: true   // Filtro adaptativo para ruido
  },
  analysis: {
    fft_window: 30,      // 30 segundos para FFT
    overlap: 0.5,        // 50% overlap
    peak_detection: 'prominence_based'
  }
};
```

---

## 📈 **MÉTRICAS DE CALIDAD DE SEÑAL**

### **1. INDICADORES EN TIEMPO REAL**
```javascript
// Métricas de calidad implementadas en HoloCheck
const qualityMetrics = {
  snr: {
    minimum: 3.0,        // SNR mínimo para análisis confiable
    good: 6.0,           // SNR bueno
    excellent: 10.0      // SNR excelente
  },
  stability: {
    motion_threshold: 2.0,   // Píxeles de movimiento máximo
    illumination_var: 0.1,  // Variación de iluminación máxima
    face_detection_conf: 0.8 // Confianza detección facial mínima
  },
  signal_strength: {
    amplitude_min: 0.5,      // Amplitud mínima señal rPPG
    frequency_stability: 0.1, // Estabilidad frecuencial
    harmonic_ratio: 2.0      // Relación armónicos
  }
};
```

### **2. VALIDACIÓN AUTOMÁTICA**
```javascript
// Sistema de validación implementado
const validationSystem = {
  realtime_checks: {
    face_size: 'continuous',
    illumination: 'continuous',
    motion: 'continuous',
    signal_quality: 'every_second'
  },
  feedback_system: {
    visual_indicators: true,
    audio_prompts: false,
    text_guidance: true,
    quality_bars: true
  },
  auto_correction: {
    exposure_adjustment: true,
    roi_adaptation: true,
    filter_tuning: true
  }
};
```

---

## 🎯 **IMPLEMENTACIÓN EN HOLOCHECK**

### **1. CONFIGURACIÓN ÓPTIMA ACTUAL**
```javascript
// Configuración implementada en BiometricCapture.jsx
const holoCheckConfig = {
  video: {
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    frameRate: { ideal: 30, min: 15 },
    facingMode: 'user',
    // Configuraciones adicionales para rPPG
    brightness: { ideal: 0.5 },
    contrast: { ideal: 1.0 },
    saturation: { ideal: 1.0 }
  },
  processing: {
    roi_detection: 'automatic',
    color_space: 'RGB',
    analysis_window: 30,     // 30 segundos
    update_frequency: 1      // 1 Hz updates
  }
};
```

### **2. VALIDACIONES IMPLEMENTADAS**
```javascript
// Sistema de validación en AnuralogixInterface.jsx
const currentValidations = {
  face_detection: 'real_time',
  signal_quality: 'percentage_based',
  positioning_guides: 'visual_feedback',
  quality_indicators: 'color_coded_bars',
  user_guidance: 'text_and_visual'
};
```

---

## 🔬 **BASE CIENTÍFICA Y REFERENCIAS**

### **Estudios Fundamentales:**
1. **Verkruysse et al. (2008)** - "Remote plethysmographic imaging using ambient light"
2. **Poh et al. (2010)** - "Non-contact, automated cardiac pulse measurements using video imaging"
3. **De Haan & Jeanne (2013)** - "Robust pulse rate from chrominance-based rPPG"
4. **Wang et al. (2017)** - "Algorithmic principles of remote PPG"

### **Precisión Validada:**
- **MAE vs ECG:** 0.82-3.41 BPM (145 estudios analizados)
- **Correlación:** r = 0.72-0.99 dependiendo condiciones
- **Condiciones óptimas:** ±1 BPM precisión posible

---

## ⚠️ **LIMITACIONES Y CONSIDERACIONES**

### **1. Limitaciones Técnicas**
- **Tipo de piel:** Piel más oscura requiere mayor iluminación
- **Maquillaje:** Puede interferir con señal rPPG
- **Movimiento:** Movimientos > 5px/frame degradan señal
- **Respiración:** Puede crear artefactos en señal

### **2. Consideraciones Ambientales**
- **Temperatura:** Cambios térmicos afectan flujo sanguíneo
- **Ejercicio reciente:** Altera patrones cardiovasculares
- **Medicamentos:** Betabloqueadores, estimulantes afectan HR
- **Estado emocional:** Estrés/ansiedad altera variabilidad

---

## 🚀 **RECOMENDACIONES PARA HOLOCHECK**

### **1. Mejoras Inmediatas**
```javascript
// Implementar en próxima versión
const improvements = {
  adaptive_roi: 'Ajuste automático ROI según calidad señal',
  multi_roi: 'Análisis simultáneo frente, mejillas, cuello',
  quality_feedback: 'Feedback más granular de calidad',
  auto_optimization: 'Optimización automática parámetros'
};
```

### **2. Validación Clínica**
- **Comparación con ECG** en condiciones controladas
- **Validación multi-étnica** para diferentes tipos de piel
- **Pruebas de estrés** bajo diferentes condiciones ambientales
- **Validación longitudinal** para consistencia temporal

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **Requisitos Básicos ✅**
- [x] Resolución mínima 640x480
- [x] Frame rate mínimo 15 FPS
- [x] Detección facial automática
- [x] ROI extraction (frente principalmente)
- [x] Análisis canal verde RGB

### **Requisitos Avanzados 🔄**
- [ ] Multi-ROI analysis (frente + mejillas)
- [ ] Adaptive filtering basado en calidad señal
- [ ] Validación automática condiciones ambientales
- [ ] Compensación automática iluminación
- [ ] Machine learning para optimización personalizada

### **Validación Clínica 📋**
- [ ] Comparación ECG en 100+ sujetos
- [ ] Validación multi-étnica
- [ ] Pruebas bajo diferentes condiciones lumínicas
- [ ] Validación temporal (múltiples sesiones)

---

**📞 Para consultas técnicas:** desarrollo@holocheck.com  
**📚 Documentación completa:** `/docs/MEDICAL_DOCUMENTATION_COMPLETE.md`  
**🔬 Estudios científicos:** `/docs/MEDICAL_STUDIES_ANALYSIS.md`

---

*Este documento es fundamental para el éxito del producto HoloCheck y debe ser consultado antes de cualquier modificación al sistema de captura de video.*