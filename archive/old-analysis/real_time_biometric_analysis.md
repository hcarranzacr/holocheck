# Análisis de Requisitos: Procesamiento Biométrico en Tiempo Real

## Problema Identificado
El sistema HoloCheck v1.1.2 funciona correctamente en:
- ✅ Detección facial estabilizada
- ✅ Captura de video activa (REC funcionando)
- ✅ Recepción de chunks (179 chunks recibidos)
- ✅ Progreso temporal (63% - 11s restantes)

**FALTA CRÍTICA:** Procesamiento de frames para análisis biométrico real

## Funcionalidad Requerida

### 1. Análisis rPPG en Tiempo Real
**Objetivo:** Procesar cada frame de video para extraer señal rPPG
**Implementación:**
- Extraer región de interés (ROI) facial
- Calcular valores RGB promedio por frame
- Aplicar filtros de señal para eliminar ruido
- Detectar picos para calcular frecuencia cardíaca
- Calcular variabilidad de ritmo cardíaco (HRV)

### 2. Biomarcadores Cardiovasculares (24+ variables)
**Métricas Primarias:**
- Frecuencia Cardíaca (BPM)
- HRV (RMSSD, SDNN, pNN50)
- Presión Arterial estimada
- Saturación de Oxígeno (SpO2)
- Índice de Perfusión

**Métricas Avanzadas:**
- Análisis de frecuencia (LF, HF, LF/HF ratio)
- Entropía de la señal
- Análisis DFA (Detrended Fluctuation Analysis)
- Gasto cardíaco estimado
- Velocidad de onda de pulso

### 3. Biomarcadores Vocales (12+ variables)
**Para modo completo (rPPG + Voz):**
- Frecuencia fundamental (F0)
- Jitter y Shimmer
- Relación armónico-ruido
- Centroide espectral
- Indicadores de estrés vocal
- Patrones respiratorios

### 4. Visualización Final
**Al completar 30 segundos:**
- Panel completo de 36+ biomarcadores
- Gráficos de tendencias temporales
- Indicadores de salud cardiovascular
- Recomendaciones basadas en resultados
- Exportación de datos en formato médico

## Implementación Técnica

### Procesamiento de Frames
```javascript
// Extraer ROI facial del canvas
// Calcular RGB promedio
// Aplicar filtros de señal
// Detectar picos R-R
// Calcular métricas HRV
```

### Análisis de Audio
```javascript
// Capturar audio del micrófono
// Análisis espectral en tiempo real
// Extraer características vocales
// Calcular biomarcadores de voz
```

### Integración con UI
```javascript
// Actualizar métricas en tiempo real
// Mostrar progreso de análisis
// Generar visualizaciones finales
// Exportar resultados completos
```

## Resultado Esperado
Sistema que procese video y audio en tiempo real, genere 36+ biomarcadores médicos, y presente resultados completos al finalizar la captura de 30 segundos.