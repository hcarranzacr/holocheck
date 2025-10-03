# 🔍 MEJORA DE LOGS DE DEBUG - HoloCheck v1.1.8

## 📋 **PROBLEMA REPORTADO POR USUARIO**
- ✅ Inicia lectura del video
- ✅ Identifica 8 marcadores inicialmente  
- ❌ Video se detiene/no avanza
- ❌ Análisis no muestra resultados
- ❌ Error de red al final
- ❌ Proceso completo fallido

## 🎯 **OBJETIVO**
Implementar logs detallados para rastrear cada paso del proceso y identificar dónde falla exactamente.

---

## 🔧 **IMPLEMENTACIÓN DE LOGS DETALLADOS**

### **FASE 1: Logs en biometricProcessor.js**

```javascript
// Al inicio de startAnalysis()
console.log('🚀 [STEP 1] Iniciando análisis biométrico...');
console.log('📹 [VIDEO] Elemento video:', {
  readyState: videoElement?.readyState,
  videoWidth: videoElement?.videoWidth,
  videoHeight: videoElement?.videoHeight,
  currentTime: videoElement?.currentTime
});

// En extractRealRPPGSignal()
extractRealRPPGSignal() {
  console.log('📊 [STEP 2] Extrayendo señal rPPG...');
  
  const video = this.videoElement;
  if (!video || video.readyState < 2) {
    console.log('❌ [ERROR] Video no listo:', {
      exists: !!video,
      readyState: video?.readyState,
      required: 2
    });
    return null;
  }
  
  console.log('✅ [VIDEO] Video válido:', {
    width: video.videoWidth,
    height: video.videoHeight,
    time: video.currentTime
  });
  
  // ... resto del código con logs
  
  if (pixelCount < 100) {
    console.log('❌ [PIXELS] Insuficientes píxeles de piel:', pixelCount);
    return null;
  }
  
  console.log('✅ [SIGNAL] Señal extraída:', {
    value: signalValue,
    pixels: pixelCount,
    avgRGB: [avgR, avgG, avgB]
  });
  
  return signalValue;
}

// En calculateRealBiomarkers()
calculateRealBiomarkers() {
  console.log('🧮 [STEP 3] Calculando biomarcadores...');
  console.log('📈 [BUFFER] Estado del buffer:', {
    length: this.signalBuffer.length,
    required: 60,
    last5Values: this.signalBuffer.slice(-5)
  });
  
  const heartRate = this.calculateRealHeartRate();
  console.log('💓 [HR] Frecuencia cardíaca calculada:', heartRate);
  
  const hrv = heartRate ? this.calculateRealHRV() : {};
  console.log('📊 [HRV] Variabilidad calculada:', hrv);
  
  const respiratoryRate = this.calculateRealRespiratoryRate();
  console.log('🫁 [RR] Frecuencia respiratoria:', respiratoryRate);
  
  const perfusionIndex = this.calculateRealPerfusionIndex();
  console.log('🩸 [PI] Índice de perfusión:', perfusionIndex);
  
  // Contar biomarcadores calculados
  const calculatedMetrics = {};
  let count = 0;
  
  if (heartRate) { calculatedMetrics.heartRate = heartRate; count++; }
  if (hrv.rmssd) { calculatedMetrics.heartRateVariability = hrv.rmssd; count++; }
  if (respiratoryRate) { calculatedMetrics.respiratoryRate = respiratoryRate; count++; }
  if (perfusionIndex) { calculatedMetrics.perfusionIndex = perfusionIndex; count++; }
  
  console.log('📋 [METRICS] Biomarcadores calculados:', {
    count: count,
    metrics: calculatedMetrics
  });
  
  this.currentMetrics.rppg = calculatedMetrics;
  
  // Log del callback
  console.log('📤 [CALLBACK] Enviando datos a UI:', {
    status: 'analyzing',
    calculatedCount: count,
    metricsKeys: Object.keys(calculatedMetrics),
    timestamp: Date.now()
  });
  
  this.triggerCallback('onAnalysisUpdate', {
    status: 'analyzing',
    metrics: this.currentMetrics,
    calculatedBiomarkers: count,
    timestamp: Date.now()
  });
}

// En detectRealPeaks()
detectRealPeaks(signal) {
  console.log('🔍 [PEAKS] Detectando picos en señal...');
  console.log('📊 [SIGNAL] Estadísticas de señal:', {
    length: signal.length,
    min: Math.min(...signal),
    max: Math.max(...signal),
    mean: signal.reduce((a, b) => a + b, 0) / signal.length
  });
  
  const peaks = [];
  // ... código de detección ...
  
  console.log('⛰️ [PEAKS] Picos detectados:', {
    count: peaks.length,
    positions: peaks,
    threshold: threshold
  });
  
  return peaks;
}
```

### **FASE 2: Logs en BiometricCapture.jsx**

```javascript
// En el componente principal
useEffect(() => {
  console.log('🎬 [UI] Componente BiometricCapture montado');
}, []);

// En handleAnalysisUpdate
const handleAnalysisUpdate = (data) => {
  console.log('📥 [UI] Datos recibidos del processor:', {
    status: data.status,
    calculatedBiomarkers: data.calculatedBiomarkers,
    metricsKeys: data.metrics ? Object.keys(data.metrics.rppg || {}) : [],
    timestamp: new Date(data.timestamp).toLocaleTimeString()
  });
  
  if (data.metrics?.rppg) {
    console.log('✅ [UI] Actualizando estado con métricas:', data.metrics.rppg);
    
    setAnalysisResults(prevResults => {
      const newResults = {
        ...prevResults,
        ...data.metrics.rppg,
        completedBiomarkers: data.calculatedBiomarkers || 0
      };
      
      console.log('🔄 [STATE] Estado actualizado:', newResults);
      return newResults;
    });
  } else {
    console.log('❌ [UI] No hay datos rPPG en la respuesta');
  }
};

// En el render de cada biomarcador
const renderBiomarkerValue = (value, label) => {
  console.log(`🎨 [RENDER] Renderizando ${label}:`, {
    value: value,
    type: typeof value,
    isNull: value === null,
    isUndefined: value === undefined
  });
  
  if (value !== null && value !== undefined) {
    return <span className="text-green-600 font-semibold">{value}</span>;
  }
  return <span className="text-gray-400">No calculado</span>;
};

// En el inicio del análisis
const startAnalysis = async () => {
  console.log('🚀 [UI] Iniciando análisis desde UI...');
  
  try {
    const result = await processor.startAnalysis(videoRef.current, audioStream);
    console.log('✅ [UI] Análisis iniciado:', result);
  } catch (error) {
    console.error('❌ [UI] Error iniciando análisis:', error);
  }
};
```

### **FASE 3: Logs de Red y Errores**

```javascript
// En el processor, agregar logs de red
triggerCallback(event, data) {
  console.log('🌐 [NETWORK] Triggering callback:', {
    event: event,
    dataSize: JSON.stringify(data).length,
    timestamp: Date.now()
  });
  
  try {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
      console.log('✅ [NETWORK] Callback ejecutado exitosamente');
    } else {
      console.log('❌ [NETWORK] No hay callback registrado para:', event);
    }
  } catch (error) {
    console.error('❌ [NETWORK] Error en callback:', error);
  }
}

// Logs de errores globales
window.addEventListener('error', (event) => {
  console.error('🚨 [GLOBAL ERROR]:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 [UNHANDLED PROMISE]:', {
    reason: event.reason,
    promise: event.promise
  });
});
```

---

## 📊 **FUNCIÓN DE EXPORTACIÓN DE LOGS**

```javascript
// Agregar al BiometricCapture.jsx
const exportLogs = () => {
  const logs = [];
  
  // Capturar logs de consola
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.log = (...args) => {
    logs.push({
      type: 'log',
      timestamp: new Date().toISOString(),
      message: args.join(' ')
    });
    originalLog.apply(console, args);
  };
  
  console.error = (...args) => {
    logs.push({
      type: 'error',
      timestamp: new Date().toISOString(),
      message: args.join(' ')
    });
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    logs.push({
      type: 'warn',
      timestamp: new Date().toISOString(),
      message: args.join(' ')
    });
    originalWarn.apply(console, args);
  };
  
  // Función para descargar logs
  const downloadLogs = () => {
    const logContent = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holocheck-debug-${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return { downloadLogs, logs };
};
```

---

## 🎯 **PLAN DE IMPLEMENTACIÓN**

### **PASO 1: Implementar logs detallados (20 min)**
1. Agregar logs en biometricProcessor.js
2. Agregar logs en BiometricCapture.jsx
3. Implementar captura de errores

### **PASO 2: Agregar función de exportación (10 min)**
1. Implementar captura de logs
2. Agregar botón de descarga
3. Formatear logs para análisis

### **PASO 3: Test y análisis (15 min)**
1. Ejecutar análisis con logs activados
2. Exportar logs para revisión
3. Identificar punto exacto de falla

---

## 📋 **RESULTADO ESPERADO**

**LOGS DETALLADOS MOSTRARÁN:**
- ✅ Cuándo inicia el video
- ✅ Cuántos biomarcadores se detectan inicialmente
- ✅ Por qué se detiene la lectura del video
- ✅ Dónde falla el análisis
- ✅ Qué causa el error de red
- ✅ Flujo completo paso a paso

**ARCHIVO DE LOG EXPORTABLE:**
```
[2025-09-21T15:30:01.123Z] LOG: 🚀 [STEP 1] Iniciando análisis biométrico...
[2025-09-21T15:30:01.125Z] LOG: 📹 [VIDEO] Elemento video: {readyState: 4, videoWidth: 640}
[2025-09-21T15:30:01.150Z] LOG: 📊 [STEP 2] Extrayendo señal rPPG...
[2025-09-21T15:30:01.155Z] ERROR: ❌ [ERROR] Video no listo: {exists: true, readyState: 1}
```

---

**VERSIÓN:** v1.1.8-DEBUG-ENHANCED  
**BRANCH:** MejorasRPPG  
**OBJETIVO:** Identificar punto exacto de falla con logs detallados