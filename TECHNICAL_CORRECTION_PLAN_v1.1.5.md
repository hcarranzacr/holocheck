# 🔧 PLAN DE CORRECCIÓN TÉCNICA CRÍTICA - v1.1.5

## 🚨 **ANÁLISIS VISUAL CONFIRMADO DEL PDF**

### 📸 **SCREENSHOT DECODIFICADO:**
**PROBLEMA VISUAL CONFIRMADO:**
- ✅ **UI se muestra correctamente** - Panel de resultados visible
- ❌ **TODOS los valores muestran "--"** (guiones)
- ❌ **Frecuencia Cardíaca: -- BPM**
- ❌ **HRV (RMSSD): -- ms**
- ❌ **SpO₂: -- %**
- ❌ **Presión Arterial: --**
- ❌ **Frecuencia Fundamental: -- Hz**
- ❌ **Jitter: -- %**
- ❌ **Shimmer: -- %**
- ❌ **Estrés Vocal: -- %**

### 🎯 **CONFIRMACIÓN DEL DIAGNÓSTICO:**
**EL PROBLEMA ES DOBLE:**
1. **Motor de análisis NO calcula datos** (JSON = null)
2. **UI muestra "--" cuando datos son null** (correcto comportamiento)

---

## 🔧 **PLAN DE CORRECCIÓN INMEDIATA**

### **PASO 1: ACTIVAR MOTOR rPPG REAL**
**Archivo:** `/src/services/analysis/biometricProcessor.js`

**IMPLEMENTAR:**
```javascript
// Algoritmo rPPG básico funcional
export const extractHeartRateFromVideo = (videoFrames) => {
  // Extraer ROI facial
  const faceROI = detectFaceRegion(videoFrames);
  
  // Extraer señal de color verde (mejor para rPPG)
  const greenChannel = extractGreenChannel(faceROI);
  
  // Aplicar filtro pasa banda (0.7-4 Hz = 42-240 BPM)
  const filteredSignal = bandpassFilter(greenChannel, 0.7, 4.0);
  
  // FFT para encontrar frecuencia dominante
  const heartRate = calculateHeartRateFromFFT(filteredSignal);
  
  return heartRate;
};
```

### **PASO 2: IMPLEMENTAR CÁLCULOS REALES**
**BIOMARCADORES CRÍTICOS A ACTIVAR:**

**1. Frecuencia Cardíaca:**
```javascript
const heartRate = Math.round(extractHeartRateFromVideo(frames));
```

**2. HRV (RMSSD):**
```javascript
const rmssd = calculateRMSSD(rrIntervals);
```

**3. Saturación de Oxígeno (SpO₂):**
```javascript
const spo2 = calculateSpO2FromRatios(redSignal, irSignal);
```

**4. Análisis de Voz:**
```javascript
const fundamentalFreq = extractF0FromAudio(audioBuffer);
const jitter = calculateJitter(f0Contour);
const shimmer = calculateShimmer(audioAmplitude);
```

### **PASO 3: VALIDACIÓN DE DATOS**
**Antes de mostrar resultados:**
```javascript
const validateBiomarkers = (data) => {
  const validCount = Object.values(data).filter(v => v !== null).length;
  
  if (validCount === 0) {
    return {
      ...data,
      healthScore: null,
      analysisQuality: "Error - No se calcularon biomarcadores",
      recommendations: ["Error: Reinicie el análisis"]
    };
  }
  
  return data;
};
```

---

## 🎯 **CORRECCIONES ESPECÍFICAS REQUERIDAS**

### **ARCHIVO 1: biometricProcessor.js**
**LÍNEAS A MODIFICAR:**
- Línea ~50: Activar `processVideoFrames()`
- Línea ~120: Implementar `calculateHeartRate()`
- Línea ~180: Activar `processAudioData()`
- Línea ~250: Implementar validación de datos

### **ARCHIVO 2: BiometricCapture.jsx**
**LÍNEAS A VERIFICAR:**
- Línea ~800: Llamada a `biometricProcessor.analyze()`
- Línea ~850: Actualización de estado con datos reales
- Línea ~1200: Validación antes de mostrar resultados

---

## 📊 **TESTING POST-CORRECCIÓN**

### **CRITERIOS DE ÉXITO:**
1. **JSON Export debe mostrar:**
   ```json
   {
     "heartRate": 72,          // NO null
     "rmssd": 45.2,           // NO null
     "oxygenSaturation": 98,   // NO null
     "completedBiomarkers": 15 // NO 0
   }
   ```

2. **UI debe mostrar:**
   - Frecuencia Cardíaca: **72 BPM** (NO --)
   - HRV (RMSSD): **45.2 ms** (NO --)
   - SpO₂: **98%** (NO --)

3. **Health Score debe ser calculado:**
   - Basado en biomarcadores reales
   - NO valor fijo de 100

---

## 🚨 **COMMIT AL BRANCH MejorasRPPG**

### **MENSAJE DE COMMIT PROPUESTO:**
```
🔧 CRITICAL FIX v1.1.5: Activar motor análisis rPPG real

❌ PROBLEMA RESUELTO:
- Biomarcadores mostraban NULL/-- por motor inactivo
- JSON exportaba datos falsos
- UI mostraba guiones en lugar de valores

✅ CORRECCIONES IMPLEMENTADAS:
- Motor rPPG activado con algoritmos reales
- Cálculos de HRV, SpO2, frecuencia cardíaca
- Análisis de voz con jitter/shimmer funcional
- Validación de datos antes de mostrar

🎯 RESULTADO:
- Biomarcadores reales calculados
- UI muestra valores numéricos
- JSON con datos válidos para exportar

📊 BRANCH: MejorasRPPG
🔧 VERSIÓN: 1.1.5-CRITICAL
```

---

## ⚡ **ACCIÓN INMEDIATA PARA ALEX**

**PRIORIDAD P0 - CRÍTICO:**
1. **Implementar algoritmos rPPG funcionales**
2. **Activar cálculos de biomarcadores reales**
3. **Validar datos antes de exportar/mostrar**
4. **Commit a branch MejorasRPPG inmediatamente**

**ETA:** Máximo 2 horas para corrección completa
**TESTING:** Verificar que después de 30s se muestren números reales, no "--"