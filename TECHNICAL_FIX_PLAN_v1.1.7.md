# 🔧 PLAN TÉCNICO ESPECÍFICO - REPARAR 7 BIOMARCADORES v1.1.7

## 📋 **PROBLEMA CONFIRMADO**
- ✅ Sistema calcula 7 biomarcadores
- ❌ UI muestra TODOS como "No calculado"
- ❌ Flujo de datos roto: processor → component

## 🎯 **OBJETIVO ESPECÍFICO**
**Mostrar los 7 biomarcadores calculados en la UI**

---

## 🔍 **DIAGNÓSTICO TÉCNICO INMEDIATO**

### **PASO 1: Verificar qué se calcula realmente**
**Archivo:** `/src/services/analysis/biometricProcessor.js`

**Agregar logs de debug:**
```javascript
// En calculateRealTimeMetrics() - línea ~320
console.log('🔍 DEBUG - Metrics calculados:', {
  heartRate: this.currentMetrics.rppg?.heartRate,
  perfusionIndex: this.currentMetrics.rppg?.perfusionIndex,
  respiratoryRate: this.currentMetrics.rppg?.respiratoryRate,
  oxygenSaturation: this.currentMetrics.rppg?.oxygenSaturation,
  totalCalculated: Object.keys(this.currentMetrics.rppg || {}).length
});

// Antes del triggerCallback
console.log('📤 Enviando datos a UI:', this.currentMetrics);
```

### **PASO 2: Verificar recepción en UI**
**Archivo:** `/src/components/BiometricCapture.jsx`

**Agregar logs en callback:**
```javascript
// En handleAnalysisUpdate o similar
const handleAnalysisUpdate = (data) => {
  console.log('📥 Datos recibidos en UI:', data);
  console.log('📊 Metrics recibidos:', data.metrics);
  
  if (data.metrics?.rppg) {
    console.log('✅ rPPG data found:', data.metrics.rppg);
    // Actualizar estado aquí
  } else {
    console.log('❌ No rPPG data received');
  }
};
```

---

## 🔧 **CORRECCIONES ESPECÍFICAS**

### **CORRECCIÓN 1: Asegurar triggerCallback**
```javascript
// En biometricProcessor.js
this.triggerCallback('onAnalysisUpdate', {
  status: 'analyzing',
  metrics: this.currentMetrics,
  calculatedBiomarkers: calculatedCount,
  timestamp: Date.now(),
  // FORZAR DATOS DIRECTOS
  directMetrics: this.currentMetrics.rppg
});
```

### **CORRECCIÓN 2: Forzar actualización estado UI**
```javascript
// En BiometricCapture.jsx
useEffect(() => {
  if (analysisResults && Object.keys(analysisResults).length > 0) {
    console.log('🔄 Estado actualizado:', analysisResults);
    // Forzar re-render
    setForceUpdate(prev => prev + 1);
  }
}, [analysisResults]);
```

### **CORRECCIÓN 3: Verificar renderizado**
```javascript
// En el render de BiometricCapture.jsx
const renderBiomarker = (value, label) => {
  console.log(`🎨 Rendering ${label}:`, value);
  
  if (value && value !== null && value !== undefined) {
    return <span className="text-green-600 font-semibold">{value}</span>;
  }
  return <span className="text-gray-400">No calculado</span>;
};
```

---

## 📊 **PLAN DE IMPLEMENTACIÓN**

### **FASE 1: DEBUG (10 min)**
1. Agregar logs en biometricProcessor.js
2. Agregar logs en BiometricCapture.jsx  
3. Ejecutar análisis y revisar consola

### **FASE 2: IDENTIFICAR FALLA (10 min)**
- ¿Se calculan los 7 biomarcadores?
- ¿Se ejecuta triggerCallback?
- ¿Se reciben datos en UI?
- ¿Se actualiza el estado?

### **FASE 3: CORREGIR (20 min)**
- Reparar la falla específica identificada
- Asegurar flujo: cálculo → callback → estado → render

### **FASE 4: VALIDAR (10 min)**
- Test de 30 segundos
- Verificar que UI muestre 7 valores reales
- Confirmar "No calculado" desaparece

---

## 🎯 **RESULTADO ESPERADO**

### **ANTES:**
```
UI: Todos "No calculado"
Consola: Sistema dice "7 calculados"
```

### **DESPUÉS:**
```
UI: 7 valores reales mostrados
Consola: Flujo de datos funcionando
```

---

## 🚀 **IMPLEMENTACIÓN INMEDIATA**

**PARA ALEX:**
1. **Agregar logs de debug** en ambos archivos
2. **Ejecutar análisis** y revisar consola del navegador
3. **Identificar dónde se rompe** el flujo de datos
4. **Aplicar corrección específica** según lo encontrado

**ETA:** 50 minutos máximo
**OBJETIVO:** Mostrar 7 biomarcadores reales en UI

---

**VERSIÓN:** v1.1.7-DATA-FLOW-DEBUG  
**BRANCH:** MejorasRPPG  
**FOCO:** Solo los 7 biomarcadores calculados